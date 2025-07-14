import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OnboardingRequest {
  user_id: string;
  email: string;
  user_name?: string;
}

const generateOnboardingEmails = (user: OnboardingRequest) => {
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/v1', '') || 'https://ycjdrqyztzweddtcodjo.supabase.co';
  
  return [
    {
      delay_days: 0, // Immediate
      subject: "🎉 Chào mừng đến với SEO AI - Hướng dẫn bắt đầu!",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Chào mừng ${user.user_name || 'bạn'} đến với SEO AI! 🚀</h1>
          
          <p>Cảm ơn bạn đã đăng ký tài khoản SEO AI - công cụ phân tích và tối ưu SEO thông minh nhất!</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0;">🎯 Bắt đầu ngay với 3 bước đơn giản:</h2>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Nhập URL website cần phân tích</li>
              <li>Chờ AI phân tích và tìm lỗi SEO</li>
              <li>Nhấn "Fix All" để AI tự động sửa lỗi</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🔍 Phân tích website ngay
            </a>
          </div>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin: 0 0 10px 0;">💡 Mẹo nhỏ:</h3>
            <p style="margin: 0;">AI sẽ phân tích 50+ yếu tố SEO và đưa ra gợi ý cụ thể để cải thiện thứ hạng của bạn!</p>
          </div>
          
          <p>Nếu cần hỗ trợ, đừng ngần ngại liên hệ với team của chúng tôi!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Trân trọng,<br>
            <strong>Đội ngũ SEO AI</strong>
          </p>
        </div>
      `,
      type: 'onboarding'
    },
    {
      delay_days: 2,
      subject: "🛠 Bạn đã thử tính năng Auto-Fix SEO chưa?",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc2626;">Chỉ 1 click để tăng điểm SEO! 🎯</h1>
          
          <p>Xin chào ${user.user_name || 'bạn'},</p>
          
          <p>Chúng tôi thấy bạn đã đăng ký tài khoản SEO AI được 2 ngày rồi. Bạn đã thử nghiệm tính năng <strong>Auto-Fix</strong> chưa?</p>
          
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 8px; color: white; margin: 20px 0;">
            <h2 style="margin: 0 0 15px 0;">🚀 Tại sao Auto-Fix lại mạnh?</h2>
            <ul style="margin: 0; padding-left: 20px;">
              <li>AI tự động viết lại title, meta description</li>
              <li>Tối ưu tốc độ tải trang</li>
              <li>Thêm alt text cho ảnh</li>
              <li>Cấu trúc heading chuẩn SEO</li>
              <li>Tạo schema markup tự động</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ⚡ Thử Auto-Fix ngay
            </a>
          </div>
          
          <div style="background: #ecfccb; border-left: 4px solid #65a30d; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #365314;">
              <strong>Thống kê:</strong> 90% khách hàng tăng điểm SEO từ 15-40% ngay lần đầu sử dụng!
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Trân trọng,<br>
            <strong>Đội ngũ SEO AI</strong>
          </p>
        </div>
      `,
      type: 'reminder'
    },
    {
      delay_days: 5,
      subject: "📊 So sánh: SEO thường vs SEO AI - Sự khác biệt gây sốc!",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">SEO AI vs SEO Thường - Ai thắng? 🏆</h1>
          
          <p>Xin chào ${user.user_name || 'bạn'},</p>
          
          <p>Sau 5 ngày, chúng tôi muốn chia sẻ với bạn sự khác biệt "chấn động" giữa SEO thường và SEO AI:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f1f5f9;">
              <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Tiêu chí</th>
              <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; color: #dc2626;">SEO Thường</th>
              <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; color: #16a34a;">SEO AI</th>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Thời gian phân tích</strong></td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">2-3 ngày</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; background: #dcfce7;"><strong>30 giây</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Số lỗi tìm được</strong></td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">5-10 lỗi cơ bản</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; background: #dcfce7;"><strong>50+ lỗi chi tiết</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Khả năng tự sửa</strong></td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">❌ Không</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; background: #dcfce7;"><strong>✅ Tự động</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Chi phí</strong></td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">$500-2000/tháng</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; background: #dcfce7;"><strong>$49/tháng</strong></td>
            </tr>
          </table>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 20px; border-radius: 8px; color: white; margin: 30px 0;">
            <h2 style="margin: 0 0 10px 0;">🎁 Ưu đái đặc biệt cho bạn:</h2>
            <p style="margin: 0 0 15px 0;">Nâng cấp Pro trong 48h tiếp theo để nhận:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Giảm 30%</strong> phí tháng đầu</li>
              <li><strong>Miễn phí</strong> phân tích toàn bộ website</li>
              <li><strong>Hỗ trợ</strong> 1-1 từ chuyên gia SEO</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/upgrade" style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🚀 Nâng cấp Pro ngay (Giảm 30%)
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            <em>* Ưu đái có hiệu lực trong 48h kể từ khi nhận email này</em>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Trân trọng,<br>
            <strong>Đội ngũ SEO AI</strong>
          </p>
        </div>
      `,
      type: 'promo'
    }
  ];
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

    const { user_id, email, user_name }: OnboardingRequest = await req.json();

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id and email' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log(`Scheduling onboarding emails for user: ${email}`);

    const emails = generateOnboardingEmails({ user_id, email, user_name });
    const now = new Date();

    // Insert all emails into the queue
    const emailInserts = emails.map(emailTemplate => ({
      user_id,
      email,
      subject: emailTemplate.subject,
      body: emailTemplate.body,
      send_at: new Date(now.getTime() + (emailTemplate.delay_days * 24 * 60 * 60 * 1000)).toISOString(),
      status: 'queued' as const,
      type: emailTemplate.type as 'onboarding' | 'reminder' | 'promo'
    }));

    const { data: insertedEmails, error: insertError } = await supabase
      .from('email_queue')
      .insert(emailInserts)
      .select();

    if (insertError) {
      console.error('Error inserting emails into queue:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to schedule emails' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log(`Successfully scheduled ${insertedEmails?.length || 0} emails for ${email}`);

    // Send the first email immediately (welcome email)
    const welcomeEmail = insertedEmails?.find(email => email.type === 'onboarding');
    if (welcomeEmail) {
      try {
        // Call the send-email-event function to send the welcome email immediately
        const emailResponse = await supabase.functions.invoke('send-email-event', {
          body: {
            email: welcomeEmail.email,
            subject: welcomeEmail.subject,
            content: welcomeEmail.body,
            user_id: welcomeEmail.user_id,
            email_type: 'onboarding'
          }
        });

        if (emailResponse.error) {
          console.error('Error sending welcome email:', emailResponse.error);
        } else {
          console.log('Welcome email sent successfully');
          
          // Update the email status in queue to 'sent'
          await supabase
            .from('email_queue')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString() 
            })
            .eq('id', welcomeEmail.id);
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Onboarding emails scheduled successfully',
        emails_scheduled: insertedEmails?.length || 0,
        scheduled_emails: insertedEmails?.map(email => ({
          id: email.id,
          subject: email.subject,
          send_at: email.send_at,
          type: email.type
        }))
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in schedule-onboarding-emails function:', error);
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