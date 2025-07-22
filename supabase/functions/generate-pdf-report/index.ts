import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

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
  console.log('🔥 === PDF GENERATION STARTED === 🔥');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔥 CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔥 Reading request body...');
    const requestBody = await req.json() as GeneratePDFRequest;
    const { url, user_id, include_ai = false, scan_id, report_type = 'seo_analysis', main_topic } = requestBody;
    
    console.log('🔥 PDF generation request details:', { url, user_id, include_ai, scan_id, report_type, main_topic });

    if (!user_id) {
      console.log('🔥 ERROR: user_id is missing!');
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

      const { data: scanResults, error: scanError } = await scanQuery.order('created_at', { ascending: false });

      if (scanError) {
        console.error('Error fetching scan data:', scanError);
        return new Response(
          JSON.stringify({ error: 'Scan data not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!scanResults || scanResults.length === 0) {
        console.error('No scan data found for URL:', url);
        return new Response(
          JSON.stringify({ error: 'No scan data found for this URL' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Take the most recent scan if no specific scan_id is provided
      const scanResult = scan_id ? scanResults.find(scan => scan.id === scan_id) || scanResults[0] : scanResults[0];
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

    // Create PDF document with standardized format
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

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

    // Helper function to add page footer
    const addFooter = (page: any, pageNumber: number) => {
      // System signature
      page.drawText('Báo cáo tạo bởi AISEO+', {
        x: margin,
        y: 30,
        size: 10,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Page number
      page.drawText(`Trang ${pageNumber}`, {
        x: pageWidth - margin - 50,
        y: 30,
        size: 10,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
    };

    let pageCounter = 1;

    // === PROFESSIONAL COVER PAGE ===
    const coverPage = addPage();
    let yPosition = pageHeight - margin;

    // Logo placeholder (top-left)
    coverPage.drawRectangle({
      x: margin,
      y: yPosition - 60,
      width: 120,
      height: 60,
      borderColor: rgb(0.2, 0.3, 0.8),
      borderWidth: 2,
    });
    coverPage.drawText('AISEO+', {
      x: margin + 35,
      y: yPosition - 35,
      size: 20,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 120;

    // Main title
    coverPage.drawText('BÁO CÁO PHÂN TÍCH SEO', {
      x: margin,
      y: yPosition,
      size: 32,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 50;

    // Subtitle
    const reportTypeText = include_ai ? 'Phân tích SEO truyền thống + AI Intelligence' : 'Phân tích SEO truyền thống';
    coverPage.drawText(reportTypeText, {
      x: margin,
      y: yPosition,
      size: 16,
      font: timesRoman,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 80;

    // Website info
    const domain = url ? new URL(url).hostname : 'Content Plan';
    coverPage.drawText(`Website: ${domain}`, {
      x: margin,
      y: yPosition,
      size: 20,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 40;

    // Report date
    const reportDate = new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    coverPage.drawText(`Ngày tạo: ${reportDate}`, {
      x: margin,
      y: yPosition,
      size: 14,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPosition -= 100;

    // Professional box with summary stats
    const seoData = scanData?.seo as any;
    if (seoData) {
      coverPage.drawRectangle({
        x: margin,
        y: yPosition - 120,
        width: contentWidth,
        height: 120,
        color: rgb(0.95, 0.97, 1),
        borderColor: rgb(0.2, 0.3, 0.8),
        borderWidth: 2,
      });

      // Summary stats in the box
      const score = seoData.score || 0;
      const issues = Array.isArray(seoData.issues) ? seoData.issues.length : 0;
      
      coverPage.drawText('TỔNG QUAN NHANH', {
        x: margin + 20,
        y: yPosition - 25,
        size: 14,
        font: helveticaBold,
        color: rgb(0.2, 0.3, 0.8),
      });

      coverPage.drawText(`Điểm SEO: ${score}/100`, {
        x: margin + 20,
        y: yPosition - 50,
        size: 16,
        font: timesBold,
        color: score >= 80 ? rgb(0, 0.7, 0) : score >= 60 ? rgb(0.8, 0.6, 0) : rgb(0.8, 0, 0),
      });

      coverPage.drawText(`Vấn đề phát hiện: ${issues}`, {
        x: margin + 20,
        y: yPosition - 75,
        size: 14,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });

      if (include_ai && semanticData) {
        coverPage.drawText(`Chủ đề chính: ${semanticData.main_topic || 'Không xác định'}`, {
          x: margin + 20,
          y: yPosition - 100,
          size: 12,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4),
        });
      }
    }

    addFooter(coverPage, pageCounter++);

    // === PROFESSIONAL TABLE OF CONTENTS ===
    const tocPage = addPage();
    yPosition = pageHeight - margin;

    tocPage.drawText('MỤC LỤC', {
      x: margin,
      y: yPosition,
      size: 24,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 60;

    const tocItems = [
      { title: '1. Tóm tắt điều hành', page: 3 },
      { title: '2. Phân tích SEO truyền thống', page: 4 },
      { title: '   2.1 Trạng thái hiện tại', page: 4 },
      { title: '   2.2 Phân tích chi tiết', page: 5 },
      { title: '   2.3 Đề xuất cải thiện', page: 6 },
      ...(include_ai ? [
        { title: '3. Phân tích AI Intelligence', page: 7 },
        { title: '   3.1 Semantic Analysis', page: 7 },
        { title: '   3.2 Intent Mapping', page: 8 },
        { title: '   3.3 Content Clustering', page: 9 },
        { title: '4. So sánh SEO vs AI SEO', page: 10 },
        { title: '5. Biểu đồ và dự đoán', page: 11 },
        { title: '6. Đề xuất AI cụ thể', page: 12 }
      ] : []),
      { title: `${include_ai ? '7' : '3'}. Kết luận và roadmap`, page: include_ai ? 13 : 7 },
    ];

    tocItems.forEach((item, index) => {
      const isMainSection = !item.title.startsWith('   ');
      tocPage.drawText(item.title, {
        x: margin + (isMainSection ? 0 : 20),
        y: yPosition - (index * 25),
        size: isMainSection ? 14 : 12,
        font: isMainSection ? helveticaBold : helvetica,
        color: isMainSection ? rgb(0.2, 0.2, 0.2) : rgb(0.5, 0.5, 0.5),
      });

      // Draw dots
      const dotsWidth = 300;
      const titleWidth = 200;
      tocPage.drawText('.'.repeat(30), {
        x: margin + titleWidth,
        y: yPosition - (index * 25),
        size: 12,
        font: helvetica,
        color: rgb(0.8, 0.8, 0.8),
      });

      // Page number
      tocPage.drawText(item.page.toString(), {
        x: margin + titleWidth + dotsWidth,
        y: yPosition - (index * 25),
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
    });

    addFooter(tocPage, pageCounter++);

    // === EXECUTIVE SUMMARY ===
    const summaryPage = addPage();
    yPosition = pageHeight - margin;

    summaryPage.drawText('1. TÓM TẮT ĐIỀU HÀNH', {
      x: margin,
      y: yPosition,
      size: 20,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 50;

    // Status summary box
    summaryPage.drawRectangle({
      x: margin,
      y: yPosition - 150,
      width: contentWidth,
      height: 150,
      color: rgb(0.98, 0.98, 1),
      borderColor: rgb(0.8, 0.8, 0.9),
      borderWidth: 1,
    });

    summaryPage.drawText('TRẠNG THÁI TỔNG QUAN', {
      x: margin + 15,
      y: yPosition - 25,
      size: 14,
      font: helveticaBold,
      color: rgb(0.2, 0.3, 0.8),
    });

    if (seoData) {
      const score = seoData.score || 0;
      const status = score >= 80 ? 'Tốt' : score >= 60 ? 'Trung bình' : 'Cần cải thiện';
      const statusColor = score >= 80 ? rgb(0, 0.7, 0) : score >= 60 ? rgb(0.8, 0.6, 0) : rgb(0.8, 0, 0);

      summaryPage.drawText(`• Điểm SEO hiện tại: ${score}/100 (${status})`, {
        x: margin + 15,
        y: yPosition - 50,
        size: 12,
        font: helvetica,
        color: statusColor,
      });

      const issues = Array.isArray(seoData.issues) ? seoData.issues : [];
      const criticalIssues = issues.filter((issue: any) => issue.severity === 'high' || issue.critical).length;
      
      summaryPage.drawText(`• Vấn đề nghiêm trọng: ${criticalIssues}/${issues.length}`, {
        x: margin + 15,
        y: yPosition - 70,
        size: 12,
        font: helvetica,
        color: criticalIssues > 0 ? rgb(0.8, 0, 0) : rgb(0, 0.7, 0),
      });

      summaryPage.drawText(`• Tốc độ tải trang: ${seoData.page_speed?.mobile || 'N/A'} (Mobile)`, {
        x: margin + 15,
        y: yPosition - 90,
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });

      if (include_ai && semanticData) {
        summaryPage.drawText(`• Intent chính: ${semanticData.search_intent || 'Không xác định'}`, {
          x: margin + 15,
          y: yPosition - 110,
          size: 12,
          font: helvetica,
          color: rgb(0.3, 0.3, 0.3),
        });

        const missingTopics = semanticData.missing_topics as string[] || [];
        summaryPage.drawText(`• Chủ đề cần bổ sung: ${missingTopics.length}`, {
          x: margin + 15,
          y: yPosition - 130,
          size: 12,
          font: helvetica,
          color: missingTopics.length > 0 ? rgb(0.8, 0.6, 0) : rgb(0, 0.7, 0),
        });
      }
    }

    yPosition -= 180;

    // Key recommendations
    summaryPage.drawText('KHUYẾN NGHỊ HÀNG ĐẦU', {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 30;

    const topRecommendations = [
      '1. Tối ưu meta title và description cho từ khóa chính',
      '2. Cải thiện cấu trúc heading hierarchy (H1-H6)',
      '3. Thêm alt text có chứa keyword cho tất cả hình ảnh',
      '4. Tăng tốc độ tải trang (Core Web Vitals)',
      ...(include_ai ? [
        '5. Bổ sung nội dung theo semantic analysis',
        '6. Tối ưu hóa search intent mapping'
      ] : [])
    ];

    topRecommendations.forEach((rec, index) => {
      summaryPage.drawText(rec, {
        x: margin,
        y: yPosition - (index * 20),
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
    });

    addFooter(summaryPage, pageCounter++);

    // === TRADITIONAL SEO ANALYSIS ===
    const traditionalSeoPage = addPage();
    yPosition = pageHeight - margin;

    traditionalSeoPage.drawText('2. PHÂN TÍCH SEO TRUYỀN THỐNG', {
      x: margin,
      y: yPosition,
      size: 20,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 50;

    // 2.1 Current Status
    traditionalSeoPage.drawText('2.1 Trạng thái hiện tại', {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 30;

    if (seoData) {
      // Meta analysis
      traditionalSeoPage.drawText('Meta Tags:', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 20;

      const metaTitle = seoData.meta_title || 'Không có meta title';
      const titleLength = metaTitle.length;
      const titleStatus = titleLength >= 50 && titleLength <= 60 ? 'Tốt' : titleLength < 50 ? 'Quá ngắn' : 'Quá dài';
      
      traditionalSeoPage.drawText(`• Title: ${metaTitle.substring(0, 80)}${metaTitle.length > 80 ? '...' : ''}`, {
        x: margin + 10,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPosition -= 15;

      traditionalSeoPage.drawText(`• Độ dài: ${titleLength} ký tự (${titleStatus})`, {
        x: margin + 10,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: titleStatus === 'Tốt' ? rgb(0, 0.7, 0) : rgb(0.8, 0.6, 0),
      });
      yPosition -= 30;

      // Headings analysis
      traditionalSeoPage.drawText('Cấu trúc Heading:', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 20;

      const headings = seoData.headings || {};
      ['h1', 'h2', 'h3'].forEach((level) => {
        const count = headings[level]?.length || 0;
        const levelUpper = level.toUpperCase();
        traditionalSeoPage.drawText(`• ${levelUpper}: ${count} thẻ`, {
          x: margin + 10,
          y: yPosition,
          size: 11,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4),
        });
        yPosition -= 15;
      });

      yPosition -= 20;

      // Images analysis
      traditionalSeoPage.drawText('Phân tích hình ảnh:', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 20;

      const images = seoData.images || [];
      const imagesWithAlt = images.filter((img: any) => img.alt && img.alt.trim()).length;
      const totalImages = images.length;

      traditionalSeoPage.drawText(`• Tổng số hình ảnh: ${totalImages}`, {
        x: margin + 10,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPosition -= 15;

      traditionalSeoPage.drawText(`• Có alt text: ${imagesWithAlt}/${totalImages}`, {
        x: margin + 10,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: imagesWithAlt === totalImages ? rgb(0, 0.7, 0) : rgb(0.8, 0.6, 0),
      });
      yPosition -= 15;

      const altCoverage = totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 0;
      traditionalSeoPage.drawText(`• Độ bao phủ alt text: ${altCoverage}%`, {
        x: margin + 10,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: altCoverage >= 90 ? rgb(0, 0.7, 0) : altCoverage >= 70 ? rgb(0.8, 0.6, 0) : rgb(0.8, 0, 0),
      });
    }

    addFooter(traditionalSeoPage, pageCounter++);

    // === AI INTELLIGENCE ANALYSIS (if included) ===
    if (include_ai && semanticData) {
      const aiPage = addPage();
      yPosition = pageHeight - margin;

      aiPage.drawText('3. PHÂN TÍCH AI INTELLIGENCE', {
        x: margin,
        y: yPosition,
        size: 20,
        font: timesBold,
        color: rgb(0.2, 0.3, 0.8),
      });
      yPosition -= 50;

      // 3.1 Semantic Analysis
      aiPage.drawText('3.1 Semantic Analysis', {
        x: margin,
        y: yPosition,
        size: 16,
        font: helveticaBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 30;

      // Main topic box
      aiPage.drawRectangle({
        x: margin,
        y: yPosition - 80,
        width: contentWidth,
        height: 80,
        color: rgb(0.95, 1, 0.95),
        borderColor: rgb(0.3, 0.8, 0.3),
        borderWidth: 1,
      });

      aiPage.drawText('Chủ đề chính được AI phát hiện:', {
        x: margin + 15,
        y: yPosition - 20,
        size: 12,
        font: helveticaBold,
        color: rgb(0.2, 0.6, 0.2),
      });

      const mainTopic = semanticData.main_topic || 'Không xác định';
      aiPage.drawText(mainTopic, {
        x: margin + 15,
        y: yPosition - 40,
        size: 14,
        font: timesBold,
        color: rgb(0.1, 0.5, 0.1),
      });

      const searchIntent = semanticData.search_intent || 'Không xác định';
      aiPage.drawText(`Search Intent: ${searchIntent}`, {
        x: margin + 15,
        y: yPosition - 60,
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });

      yPosition -= 100;

      // Missing topics
      const missingTopics = semanticData.missing_topics as string[] || [];
      if (missingTopics.length > 0) {
        aiPage.drawText('Chủ đề thiếu (Content Gaps):', {
          x: margin,
          y: yPosition,
          size: 14,
          font: helveticaBold,
          color: rgb(0.8, 0.3, 0.3),
        });
        yPosition -= 25;

        missingTopics.slice(0, 8).forEach((topic: string, index: number) => {
          aiPage.drawText(`• ${topic}`, {
            x: margin + 10,
            y: yPosition - (index * 18),
            size: 11,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5),
          });
        });
        yPosition -= (Math.min(missingTopics.length, 8) * 18 + 20);
      }

      // Related entities
      const entities = semanticData.entities as string[] || [];
      if (entities.length > 0) {
        aiPage.drawText('Thực thể liên quan:', {
          x: margin,
          y: yPosition,
          size: 14,
          font: helveticaBold,
          color: rgb(0.3, 0.6, 0.8),
        });
        yPosition -= 25;

        // Display entities in a more compact format
        const entityText = entities.slice(0, 15).join(', ');
        const maxLineLength = 80;
        const lines = [];
        let currentLine = '';
        
        entityText.split(', ').forEach(entity => {
          if ((currentLine + entity).length > maxLineLength) {
            if (currentLine) lines.push(currentLine);
            currentLine = entity;
          } else {
            currentLine = currentLine ? `${currentLine}, ${entity}` : entity;
          }
        });
        if (currentLine) lines.push(currentLine);

        lines.forEach((line, index) => {
          aiPage.drawText(line, {
            x: margin + 10,
            y: yPosition - (index * 15),
            size: 10,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4),
          });
        });
      }

      addFooter(aiPage, pageCounter++);

      // === COMPARISON PAGE ===
      const comparisonPage = addPage();
      yPosition = pageHeight - margin;

      comparisonPage.drawText('4. SO SÁNH SEO vs AI SEO', {
        x: margin,
        y: yPosition,
        size: 20,
        font: timesBold,
        color: rgb(0.2, 0.3, 0.8),
      });
      yPosition -= 50;

      // Create comparison table
      const tableY = yPosition - 50;
      const rowHeight = 30;
      const colWidth = contentWidth / 3;

      // Table headers
      comparisonPage.drawRectangle({
        x: margin,
        y: tableY,
        width: contentWidth,
        height: rowHeight,
        color: rgb(0.9, 0.9, 1),
        borderColor: rgb(0.2, 0.3, 0.8),
        borderWidth: 1,
      });

      comparisonPage.drawText('Tiêu chí', {
        x: margin + 10,
        y: tableY + 10,
        size: 12,
        font: helveticaBold,
        color: rgb(0.2, 0.3, 0.8),
      });

      comparisonPage.drawText('SEO Truyền thống', {
        x: margin + colWidth + 10,
        y: tableY + 10,
        size: 12,
        font: helveticaBold,
        color: rgb(0.2, 0.3, 0.8),
      });

      comparisonPage.drawText('AI-Enhanced SEO', {
        x: margin + 2 * colWidth + 10,
        y: tableY + 10,
        size: 12,
        font: helveticaBold,
        color: rgb(0.2, 0.3, 0.8),
      });

      // Table rows
      const comparisonData = [
        ['Keyword Density', '2.5%', '4.2% (Optimal)'],
        ['Content Quality', 'Basic', 'AI-Optimized'],
        ['Intent Match', '60%', '94%'],
        ['Semantic Coverage', '40%', '88%'],
        ['User Experience', 'Standard', 'Enhanced'],
      ];

      comparisonData.forEach((row, index) => {
        const rowY = tableY - ((index + 1) * rowHeight);
        
        // Row background
        if (index % 2 === 1) {
          comparisonPage.drawRectangle({
            x: margin,
            y: rowY,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.98, 0.98, 1),
            borderColor: rgb(0.9, 0.9, 0.9),
            borderWidth: 1,
          });
        }

        row.forEach((cell, cellIndex) => {
          comparisonPage.drawText(cell, {
            x: margin + (cellIndex * colWidth) + 10,
            y: rowY + 10,
            size: 11,
            font: cellIndex === 0 ? helveticaBold : helvetica,
            color: cellIndex === 2 ? rgb(0, 0.6, 0) : rgb(0.3, 0.3, 0.3),
          });
        });
      });

      addFooter(comparisonPage, pageCounter++);

      // === CHARTS AND PREDICTIONS PAGE ===
      const chartsPage = addPage();
      yPosition = pageHeight - margin;

      chartsPage.drawText('5. BIỂU ĐỒ VÀ DỰ ĐOÁN', {
        x: margin,
        y: yPosition,
        size: 20,
        font: timesBold,
        color: rgb(0.2, 0.3, 0.8),
      });
      yPosition -= 50;

      // Performance before/after chart placeholder
      chartsPage.drawRectangle({
        x: margin,
        y: yPosition - 150,
        width: contentWidth,
        height: 150,
        color: rgb(0.98, 0.98, 1),
        borderColor: rgb(0.7, 0.7, 0.9),
        borderWidth: 1,
      });

      chartsPage.drawText('Hiệu suất Trước/Sau tối ưu', {
        x: margin + 20,
        y: yPosition - 20,
        size: 14,
        font: helveticaBold,
        color: rgb(0.2, 0.3, 0.8),
      });

      // Simple bar chart representation
      const beforeScore = seoData?.score || 45;
      const predictedAfter = Math.min(beforeScore + 25, 95);

      chartsPage.drawText(`Trước: ${beforeScore}/100`, {
        x: margin + 20,
        y: yPosition - 50,
        size: 12,
        font: helvetica,
        color: rgb(0.8, 0.3, 0.3),
      });

      chartsPage.drawText(`Dự đoán sau: ${predictedAfter}/100`, {
        x: margin + 20,
        y: yPosition - 70,
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.8, 0.3),
      });

      chartsPage.drawText(`Cải thiện dự kiến: +${predictedAfter - beforeScore} điểm`, {
        x: margin + 20,
        y: yPosition - 90,
        size: 12,
        font: helveticaBold,
        color: rgb(0.2, 0.6, 0.2),
      });

      yPosition -= 180;

      // Ranking predictions
      chartsPage.drawText('Dự đoán thứ hạng từ khóa:', {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBold,
        color: rgb(0.2, 0.3, 0.8),
      });
      yPosition -= 30;

      const keywordPredictions = [
        { keyword: 'SEO tự động', current: 'Không có hạng', predicted: '#15-20' },
        { keyword: 'Tối ưu website', current: '#45', predicted: '#20-25' },
        { keyword: 'AI SEO', current: 'Không có hạng', predicted: '#25-30' },
      ];

      keywordPredictions.forEach((pred, index) => {
        chartsPage.drawText(`• ${pred.keyword}: ${pred.current} → ${pred.predicted}`, {
          x: margin + 10,
          y: yPosition - (index * 20),
          size: 11,
          font: helvetica,
          color: rgb(0.3, 0.3, 0.3),
        });
      });

      addFooter(chartsPage, pageCounter++);

      // === AI SPECIFIC RECOMMENDATIONS ===
      const aiRecsPage = addPage();
      yPosition = pageHeight - margin;

      aiRecsPage.drawText('6. ĐỀ XUẤT AI CỤ THỂ', {
        x: margin,
        y: yPosition,
        size: 20,
        font: timesBold,
        color: rgb(0.2, 0.3, 0.8),
      });
      yPosition -= 50;

      const aiRecommendations = [
        {
          title: 'Content Optimization',
          items: [
            'Bổ sung 3-5 chủ đề semantic liên quan',
            'Tối ưu intent mapping cho từ khóa chính',
            'Thêm FAQ section với NLP-optimized Q&A'
          ]
        },
        {
          title: 'Technical AI Enhancement',
          items: [
            'Implement schema markup cho better crawling',
            'Tối ưu Core Web Vitals với AI suggestions',
            'Auto-generate alt text với computer vision'
          ]
        },
        {
          title: 'Content Clustering',
          items: [
            'Tạo topic cluster cho chủ đề chính',
            'Liên kết nội bộ thông minh với AI',
            'Phát triển content pillar strategy'
          ]
        }
      ];

      aiRecommendations.forEach((section, sectionIndex) => {
        aiRecsPage.drawText(section.title, {
          x: margin,
          y: yPosition,
          size: 16,
          font: helveticaBold,
          color: rgb(0.2, 0.6, 0.8),
        });
        yPosition -= 25;

        section.items.forEach((item, itemIndex) => {
          aiRecsPage.drawText(`• ${item}`, {
            x: margin + 15,
            y: yPosition - (itemIndex * 18),
            size: 11,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3),
          });
        });
        yPosition -= (section.items.length * 18 + 30);
      });

      addFooter(aiRecsPage, pageCounter++);
    }

    // === CONCLUSION AND ROADMAP ===
    const conclusionPage = addPage();
    yPosition = pageHeight - margin;

    conclusionPage.drawText(`${include_ai ? '7' : '3'}. KẾT LUẬN VÀ ROADMAP`, {
      x: margin,
      y: yPosition,
      size: 20,
      font: timesBold,
      color: rgb(0.2, 0.3, 0.8),
    });
    yPosition -= 50;

    // Priority actions
    conclusionPage.drawText('HÀNH ĐỘNG ưU TIÊN (30 ngày đầu):', {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: rgb(0.8, 0.3, 0.3),
    });
    yPosition -= 30;

    const priorityActions = [
      '1. Fix critical technical SEO issues',
      '2. Optimize meta tags và headings',
      '3. Improve page speed (target <3s)',
      ...(include_ai ? [
        '4. Implement semantic content optimization',
        '5. Build topic cluster structure'
      ] : [])
    ];

    priorityActions.forEach((action, index) => {
      conclusionPage.drawText(action, {
        x: margin + 10,
        y: yPosition - (index * 20),
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
    });

    yPosition -= (priorityActions.length * 20 + 40);

    // Timeline
    conclusionPage.drawText('TIMELINE DỰ KIẾN:', {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: rgb(0.2, 0.6, 0.2),
    });
    yPosition -= 30;

    const timeline = [
      'Tuần 1-2: Technical SEO fixes',
      'Tuần 3-4: Content optimization',
      'Tháng 2: Performance monitoring',
      'Tháng 3: Advanced AI implementation'
    ];

    timeline.forEach((item, index) => {
      conclusionPage.drawText(`• ${item}`, {
        x: margin + 10,
        y: yPosition - (index * 20),
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
    });

    yPosition -= (timeline.length * 20 + 40);

    // Expected results box
    conclusionPage.drawRectangle({
      x: margin,
      y: yPosition - 80,
      width: contentWidth,
      height: 80,
      color: rgb(0.95, 1, 0.95),
      borderColor: rgb(0.3, 0.8, 0.3),
      borderWidth: 2,
    });

    conclusionPage.drawText('KẾT QUẢ DỰ KIẾN SAU 3 THÁNG:', {
      x: margin + 15,
      y: yPosition - 20,
      size: 12,
      font: helveticaBold,
      color: rgb(0.2, 0.6, 0.2),
    });

    const expectedImprovement = Math.min((seoData?.score || 45) + 30, 95);
    conclusionPage.drawText(`• SEO Score: ${expectedImprovement}/100 (+${expectedImprovement - (seoData?.score || 45)} điểm)`, {
      x: margin + 15,
      y: yPosition - 40,
      size: 11,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    conclusionPage.drawText(`• Organic traffic: +40-60%`, {
      x: margin + 15,
      y: yPosition - 55,
      size: 11,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    addFooter(conclusionPage, pageCounter++);

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

    console.log('Standardized PDF report generated successfully:', { fileName, fileUrl });

    return new Response(
      JSON.stringify({
        success: true,
        file_url: fileUrl,
        report_id: reportData.id,
        file_name: fileName,
        pages: pageCounter - 1,
        report_type: include_ai ? 'Professional AI-Enhanced' : 'Standard SEO',
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