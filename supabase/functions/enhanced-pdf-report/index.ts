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

    // Add header with professional styling
    pdf.setFillColor(41, 128, 185);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    addText('BÁO CÁO PHÂN TÍCH SEO CHUYÊN NGHIỆP', 24, true);
    currentY = 50;
    
    pdf.setTextColor(0, 0, 0);
    addText(`Website: ${scanData.url}`, 16, true);
    addText(`Ngày phân tích: ${new Date(scanData.created_at).toLocaleDateString('vi-VN')}`, 12);
    
    // Score with color coding
    const scoreColor = scanData.seo_score >= 80 ? [34, 197, 94] : 
                      scanData.seo_score >= 60 ? [251, 191, 36] : [239, 68, 68];
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    addText(`Điểm SEO Tổng Thể: ${scanData.seo_score}/100`, 18, true);
    
    pdf.setTextColor(0, 0, 0);
    currentY += 15;

    // Executive Summary Section
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 80, 'F');
    
    addText('TÓM TẮT ĐIỀU HÀNH', 18, true);
    const analysis = scanData.analysis_data;
    
    if (analysis) {
      // Core metrics in a structured format
      addText('CHỈ SỐ CHÍNH:', 14, true);
      addText(`  Điểm SEO tổng thể: ${scanData.seo_score}/100`);
      
      if (analysis.performance) {
        const desktopScore = analysis.performance?.desktop?.score ? Math.round(analysis.performance.desktop.score * 100) : 'N/A';
        const mobileScore = analysis.performance?.mobile?.score ? Math.round(analysis.performance.mobile.score * 100) : 'N/A';
        addText(`  Hiệu suất Desktop: ${desktopScore}/100`);
        addText(`  Hiệu suất Mobile: ${mobileScore}/100`);
      }
      
      addText('PHÂN TÍCH KỸ THUẬT:', 14, true);
      if (analysis.seo) {
        addText(`  Tiêu đề trang (Title): ${analysis.seo.title ? '✓ Có' : '✗ Thiếu'}`);
        addText(`  Meta description: ${analysis.seo.metaDescription ? '✓ Có' : '✗ Thiếu'}`);
        addText(`  Số lượng thẻ H1: ${analysis.seo.h1?.length || 0}`);
        addText(`  Tổng số hình ảnh: ${analysis.seo.totalImages || 0}`);
        addText(`  Hình ảnh thiếu alt text: ${analysis.seo.imagesWithoutAlt || 0}`);
      }
      
      // Technical issues summary
      const issuesCount = analysis.issues ? analysis.issues.length : 0;
      addText(`  Vấn đề kỹ thuật phát hiện: ${issuesCount}`);
    }
    
    currentY += 15;

    // Technical SEO Issues Section
    addText('VẤN ĐỀ KỸ THUẬT SEO', 18, true);
    
    if (analysis?.issues && analysis.issues.length > 0) {
      addText('CÁC VẤN ĐỀ ĐÃ PHÁT HIỆN:', 14, true);
      analysis.issues.forEach((issue: any, index: number) => {
        const severity = issue.severity || 'Medium';
        const priorityText = severity === 'High' ? 'CAO' : severity === 'Medium' ? 'TRUNG BÌNH' : 'THẤP';
        addText(`${index + 1}. ${issue.title} [Mức độ: ${priorityText}]`, 12, true);
        addText(`   ${issue.description}`, 11);
        currentY += 3;
      });
    } else {
      pdf.setFillColor(220, 252, 231);
      pdf.rect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 20, 'F');
      addText('✓ Không phát hiện vấn đề kỹ thuật nghiêm trọng.', 12, true);
    }
    
    currentY += 15;

    // AI Analysis Section (if included)
    if (include_ai && analysis?.aiAnalysis) {
      pdf.setFillColor(240, 249, 255);
      pdf.rect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 10, 'F');
      
      addText('PHÂN TÍCH AI CHO SEARCH ENGINE', 18, true);
      
      if (analysis.aiAnalysis.searchIntent) {
        addText('Ý Định Tìm Kiếm (Search Intent):', 14, true);
        addText(`  ${analysis.aiAnalysis.searchIntent}`, 12);
        currentY += 5;
      }
      
      if (analysis.aiAnalysis.citationPotential) {
        addText('Tiềm Năng Trích Dẫn AI:', 14, true);
        addText(`  ${analysis.aiAnalysis.citationPotential}`, 12);
        currentY += 5;
      }
      
      if (analysis.aiAnalysis.semanticGaps && analysis.aiAnalysis.semanticGaps.length > 0) {
        addText('Khoảng Trống Ngữ Nghĩa:', 14, true);
        analysis.aiAnalysis.semanticGaps.slice(0, 5).forEach((gap: string) => {
          addText(`  • ${gap}`, 11);
        });
        currentY += 5;
      }
      
      if (analysis.aiAnalysis.faqSuggestions && analysis.aiAnalysis.faqSuggestions.length > 0) {
        addText('Gợi Ý Câu Hỏi Thường Gặp (FAQ):', 14, true);
        analysis.aiAnalysis.faqSuggestions.slice(0, 3).forEach((faq: string) => {
          addText(`  • ${faq}`, 11);
        });
        currentY += 5;
      }
      
      currentY += 15;
    }

    // Performance Analysis Section
    pdf.setFillColor(252, 231, 243);
    pdf.rect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 10, 'F');
    
    addText('PHÂN TÍCH HIỆU SUẤT WEBSITE', 18, true);
    
    if (analysis?.performance) {
      addText('HIỆU SUẤT TRÊN CÁC THIẾT BỊ:', 14, true);
      
      if (analysis.performance.desktop) {
        const desktopScore = Math.round(analysis.performance.desktop.score * 100);
        const desktopStatus = desktopScore >= 90 ? 'Xuất sắc' : desktopScore >= 70 ? 'Tốt' : 'Cần cải thiện';
        addText(`  Desktop: ${desktopScore}/100 (${desktopStatus})`, 12);
        
        if (analysis.performance.desktop.metrics) {
          addText(`    • FCP: ${analysis.performance.desktop.metrics.fcp ? Math.round(analysis.performance.desktop.metrics.fcp) + 'ms' : 'N/A'}`, 10);
          addText(`    • LCP: ${analysis.performance.desktop.metrics.lcp ? Math.round(analysis.performance.desktop.metrics.lcp) + 'ms' : 'N/A'}`, 10);
        }
      }
      
      if (analysis.performance.mobile) {
        const mobileScore = Math.round(analysis.performance.mobile.score * 100);
        const mobileStatus = mobileScore >= 90 ? 'Xuất sắc' : mobileScore >= 70 ? 'Tốt' : 'Cần cải thiện';
        addText(`  Mobile: ${mobileScore}/100 (${mobileStatus})`, 12);
        
        if (analysis.performance.mobile.metrics) {
          addText(`    • FCP: ${analysis.performance.mobile.metrics.fcp ? Math.round(analysis.performance.mobile.metrics.fcp) + 'ms' : 'N/A'}`, 10);
          addText(`    • LCP: ${analysis.performance.mobile.metrics.lcp ? Math.round(analysis.performance.mobile.metrics.lcp) + 'ms' : 'N/A'}`, 10);
        }
      }
      
      currentY += 5;
      addText('GHI CHÚ: FCP = First Contentful Paint, LCP = Largest Contentful Paint', 9);
    } else {
      addText('Không có dữ liệu hiệu suất từ phân tích này.', 12);
    }
    
    currentY += 15;

    // Recommendations Section
    pdf.setFillColor(240, 253, 244);
    pdf.rect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 10, 'F');
    
    addText('KHUYẾN NGHỊ TỐI ƯU HÓA', 18, true);
    
    const dynamicRecommendations = [];
    
    // Dynamic recommendations based on analysis
    if (analysis?.seo) {
      if (!analysis.seo.title) {
        dynamicRecommendations.push({
          priority: 'CAO',
          title: 'Thêm Meta Title',
          desc: 'Tạo tiêu đề trang hấp dẫn và chứa từ khóa chính',
          impact: '+10 điểm SEO'
        });
      }
      
      if (!analysis.seo.metaDescription) {
        dynamicRecommendations.push({
          priority: 'CAO',
          title: 'Thêm Meta Description',
          desc: 'Viết mô tả trang 150-160 ký tự để tăng CTR',
          impact: '+8 điểm SEO'
        });
      }
      
      if (analysis.seo.imagesWithoutAlt > 0) {
        dynamicRecommendations.push({
          priority: 'TRUNG BÌNH',
          title: 'Bổ sung Alt Text cho hình ảnh',
          desc: `${analysis.seo.imagesWithoutAlt} hình ảnh thiếu alt text`,
          impact: '+5 điểm SEO'
        });
      }
    }
    
    if (analysis?.performance?.mobile?.score && analysis.performance.mobile.score < 0.7) {
      dynamicRecommendations.push({
        priority: 'CAO',
        title: 'Tối ưu hiệu suất Mobile',
        desc: 'Cải thiện tốc độ tải trang trên thiết bị di động',
        impact: '+15 điểm SEO'
      });
    }
    
    // Add AI-specific recommendations if AI analysis is included
    if (include_ai && analysis?.aiAnalysis) {
      if (analysis.aiAnalysis.semanticGaps && analysis.aiAnalysis.semanticGaps.length > 0) {
        dynamicRecommendations.push({
          priority: 'TRUNG BÌNH',
          title: 'Lấp đầy khoảng trống ngữ nghĩa',
          desc: 'Bổ sung nội dung cho các chủ đề còn thiếu',
          impact: '+12 điểm SEO'
        });
      }
    }
    
    // Default recommendations if no specific issues found
    if (dynamicRecommendations.length === 0) {
      dynamicRecommendations.push(
        {
          priority: 'TRUNG BÌNH',
          title: 'Tối ưu hóa tốc độ trang',
          desc: 'Nén hình ảnh và kích hoạt browser caching',
          impact: '+8 điểm SEO'
        },
        {
          priority: 'THẤP',
          title: 'Thêm Schema Markup',
          desc: 'Cải thiện khả năng hiển thị trong kết quả tìm kiếm',
          impact: '+6 điểm SEO'
        }
      );
    }
    
    addText('CÁC HÀNH ĐỘNG ƯU TIÊN:', 14, true);
    dynamicRecommendations.slice(0, 6).forEach((rec, index) => {
      addText(`${index + 1}. [${rec.priority}] ${rec.title}`, 12, true);
      addText(`   ${rec.desc}`, 11);
      addText(`   Tác động dự kiến: ${rec.impact}`, 10);
      currentY += 3;
    });
    
    currentY += 10;
    
    // Footer section
    pdf.setFillColor(249, 250, 251);
    pdf.rect(0, currentY, pageWidth, 40, 'F');
    
    currentY += 10;
    pdf.setTextColor(100, 100, 100);
    addText('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 12);
    addText(`Báo cáo được tạo tự động bởi SEO Auto Tool | ${new Date().toLocaleDateString('vi-VN')}`, 10);
    addText('© 2024 SEO Auto Tool - Công cụ phân tích SEO chuyên nghiệp', 9);
    addText('Liên hệ hỗ trợ: support@seoautotool.com | Website: seoautotool.com', 9);

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