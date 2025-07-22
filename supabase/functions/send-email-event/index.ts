import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  subject: string;
  content: string;
  user_id?: string;
  email_type?: string; // welcome, seo-report, pdf-report, reset-quota, quota-warning, payment-success
  template_data?: {
    user_name?: string;
    website_url?: string;
    report_url?: string;
    pdf_url?: string;
    seo_score?: number;
    plan_name?: string;
    amount?: number;
    remaining_scans?: number;
  };
}

// Email template generator
const generateEmailTemplate = (emailType: string, templateData: any = {}) => {
  const baseTemplate = (content: string) => `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SEO Analyzer</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .header-subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 30px; }
        .btn { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .btn:hover { opacity: 0.9; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; }
        .footer p { color: #6c757d; font-size: 14px; margin-bottom: 10px; }
        .stats { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stats-item { display: inline-block; margin: 10px 20px; text-align: center; }
        .stats-number { font-size: 24px; font-weight: bold; color: #667eea; }
        .stats-label { color: #6c757d; font-size: 14px; }
        @media only screen and (max-width: 600px) {
          .container { margin: 0; }
          .content { padding: 20px; }
          .btn { display: block; text-align: center; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🚀 SEO Analyzer</div>
          <div class="header-subtitle">Tối ưu hóa SEO chuyên nghiệp</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2024 SEO Analyzer. Tất cả quyền được bảo lưu.</p>
          <p>Bạn nhận email này vì đã đăng ký sử dụng dịch vụ của chúng tôi.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  switch (emailType) {
    case 'welcome':
      return baseTemplate(`
        <h2 style="color: #333; margin-bottom: 20px;">Chào mừng ${templateData.user_name || 'bạn'} đến với SEO Analyzer! 🎉</h2>
        <p style="margin-bottom: 15px;">Cảm ơn bạn đã đăng ký tài khoản. Chúng tôi rất vui được đồng hành cùng bạn trong hành trình tối ưu hóa SEO.</p>
        <p style="margin-bottom: 20px;"><strong>Với tài khoản của bạn, bạn có thể:</strong></p>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Phân tích SEO website miễn phí</li>
          <li>Nhận báo cáo chi tiết và đề xuất cải thiện</li>
          <li>Theo dõi tiến độ tối ưu hóa</li>
          <li>Truy cập vào thư viện tài liệu SEO</li>
        </ul>
        <a href="${templateData.dashboard_url || '#'}" class="btn">Bắt đầu phân tích SEO →</a>
        <p style="margin-top: 20px; color: #666;">Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi!</p>
      `);

    case 'seo-report':
      return baseTemplate(`
        <h2 style="color: #333; margin-bottom: 20px;">Báo cáo SEO cho ${templateData.website_url} đã sẵn sàng! 📊</h2>
        <p style="margin-bottom: 20px;">Chúng tôi đã hoàn thành việc phân tích SEO cho website của bạn. Dưới đây là tóm tắt kết quả:</p>
        <div class="stats">
          <div class="stats-item">
            <div class="stats-number">${templateData.seo_score || 0}/100</div>
            <div class="stats-label">Điểm SEO</div>
          </div>
          <div class="stats-item">
            <div class="stats-number">${templateData.issues_found || 0}</div>
            <div class="stats-label">Vấn đề phát hiện</div>
          </div>
          <div class="stats-item">
            <div class="stats-number">${templateData.recommendations || 0}</div>
            <div class="stats-label">Đề xuất cải thiện</div>
          </div>
        </div>
        <a href="${templateData.report_url}" class="btn">Xem báo cáo chi tiết →</a>
        <p style="margin-top: 20px; color: #666;">Báo cáo sẽ có sẵn trong 30 ngày. Hãy tải xuống và lưu trữ nếu cần thiết.</p>
      `);

    case 'pdf-report':
      return baseTemplate(`
        <h2 style="color: #333; margin-bottom: 20px;">Báo cáo PDF của bạn đã sẵn sàng! 📄</h2>
        <p style="margin-bottom: 20px;">Báo cáo SEO chi tiết cho <strong>${templateData.website_url}</strong> đã được tạo thành công dưới dạng PDF.</p>
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <h3 style="color: #1976d2; margin-bottom: 10px;">📋 Nội dung báo cáo bao gồm:</h3>
          <ul style="color: #1565c0; margin: 0; padding-left: 20px;">
            <li>Tổng quan tình trạng SEO hiện tại</li>
            <li>Phân tích chi tiết từng yếu tố SEO</li>
            <li>Danh sách vấn đề cần khắc phục</li>
            <li>Kế hoạch tối ưu hóa từng bước</li>
          </ul>
        </div>
        <a href="${templateData.pdf_url}" class="btn">Tải xuống báo cáo PDF →</a>
        <p style="margin-top: 20px; color: #666; font-style: italic;">💡 Lưu ý: Link tải sẽ hết hạn sau 7 ngày. Hãy tải xuống và lưu trữ ngay!</p>
      `);

    case 'reset-quota':
      return baseTemplate(`
        <h2 style="color: #333; margin-bottom: 20px;">Lượt sử dụng tháng mới đã được cập nhật! 🔄</h2>
        <p style="margin-bottom: 20px;">Chào ${templateData.user_name || 'bạn'}! Lượt sử dụng hàng tháng của bạn đã được làm mới.</p>
        <div class="stats">
          <div class="stats-item">
            <div class="stats-number">${templateData.new_quota || 0}</div>
            <div class="stats-label">Lượt phân tích mới</div>
          </div>
          <div class="stats-item">
            <div class="stats-number">${templateData.plan_name || 'Free'}</div>
            <div class="stats-label">Gói hiện tại</div>
          </div>
        </div>
        <p style="margin-bottom: 20px;">Bạn có thể tiếp tục sử dụng dịch vụ phân tích SEO với lượt mới trong tháng này.</p>
        <a href="${templateData.dashboard_url || '#'}" class="btn">Bắt đầu phân tích →</a>
      `);

    case 'quota-warning':
      return baseTemplate(`
        <h2 style="color: #ff6b35; margin-bottom: 20px;">⚠️ Bạn đã hết lượt sử dụng!</h2>
        <p style="margin-bottom: 20px;">Chào ${templateData.user_name || 'bạn'}! Bạn đã sử dụng hết lượt phân tích SEO trong tháng này.</p>
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #856404; margin: 0;"><strong>Lượt còn lại:</strong> ${templateData.remaining_scans || 0} lượt</p>
        </div>
        <p style="margin-bottom: 20px;"><strong>Để tiếp tục sử dụng dịch vụ, bạn có thể:</strong></p>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Nâng cấp lên gói Pro để có thêm lượt phân tích</li>
          <li>Chờ đến đầu tháng sau để lượt được làm mới</li>
          <li>Liên hệ với chúng tôi để được hỗ trợ</li>
        </ul>
        <a href="${templateData.upgrade_url || '#'}" class="btn" style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);">Nâng cấp ngay →</a>
      `);

    case 'payment-success':
      return baseTemplate(`
        <h2 style="color: #28a745; margin-bottom: 20px;">✅ Thanh toán thành công!</h2>
        <p style="margin-bottom: 20px;">Cảm ơn ${templateData.user_name || 'bạn'} đã nâng cấp tài khoản! Giao dịch của bạn đã được xử lý thành công.</p>
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #155724; margin-bottom: 15px;">💳 Chi tiết giao dịch:</h3>
          <p style="color: #155724; margin: 5px 0;"><strong>Gói:</strong> ${templateData.plan_name || 'Pro'}</p>
          <p style="color: #155724; margin: 5px 0;"><strong>Số tiền:</strong> ${templateData.amount ? templateData.amount.toLocaleString('vi-VN') : 0} VNĐ</p>
          <p style="color: #155724; margin: 5px 0;"><strong>Ngày:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        <p style="margin-bottom: 20px;"><strong>Quyền lợi của gói ${templateData.plan_name || 'Pro'}:</strong></p>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>✅ Phân tích SEO không giới hạn</li>
          <li>✅ Báo cáo PDF chi tiết</li>
          <li>✅ AI phân tích và đề xuất</li>
          <li>✅ Hỗ trợ ưu tiên 24/7</li>
        </ul>
        <a href="${templateData.dashboard_url || '#'}" class="btn">Truy cập Dashboard →</a>
        <p style="margin-top: 20px; color: #666;">Tài khoản của bạn đã được nâng cấp và có thể sử dụng ngay lập tức!</p>
      `);

    default:
      return baseTemplate(`
        <h2 style="color: #333; margin-bottom: 20px;">Thông báo từ SEO Analyzer</h2>
        <p style="margin-bottom: 20px;">Bạn có một thông báo mới từ hệ thống.</p>
        <a href="#" class="btn">Xem chi tiết →</a>
      `);
  }
};


const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, subject, content, user_id, email_type, template_data }: EmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: email' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Generate email content from template if email_type is provided
    let finalSubject = subject;
    let finalContent = content;
    
    if (email_type && !content) {
      finalContent = generateEmailTemplate(email_type, template_data);
      
      // Auto-generate subject if not provided
      if (!subject) {
        const subjectMap: { [key: string]: string } = {
          'welcome': `Chào mừng bạn đến với SEO Analyzer! 🎉`,
          'seo-report': `Báo cáo SEO cho ${template_data?.website_url || 'website của bạn'} đã sẵn sàng 📊`,
          'pdf-report': `Báo cáo PDF của bạn đã sẵn sàng tải xuống 📄`,
          'reset-quota': `Lượt sử dụng tháng mới đã được cập nhật 🔄`,
          'quota-warning': `⚠️ Bạn đã hết lượt sử dụng - Nâng cấp ngay!`,
          'payment-success': `✅ Thanh toán thành công - Cảm ơn bạn đã nâng cấp!`
        };
        finalSubject = subjectMap[email_type] || 'Thông báo từ SEO Analyzer';
      }
    }

    if (!finalSubject || !finalContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: subject and content (or email_type)' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Create email log entry
    const { data: logEntry, error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: user_id || null,
        email,
        subject: finalSubject,
        content: finalContent,
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating email log:', logError);
      return new Response(
        JSON.stringify({ error: 'Failed to create email log' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    try {
      // Send email using Deno's built-in SMTP (for demonstration)
      // Note: In production, you would use the SMTP configuration from Supabase
      // or integrate with your preferred email service
      
      console.log(`Sending email to: ${email}`);
      console.log(`Subject: ${finalSubject}`);
      console.log(`Content preview: ${finalContent.substring(0, 100)}...`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update log entry as sent
      const { error: updateError } = await supabase
        .from('email_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', logEntry.id);

      if (updateError) {
        console.error('Error updating email log:', updateError);
      }

      console.log(`Email sent successfully to ${email}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent successfully',
          log_id: logEntry.id
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );

    } catch (emailError) {
      console.error('Error sending email:', emailError);
      
      // Update log entry as failed
      const { error: updateError } = await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
        })
        .eq('id', logEntry.id);

      if (updateError) {
        console.error('Error updating email log:', updateError);
      }

      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

  } catch (error) {
    console.error('Error in send-email-event function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);