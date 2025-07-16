import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';
import { checkUserPlanLimit, incrementUserUsage, getUserIdFromRequest } from "../_shared/plan-utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePDFRequest {
  url?: string;
  user_id: string;
  include_ai?: boolean;
  scan_id?: string;
  report_type?: 'seo_analysis' | 'content-plan';
  main_topic?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, user_id, include_ai = false, scan_id, report_type = 'seo_analysis', main_topic } = await req.json() as GeneratePDFRequest;

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For content-plan type, we need main_topic
    if (report_type === 'content-plan' && !main_topic) {
      return new Response(
        JSON.stringify({ error: 'main_topic is required for content-plan reports' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For seo_analysis type, we need url
    if (report_type === 'seo_analysis' && !url) {
      return new Response(
        JSON.stringify({ error: 'url is required for seo_analysis reports' }),
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

    console.log('Generating PDF report for:', { url, user_id, include_ai, scan_id, report_type, main_topic });

    // Handle different report types
    if (report_type === 'content-plan') {
      return await generateContentPlanPDF(supabase, user_id, main_topic!, corsHeaders);
    }

    // Original SEO analysis logic
    let scanData = null;
    let semanticData = null;

    if (url) {
      // Fetch scan data
      let scanQuery = supabase
        .from('scans')
        .select('*')
        .eq('url', url);

      if (scan_id) {
        scanQuery = scanQuery.eq('id', scan_id);
      }

      const { data: scanResult, error: scanError } = await scanQuery.single();

      if (scanError) {
        console.error('Error fetching scan data:', scanError);
        return new Response(
          JSON.stringify({ error: 'Scan data not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      scanData = scanResult;

      // Fetch semantic analysis data if requested
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
    const domain = url ? new URL(url).hostname : 'Content Plan';
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
    const fileName = `seo-report-${domain.replace(/\./g, '-')}-${Date.now()}.pdf`;
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
        url: url || '',
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

async function generateContentPlanPDF(supabase: any, user_id: string, main_topic: string, corsHeaders: any) {
  console.log(`Generating content plan PDF for user: ${user_id}, topic: ${main_topic}`);

  // Fetch content plans from database
  const { data: contentPlans, error: plansError } = await supabase
    .from('content_plans')
    .select('*')
    .eq('user_id', user_id)
    .eq('main_topic', main_topic)
    .order('plan_date', { ascending: true });

  if (plansError) {
    console.error('Error fetching content plans:', plansError);
    return new Response(
      JSON.stringify({ error: 'Content plans not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!contentPlans || contentPlans.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No content plans found for this topic' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Page dimensions
  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const margin = 40;
  const contentWidth = pageWidth - 2 * margin;

  // Helper function to add a new page
  const addPage = () => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    return page;
  };

  // Cover Page
  const coverPage = addPage();
  let yPosition = pageHeight - margin;

  // Logo placeholder area
  coverPage.drawRectangle({
    x: margin,
    y: yPosition - 60,
    width: 120,
    height: 50,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });
  
  coverPage.drawText('LOGO', {
    x: margin + 40,
    y: yPosition - 40,
    size: 14,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Title
  coverPage.drawText('Kế Hoạch Nội Dung 6 Tháng', {
    x: margin,
    y: yPosition - 120,
    size: 28,
    font: timesBold,
    color: rgb(0.1, 0.4, 0.8),
  });

  // Main topic
  coverPage.drawText(`Chủ đề: ${main_topic}`, {
    x: margin,
    y: yPosition - 160,
    size: 18,
    font: timesRoman,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Planning date
  const planningDate = new Date().toLocaleDateString('vi-VN');
  coverPage.drawText(`Ngày lập kế hoạch: ${planningDate}`, {
    x: margin,
    y: yPosition - 190,
    size: 14,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Summary stats
  coverPage.drawText(`Tổng số bài viết: ${contentPlans.length}`, {
    x: margin,
    y: yPosition - 220,
    size: 14,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  const startDate = new Date(contentPlans[0].plan_date).toLocaleDateString('vi-VN');
  const endDate = new Date(contentPlans[contentPlans.length - 1].plan_date).toLocaleDateString('vi-VN');
  coverPage.drawText(`Thời gian: ${startDate} - ${endDate}`, {
    x: margin,
    y: yPosition - 245,
    size: 14,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Content overview by search intent
  const intentCounts = contentPlans.reduce((acc: any, plan) => {
    acc[plan.search_intent] = (acc[plan.search_intent] || 0) + 1;
    return acc;
  }, {});

  yPosition -= 300;
  coverPage.drawText('Phân bố theo Search Intent:', {
    x: margin,
    y: yPosition,
    size: 16,
    font: timesBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  Object.entries(intentCounts).forEach(([intent, count], index) => {
    coverPage.drawText(`• ${intent}: ${count} bài viết`, {
      x: margin + 20,
      y: yPosition - 25 - (index * 20),
      size: 12,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  // Content Plan Table Pages
  const itemsPerPage = 12;
  const totalPages = Math.ceil(contentPlans.length / itemsPerPage);

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const tablePage = addPage();
    yPosition = pageHeight - margin;

    // Page header
    tablePage.drawText(`Kế Hoạch Nội Dung - Trang ${pageNum + 1}/${totalPages}`, {
      x: margin,
      y: yPosition,
      size: 18,
      font: timesBold,
      color: rgb(0.1, 0.4, 0.8),
    });
    yPosition -= 40;

    // Table headers
    const colWidths = [80, 220, 80, 175]; // Ngày đăng, Tiêu đề, Intent, Ghi chú
    const colPositions = [
      margin,
      margin + colWidths[0],
      margin + colWidths[0] + colWidths[1],
      margin + colWidths[0] + colWidths[1] + colWidths[2]
    ];

    // Header background
    tablePage.drawRectangle({
      x: margin,
      y: yPosition - 20,
      width: contentWidth,
      height: 25,
      color: rgb(0.9, 0.9, 0.9),
    });

    const headers = ['Ngày đăng', 'Tiêu đề', 'Intent', 'Ghi chú AI'];
    headers.forEach((header, index) => {
      tablePage.drawText(header, {
        x: colPositions[index] + 5,
        y: yPosition - 12,
        size: 11,
        font: timesBold,
        color: rgb(0.2, 0.2, 0.2),
      });
    });

    yPosition -= 30;

    // Table rows
    const startIndex = pageNum * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, contentPlans.length);
    const pageItems = contentPlans.slice(startIndex, endIndex);

    pageItems.forEach((plan, index) => {
      const rowY = yPosition - (index * 45);
      const isEven = index % 2 === 0;

      // Row background
      if (isEven) {
        tablePage.drawRectangle({
          x: margin,
          y: rowY - 35,
          width: contentWidth,
          height: 40,
          color: rgb(0.95, 0.95, 0.95),
        });
      }

      // Border lines
      tablePage.drawLine({
        start: { x: margin, y: rowY - 35 },
        end: { x: margin + contentWidth, y: rowY - 35 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });

      // Column separators
      colPositions.slice(1).forEach(pos => {
        tablePage.drawLine({
          start: { x: pos, y: rowY },
          end: { x: pos, y: rowY - 35 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
      });

      // Date
      const formattedDate = new Date(plan.plan_date).toLocaleDateString('vi-VN');
      tablePage.drawText(formattedDate, {
        x: colPositions[0] + 5,
        y: rowY - 12,
        size: 9,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Title (truncated if too long)
      const maxTitleLength = 35;
      const truncatedTitle = plan.title.length > maxTitleLength 
        ? plan.title.substring(0, maxTitleLength) + '...'
        : plan.title;
      
      tablePage.drawText(truncatedTitle, {
        x: colPositions[1] + 5,
        y: rowY - 12,
        size: 9,
        font: timesRoman,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Secondary keywords (smaller text)
      if (plan.secondary_keywords && plan.secondary_keywords.length > 0) {
        const keywordsText = plan.secondary_keywords.slice(0, 2).join(', ');
        tablePage.drawText(keywordsText.length > 30 ? keywordsText.substring(0, 30) + '...' : keywordsText, {
          x: colPositions[1] + 5,
          y: rowY - 25,
          size: 7,
          font: helvetica,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      // Search Intent with color coding
      const intentColors = {
        informational: rgb(0.2, 0.6, 0.9),
        commercial: rgb(0.9, 0.6, 0.2),
        transactional: rgb(0.2, 0.9, 0.4),
        navigational: rgb(0.7, 0.3, 0.9)
      };

      tablePage.drawText(plan.search_intent, {
        x: colPositions[2] + 5,
        y: rowY - 12,
        size: 9,
        font: timesBold,
        color: intentColors[plan.search_intent as keyof typeof intentColors] || rgb(0.3, 0.3, 0.3),
      });

      // AI Notes (truncated)
      const aiNotes = `CTA: Liên hệ tư vấn\nKeyword: ${plan.main_keyword}\nLinks: Bài liên quan`;
      const maxNotesLength = 25;
      const truncatedNotes = aiNotes.length > maxNotesLength 
        ? aiNotes.substring(0, maxNotesLength) + '...'
        : aiNotes;

      tablePage.drawText(truncatedNotes, {
        x: colPositions[3] + 5,
        y: rowY - 12,
        size: 8,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
    });

    // Bottom border of table
    tablePage.drawLine({
      start: { x: margin, y: yPosition - (pageItems.length * 45) },
      end: { x: margin + contentWidth, y: yPosition - (pageItems.length * 45) },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Summary Page
  const summaryPage = addPage();
  yPosition = pageHeight - margin;

  summaryPage.drawText('Tóm Tắt Kế Hoạch', {
    x: margin,
    y: yPosition,
    size: 20,
    font: timesBold,
    color: rgb(0.1, 0.4, 0.8),
  });
  yPosition -= 50;

  // Strategy recommendations
  const recommendations = [
    `✓ Tập trung vào chủ đề "${main_topic}" với ${contentPlans.length} bài viết`,
    '✓ Phân bổ đều các loại search intent để tối ưu funnel',
    '✓ Đăng bài định kỳ mỗi tuần để duy trì tần suất',
    '✓ Sử dụng internal linking giữa các bài viết cùng cluster',
    '✓ Theo dõi performance và điều chỉnh strategy',
    '✓ Chuẩn bị content calendar chi tiết cho team',
  ];

  recommendations.forEach((rec, index) => {
    summaryPage.drawText(rec, {
      x: margin,
      y: yPosition - (index * 25),
      size: 12,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  yPosition -= recommendations.length * 25 + 40;

  // Next steps
  summaryPage.drawText('Bước Tiếp Theo:', {
    x: margin,
    y: yPosition,
    size: 16,
    font: timesBold,
    color: rgb(0.8, 0.3, 0.3),
  });
  yPosition -= 30;

  const nextSteps = [
    '1. Assign content writers cho từng bài viết',
    '2. Tạo content brief chi tiết cho mỗi topic',
    '3. Thiết lập calendar publication trong CMS',
    '4. Chuẩn bị hình ảnh và media assets',
    '5. Set up tracking và analytics cho content',
  ];

  nextSteps.forEach((step, index) => {
    summaryPage.drawText(step, {
      x: margin,
      y: yPosition - (index * 20),
      size: 11,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();

  // Upload to Supabase Storage
  const fileName = `content-plan-${main_topic.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
  const filePath = `reports/${user_id}/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('pdf-reports')
    .upload(filePath, pdfBytes, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading content plan PDF:', uploadError);
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
      url: main_topic, // Store topic as URL for content plans
      file_url: fileUrl,
      report_type: 'content_plan',
      include_ai: false,
    })
    .select()
    .single();

  if (reportError) {
    console.error('Error saving content plan report record:', reportError);
    return new Response(
      JSON.stringify({ error: 'Failed to save report record' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Content plan PDF generated successfully:', { fileName, fileUrl });

  return new Response(
    JSON.stringify({
      success: true,
      file_url: fileUrl,
      report_id: reportData.id,
      file_name: fileName,
      report_type: 'content-plan',
      total_articles: contentPlans.length,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}