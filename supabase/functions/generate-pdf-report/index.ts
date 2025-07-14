import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';
import { checkUserPlanLimit, incrementUserUsage, getUserIdFromRequest } from "../_shared/plan-utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePDFRequest {
  url: string;
  user_id: string;
  include_ai?: boolean;
  scan_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, user_id, include_ai = false, scan_id } = await req.json() as GeneratePDFRequest;

    if (!url || !user_id) {
      return new Response(
        JSON.stringify({ error: 'URL and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user plan limits for PDF feature
    console.log(`Checking PDF plan limits for user: ${user_id}`);
    const planCheck = await checkUserPlanLimit(user_id, 'pdf');
    
    if (!planCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: planCheck.error,
          plan: planCheck.plan,
          limitExceeded: true,
          featureRequired: 'pdf'
        }), 
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    console.log(`PDF plan check passed for user: ${user_id}, remaining: ${planCheck.plan?.remaining_count}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Generating PDF report for:', { url, user_id, include_ai, scan_id });

    // Fetch scan data
    let scanQuery = supabase
      .from('scans')
      .select('*')
      .eq('url', url);

    if (scan_id) {
      scanQuery = scanQuery.eq('id', scan_id);
    }

    const { data: scanData, error: scanError } = await scanQuery.single();

    if (scanError) {
      console.error('Error fetching scan data:', scanError);
      return new Response(
        JSON.stringify({ error: 'Scan data not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch semantic analysis data if requested
    let semanticData = null;
    if (include_ai) {
      const { data, error } = await supabase
        .from('semantic_results')
        .select('*')
        .eq('url', url)
        .eq('user_id', user_id)
        .maybeSingle();

      if (!error && data) {
        semanticData = data;
      }
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Page dimensions
    const pageWidth = 595.28; // A4 width
    const pageHeight = 841.89; // A4 height
    const margin = 50;
    const contentWidth = pageWidth - 2 * margin;

    // Helper function to add a new page
    const addPage = () => {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      return page;
    };

    // Cover Page
    const coverPage = addPage();
    let yPosition = pageHeight - margin;

    // Title
    coverPage.drawText('SEO Analysis Report', {
      x: margin,
      y: yPosition,
      size: 32,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 60;

    // Domain
    const domain = new URL(url).hostname;
    coverPage.drawText(domain, {
      x: margin,
      y: yPosition,
      size: 20,
      font: timesRoman,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 40;

    // Report date
    const reportDate = new Date().toLocaleDateString('vi-VN');
    coverPage.drawText(`Ngày tạo báo cáo: ${reportDate}`, {
      x: margin,
      y: yPosition,
      size: 14,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPosition -= 80;

    // Report type
    const reportType = include_ai ? 'Phân tích SEO + AI Semantic' : 'Phân tích SEO cơ bản';
    coverPage.drawText(`Loại báo cáo: ${reportType}`, {
      x: margin,
      y: yPosition,
      size: 16,
      font: timesRoman,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Table of Contents Page
    const tocPage = addPage();
    yPosition = pageHeight - margin;

    tocPage.drawText('Mục lục', {
      x: margin,
      y: yPosition,
      size: 24,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 40;

    const tocItems = [
      '1. Tóm tắt tổng quan',
      '2. Phân tích SEO cơ bản',
      ...(include_ai ? ['3. Phân tích AI Semantic', '4. So sánh SEO vs AI SEO'] : []),
      `${include_ai ? '5' : '3'}. Gợi ý cải thiện`,
      `${include_ai ? '6' : '4'}. Kết luận và khuyến nghị`,
    ];

    tocItems.forEach((item, index) => {
      tocPage.drawText(item, {
        x: margin + 20,
        y: yPosition - (index * 25),
        size: 14,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
    });

    // Summary Page
    const summaryPage = addPage();
    yPosition = pageHeight - margin;

    summaryPage.drawText('1. Tóm tắt tổng quan', {
      x: margin,
      y: yPosition,
      size: 20,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 40;

    // SEO Score
    const seoData = scanData.seo as any;
    if (seoData && seoData.score !== undefined) {
      summaryPage.drawText(`Điểm SEO hiện tại: ${seoData.score}/100`, {
        x: margin,
        y: yPosition,
        size: 16,
        font: timesRoman,
        color: seoData.score >= 80 ? rgb(0, 0.8, 0) : seoData.score >= 60 ? rgb(0.8, 0.8, 0) : rgb(0.8, 0, 0),
      });
      yPosition -= 30;
    }

    // Key issues
    if (seoData && seoData.issues) {
      const issues = Array.isArray(seoData.issues) ? seoData.issues : [];
      summaryPage.drawText(`Số vấn đề phát hiện: ${issues.length}`, {
        x: margin,
        y: yPosition,
        size: 14,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 60;

      // List top issues
      if (issues.length > 0) {
        summaryPage.drawText('Các vấn đề chính:', {
          x: margin,
          y: yPosition,
          size: 16,
          font: timesBold,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= 25;

        issues.slice(0, 5).forEach((issue: any, index: number) => {
          const issueText = `• ${issue.type || issue.message || 'Vấn đề SEO'}`;
          summaryPage.drawText(issueText, {
            x: margin + 20,
            y: yPosition - (index * 20),
            size: 12,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4),
          });
        });
        yPosition -= (Math.min(issues.length, 5) * 20 + 20);
      }
    }

    // AI Semantic Analysis (if included)
    if (include_ai && semanticData) {
      const aiPage = addPage();
      yPosition = pageHeight - margin;

      aiPage.drawText('3. Phân tích AI Semantic', {
        x: margin,
        y: yPosition,
        size: 20,
        font: timesBold,
        color: rgb(0.2, 0.3, 0.8),
      });
      yPosition -= 40;

      // Main topic
      if (semanticData.main_topic) {
        aiPage.drawText(`Chủ đề chính: ${semanticData.main_topic}`, {
          x: margin,
          y: yPosition,
          size: 14,
          font: timesRoman,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= 25;
      }

      // Search intent
      if (semanticData.search_intent) {
        aiPage.drawText(`Intent tìm kiếm: ${semanticData.search_intent}`, {
          x: margin,
          y: yPosition,
          size: 14,
          font: timesRoman,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= 25;
      }

      // Missing topics
      const missingTopics = semanticData.missing_topics as string[] || [];
      if (missingTopics.length > 0) {
        yPosition -= 20;
        aiPage.drawText('Chủ đề cần bổ sung:', {
          x: margin,
          y: yPosition,
          size: 16,
          font: timesBold,
          color: rgb(0.8, 0.3, 0.3),
        });
        yPosition -= 25;

        missingTopics.slice(0, 8).forEach((topic: string, index: number) => {
          aiPage.drawText(`• ${topic}`, {
            x: margin + 20,
            y: yPosition - (index * 18),
            size: 12,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5),
          });
        });
      }

      // Related entities
      const entities = semanticData.entities as string[] || [];
      if (entities.length > 0) {
        yPosition -= (missingTopics.length * 18 + 40);
        aiPage.drawText('Thực thể liên quan:', {
          x: margin,
          y: yPosition,
          size: 16,
          font: timesBold,
          color: rgb(0.3, 0.6, 0.3),
        });
        yPosition -= 25;

        entities.slice(0, 10).forEach((entity: string, index: number) => {
          aiPage.drawText(`• ${entity}`, {
            x: margin + 20,
            y: yPosition - (index * 16),
            size: 11,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4),
          });
        });
      }
    }

    // Recommendations Page
    const recommendationsPage = addPage();
    yPosition = pageHeight - margin;

    recommendationsPage.drawText(`${include_ai ? '5' : '3'}. Gợi ý cải thiện`, {
      x: margin,
      y: yPosition,
      size: 20,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 40;

    const recommendations = [
      'Tối ưu hóa meta title và description',
      'Cải thiện cấu trúc heading (H1, H2, H3)',
      'Thêm alt text cho hình ảnh',
      'Tối ưu hóa tốc độ tải trang',
      'Cải thiện trải nghiệm người dùng',
      ...(include_ai ? ['Bổ sung nội dung theo phân tích semantic', 'Tối ưu intent tìm kiếm'] : []),
    ];

    recommendations.forEach((rec, index) => {
      recommendationsPage.drawText(`${index + 1}. ${rec}`, {
        x: margin,
        y: yPosition - (index * 25),
        size: 14,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
    });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Upload to Supabase Storage
    const fileName = `seo-report-${domain}-${Date.now()}.pdf`;
    const filePath = `reports/${user_id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf-reports')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pdf-reports')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Save report record to database
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        user_id,
        scan_id,
        url,
        file_url: fileUrl,
        report_type: 'seo_analysis',
        include_ai,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error saving report record:', reportError);
      return new Response(
        JSON.stringify({ error: 'Failed to save report record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('PDF report generated successfully:', { fileName, fileUrl });

    // Increment usage count after successful PDF generation
    const usageIncremented = await incrementUserUsage(user_id);
    if (usageIncremented) {
      console.log(`Usage incremented for PDF generation, user: ${user_id}`);
    } else {
      console.error(`Failed to increment usage for PDF generation, user: ${user_id}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        file_url: fileUrl,
        report_id: reportData.id,
        file_name: fileName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-pdf-report function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});