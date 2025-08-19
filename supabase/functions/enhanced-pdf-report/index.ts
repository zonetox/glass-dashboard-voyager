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

    // Executive Summary Section - Enhanced with compliance standards
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 120, 'F');
    
    addText('TÓM TẮT ĐIỀU HÀNH - TUÂN THỦ TIÊU CHUẨN QUỐC TẾ', 18, true);
    const analysis = scanData.analysis_data;
    
    if (analysis) {
      // Core Performance Metrics (Google Core Web Vitals Standard)
      addText('CORE WEB VITALS - TIÊU CHUẨN GOOGLE:', 14, true);
      
      if (analysis.performance) {
        const desktopScore = analysis.performance?.desktop?.score ? Math.round(analysis.performance.desktop.score * 100) : 0;
        const mobileScore = analysis.performance?.mobile?.score ? Math.round(analysis.performance.mobile.score * 100) : 0;
        const desktopStatus = desktopScore >= 90 ? 'EXCELLENT' : desktopScore >= 50 ? 'NEEDS IMPROVEMENT' : 'POOR';
        const mobileStatus = mobileScore >= 90 ? 'EXCELLENT' : mobileScore >= 50 ? 'NEEDS IMPROVEMENT' : 'POOR';
        
        addText(`  Desktop Performance: ${desktopScore}/100 (${desktopStatus})`);
        addText(`  Mobile Performance: ${mobileScore}/100 (${mobileStatus})`);
        
        // Core Web Vitals Details
        if (analysis.performance.desktop?.metrics) {
          const desktop = analysis.performance.desktop.metrics;
          addText(`    LCP (Desktop): ${desktop.lcp ? Math.round(desktop.lcp) + 'ms' : 'N/A'} (Good: <2.5s)`);
          addText(`    FID (Desktop): ${desktop.fid ? Math.round(desktop.fid) + 'ms' : 'N/A'} (Good: <100ms)`);
          addText(`    CLS (Desktop): ${desktop.cls ? desktop.cls.toFixed(3) : 'N/A'} (Good: <0.1)`);
        }
        
        if (analysis.performance.mobile?.metrics) {
          const mobile = analysis.performance.mobile.metrics;
          addText(`    LCP (Mobile): ${mobile.lcp ? Math.round(mobile.lcp) + 'ms' : 'N/A'} (Good: <2.5s)`);
          addText(`    FID (Mobile): ${mobile.fid ? Math.round(mobile.fid) + 'ms' : 'N/A'} (Good: <100ms)`);
          addText(`    CLS (Mobile): ${mobile.cls ? mobile.cls.toFixed(3) : 'N/A'} (Good: <0.1)`);
        }
      }
      
      addText('PHÂN TÍCH TECHNICAL SEO - W3C & WCAG COMPLIANCE:', 14, true);
      addText(`  Điểm SEO tổng thể: ${scanData.seo_score}/100`);
      
      if (analysis.seo) {
        // Calculate compliance scores
        const titleCompliance = analysis.seo.title && analysis.seo.title.length >= 30 && analysis.seo.title.length <= 60;
        const descCompliance = analysis.seo.metaDescription && analysis.seo.metaDescription.length >= 120 && analysis.seo.metaDescription.length <= 160;
        const h1Compliance = analysis.seo.h1?.length === 1;
        const altCompliance = (analysis.seo.imagesWithoutAlt || 0) === 0;
        
        addText(`  Title Tag: ${titleCompliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'} (${analysis.seo.title?.length || 0} chars)`);
        addText(`  Meta Description: ${descCompliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'} (${analysis.seo.metaDescription?.length || 0} chars)`);
        addText(`  H1 Structure: ${h1Compliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'} (${analysis.seo.h1?.length || 0} H1 tags)`);
        addText(`  Alt Text Coverage: ${altCompliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'} (${analysis.seo.imagesWithoutAlt || 0} missing)`);
        addText(`  Accessibility Score: ${altCompliance && h1Compliance ? '90/100' : '60/100'} (WCAG 2.1 AA)`);
      }
      
      // SEO Health Index
      const healthScore = Math.round((scanData.seo_score + (analysis.performance?.mobile?.score ? analysis.performance.mobile.score * 100 : 0)) / 2);
      const healthStatus = healthScore >= 85 ? 'EXCELLENT' : healthScore >= 70 ? 'GOOD' : healthScore >= 50 ? 'FAIR' : 'POOR';
      addText(`  SEO Health Index: ${healthScore}/100 (${healthStatus})`);
      
      // Technical issues summary with severity classification
      const criticalIssues = analysis.issues?.filter((issue: any) => issue.severity === 'high' || issue.severity === 'critical')?.length || 0;
      const warningIssues = analysis.issues?.filter((issue: any) => issue.severity === 'medium')?.length || 0;
      const infoIssues = analysis.issues?.filter((issue: any) => issue.severity === 'low')?.length || 0;
      
      addText(`  Issues: ${criticalIssues} Critical, ${warningIssues} Warning, ${infoIssues} Info`);
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

    // AI Analysis Section (if included) - Enhanced for modern search engines
    if (include_ai && analysis?.aiAnalysis) {
      pdf.setFillColor(240, 249, 255);
      pdf.rect(margin - 5, currentY - 5, pageWidth - 2 * margin + 10, 15, 'F');
      
      addText('PHÂN TÍCH AI SEO - TƯƠNG THÍCH VỚI CHATGPT, CLAUDE, BARD', 18, true);
      
      // Overall AI Score
      const aiScore = analysis.aiAnalysis.overallScore || 0;
      const aiScoreStatus = aiScore >= 80 ? 'EXCELLENT' : aiScore >= 60 ? 'GOOD' : 'NEEDS IMPROVEMENT';
      addText(`AI Readiness Score: ${aiScore}/100 (${aiScoreStatus})`, 14, true);
      
      if (analysis.aiAnalysis.searchIntent) {
        addText('Phân Tích Ý Định Tìm Kiếm (Search Intent Analysis):', 14, true);
        addText(`  Primary Intent: ${analysis.aiAnalysis.searchIntent}`, 12);
        
        // Intent compliance check
        const intentMapping = {
          'informational': 'Cung cấp thông tin chi tiết và đầy đủ',
          'commercial': 'Tối ưu cho conversion và comparison',
          'transactional': 'Tập trung vào purchase intent',
          'navigational': 'Tối ưu cho brand searches'
        };
        
        const intentLower = analysis.aiAnalysis.searchIntent.toLowerCase();
        Object.keys(intentMapping).forEach(key => {
          if (intentLower.includes(key)) {
            addText(`  Recommendation: ${intentMapping[key]}`, 11);
          }
        });
        currentY += 5;
      }
      
      if (analysis.aiAnalysis.citationPotential) {
        addText('Tiềm Năng Trích Dẫn AI (AI Citation Potential):', 14, true);
        addText(`  ${analysis.aiAnalysis.citationPotential}`, 12);
        
        // Extract score and provide guidance
        const citationMatch = analysis.aiAnalysis.citationPotential.match(/(\d+)\/10/);
        if (citationMatch) {
          const score = parseInt(citationMatch[1]);
          if (score >= 8) {
            addText(`  Status: HIGH - Content highly likely to be cited by AI`, 11);
          } else if (score >= 6) {
            addText(`  Status: MEDIUM - Good citation potential with improvements`, 11);
          } else {
            addText(`  Status: LOW - Needs significant content enhancement`, 11);
          }
        }
        currentY += 5;
      }
      
      // Schema Markup Analysis
      addText('Structured Data Analysis:', 14, true);
      if (analysis.aiAnalysis.schemaMarkup) {
        addText(`  Schema Types Detected: ${analysis.aiAnalysis.schemaMarkup.join(', ')}`, 12);
      } else {
        addText(`  Schema Markup: NOT DETECTED - Highly recommended for AI visibility`, 12);
        addText(`  Recommendation: Implement JSON-LD schema for better AI understanding`, 11);
      }
      currentY += 5;
      
      if (analysis.aiAnalysis.semanticGaps && analysis.aiAnalysis.semanticGaps.length > 0) {
        addText('Khoảng Trống Ngữ Nghĩa (Semantic Content Gaps):', 14, true);
        addText(`  Total Gaps Identified: ${analysis.aiAnalysis.semanticGaps.length}`, 12);
        analysis.aiAnalysis.semanticGaps.slice(0, 5).forEach((gap: string, index: number) => {
          addText(`  ${index + 1}. ${gap.replace(/^[-•]\s*/, '')}`, 11);
        });
        if (analysis.aiAnalysis.semanticGaps.length > 5) {
          addText(`  ... and ${analysis.aiAnalysis.semanticGaps.length - 5} more gaps identified`, 10);
        }
        currentY += 5;
      }
      
      if (analysis.aiAnalysis.faqSuggestions && analysis.aiAnalysis.faqSuggestions.length > 0) {
        addText('FAQ Optimization for Voice Search & AI:', 14, true);
        addText(`  Suggested Questions: ${analysis.aiAnalysis.faqSuggestions.length}`, 12);
        analysis.aiAnalysis.faqSuggestions.slice(0, 3).forEach((faq: string, index: number) => {
          addText(`  Q${index + 1}: ${faq.replace(/^[-•]\s*/, '')}`, 11);
        });
        if (analysis.aiAnalysis.faqSuggestions.length > 3) {
          addText(`  ... plus ${analysis.aiAnalysis.faqSuggestions.length - 3} additional FAQ opportunities`, 10);
        }
        currentY += 5;
      }
      
      // E-A-T Analysis
      if (analysis.aiAnalysis.eatScore) {
        addText('E-A-T Analysis (Expertise, Authoritativeness, Trustworthiness):', 14, true);
        addText(`  E-A-T Score: ${analysis.aiAnalysis.eatScore}/100`, 12);
        addText(`  Author Information: ${analysis.aiAnalysis.authorPresent ? 'PRESENT' : 'MISSING'}`, 11);
        addText(`  Source Citations: ${analysis.aiAnalysis.citations || 0} detected`, 11);
        addText(`  Expert Quotes: ${analysis.aiAnalysis.expertQuotes || 0} found`, 11);
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
    
    addText('CÁC HÀNH ĐỘNG ƯU TIÊN THEO TIÊU CHUẨN QUỐC TẾ:', 14, true);
    
    // Enhanced recommendations with international standards
    const enhancedRecommendations = [
      ...dynamicRecommendations,
      {
        priority: 'CAO',
        title: 'Implement Core Web Vitals Optimization',
        desc: 'Đảm bảo LCP <2.5s, FID <100ms, CLS <0.1 theo chuẩn Google',
        impact: '+20 điểm SEO',
        standard: 'Google Core Web Vitals'
      },
      {
        priority: 'CAO', 
        title: 'Add Structured Data Markup',
        desc: 'Triển khai JSON-LD schema theo schema.org để AI hiểu content',
        impact: '+15 điểm AI',
        standard: 'Schema.org / JSON-LD'
      },
      {
        priority: 'TRUNG BÌNH',
        title: 'WCAG 2.1 AA Compliance',
        desc: 'Đảm bảo accessibility cho người khuyết tật',
        impact: '+10 điểm UX',
        standard: 'WCAG 2.1 Level AA'
      }
    ];
    
    enhancedRecommendations.slice(0, 8).forEach((rec, index) => {
      addText(`${index + 1}. [${rec.priority}] ${rec.title}`, 12, true);
      addText(`   ${rec.desc}`, 11);
      addText(`   Tác động: ${rec.impact}`, 10);
      if (rec.standard) {
        addText(`   Tuân thủ: ${rec.standard}`, 9);
      }
      currentY += 4;
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