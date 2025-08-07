import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportData {
  url: string;
  scan_id?: string;
  include_ai: boolean;
  user_id?: string;
}

interface ScanResult {
  id: string;
  url: string;
  seo_score: number;
  created_at: string;
  analysis_data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { url, scan_id, include_ai, user_id }: ReportData = await req.json();

    console.log('Generating PDF report for:', { url, scan_id, include_ai });

    // Get scan data
    let scanData: ScanResult | null = null;
    
    if (scan_id) {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scan_id)
        .single();
        
      if (error) {
        console.error('Error fetching scan:', error);
      } else {
        scanData = data;
      }
    }

    // If no scan found, create a basic analysis
    if (!scanData) {
      console.log('No scan data found, creating new analysis...');
      
      // Call analyze-site function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-site', {
        body: { url, user_id }
      });

      if (analysisError) {
        throw new Error(`Analysis failed: ${analysisError.message}`);
      }

      scanData = {
        id: crypto.randomUUID(),
        url: url,
        seo_score: analysisData?.seoScore || 0,
        created_at: new Date().toISOString(),
        analysis_data: analysisData
      };
    }

    // Generate PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;

    // Helper function to add text with line breaks
    const addText = (text: string, fontSize = 12, isBold = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (currentY > 270) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += fontSize * 0.5;
      });
      currentY += 5;
    };

    // Add header
    addText('BÁO CÁO PHÂN TÍCH SEO', 20, true);
    addText(`Website: ${scanData.url}`, 14, true);
    addText(`Ngày tạo: ${new Date(scanData.created_at).toLocaleDateString('vi-VN')}`, 12);
    addText(`Điểm SEO: ${scanData.seo_score}/100`, 14, true);
    currentY += 10;

    // Executive Summary
    addText('TÓM TẮT ĐIỀU HÀNH', 16, true);
    const analysis = scanData.analysis_data;
    
    if (analysis) {
      addText(`• Điểm SEO tổng thể: ${scanData.seo_score}/100`);
      addText(`• Hiệu suất Desktop: ${analysis.performance?.desktop?.score ? Math.round(analysis.performance.desktop.score * 100) : 'N/A'}/100`);
      addText(`• Hiệu suất Mobile: ${analysis.performance?.mobile?.score ? Math.round(analysis.performance.mobile.score * 100) : 'N/A'}/100`);
      
      if (analysis.seo) {
        addText(`• Tiêu đề trang: ${analysis.seo.title ? '✓' : '✗'}`);
        addText(`• Meta description: ${analysis.seo.metaDescription ? '✓' : '✗'}`);
        addText(`• Thẻ H1: ${analysis.seo.h1?.length || 0} thẻ`);
        addText(`• Tổng số hình ảnh: ${analysis.seo.totalImages || 0}`);
        addText(`• Hình ảnh thiếu alt: ${analysis.seo.imagesWithoutAlt || 0}`);
      }
    }
    
    currentY += 10;

    // Technical SEO Issues
    addText('VẤN ĐỀ KỸ THUẬT SEO', 16, true);
    if (analysis?.issues && analysis.issues.length > 0) {
      analysis.issues.forEach((issue: any) => {
        addText(`• ${issue.title} (${issue.severity}): ${issue.description}`);
      });
    } else {
      addText('Không phát hiện vấn đề kỹ thuật nghiêm trọng.');
    }
    
    currentY += 10;

    // AI Analysis (if included)
    if (include_ai && analysis?.aiAnalysis) {
      addText('PHÂN TÍCH AI CHO SEARCH ENGINE', 16, true);
      
      if (analysis.aiAnalysis.searchIntent) {
        addText(`Ý định tìm kiếm: ${analysis.aiAnalysis.searchIntent}`);
      }
      
      if (analysis.aiAnalysis.citationPotential) {
        addText(`Tiềm năng trích dẫn AI: ${analysis.aiAnalysis.citationPotential}`);
      }
      
      if (analysis.aiAnalysis.semanticGaps && analysis.aiAnalysis.semanticGaps.length > 0) {
        addText('Khoảng trống ngữ nghĩa:', 14, true);
        analysis.aiAnalysis.semanticGaps.forEach((gap: string) => {
          addText(`• ${gap}`);
        });
      }
      
      if (analysis.aiAnalysis.faqSuggestions && analysis.aiAnalysis.faqSuggestions.length > 0) {
        addText('Gợi ý câu hỏi thường gặp:', 14, true);
        analysis.aiAnalysis.faqSuggestions.forEach((faq: string) => {
          addText(`• ${faq}`);
        });
      }
      
      currentY += 10;
    }

    // Performance Analysis
    addText('PHÂN TÍCH HIỆU SUẤT', 16, true);
    if (analysis?.performance) {
      if (analysis.performance.desktop) {
        addText(`Desktop Score: ${Math.round(analysis.performance.desktop.score * 100)}/100`);
      }
      if (analysis.performance.mobile) {
        addText(`Mobile Score: ${Math.round(analysis.performance.mobile.score * 100)}/100`);
      }
    }
    
    currentY += 10;

    // Recommendations
    addText('KHUYẾN NGHỊ', 16, true);
    const recommendations = [
      'Tối ưu hóa tốc độ tải trang bằng cách nén hình ảnh',
      'Cập nhật meta description cho tất cả các trang',
      'Thêm alt text cho tất cả hình ảnh',
      'Cải thiện cấu trúc heading (H1, H2, H3)',
      'Tối ưu hóa cho mobile-first indexing',
      'Thêm schema markup để tăng khả năng hiển thị trong AI search'
    ];
    
    recommendations.forEach(rec => {
      addText(`• ${rec}`);
    });

    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer');
    const uint8Array = new Uint8Array(pdfBuffer);

    // Upload to Supabase Storage
    const fileName = `seo-report-${url.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf-reports')
      .upload(fileName, uint8Array, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pdf-reports')
      .getPublicUrl(fileName);

    // Save report record
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        url: scanData.url,
        file_url: publicUrl,
        report_type: 'seo_analysis',
        include_ai: include_ai,
        scan_id: scanData.id,
        user_id: user_id
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error saving report:', reportError);
    }

    console.log('PDF report generated successfully:', publicUrl);

    return new Response(JSON.stringify({
      success: true,
      file_url: publicUrl,
      report_id: reportData?.id,
      message: 'PDF report generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating PDF report:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});