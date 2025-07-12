import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, user_id } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Lấy API keys từ environment variables
    const googleKey = Deno.env.get("GOOGLE_PAGESPEED_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log('Environment check:', {
      hasGoogleKey: !!googleKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    });

    if (!googleKey) {
      console.error('GOOGLE_PAGESPEED_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Google PageSpeed API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log(`Starting PageSpeed analysis for: ${url}`);

    // Function để gọi Google PageSpeed API
    const fetchPageSpeed = async (strategy: "desktop" | "mobile") => {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${googleKey}&strategy=${strategy}&category=performance&category=seo&category=accessibility&category=best-practices`;
      
      console.log(`Fetching PageSpeed data for ${strategy}...`);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`PageSpeed API error for ${strategy}: ${response.status}`);
      }
      
      return await response.json();
    };

    // Gọi PageSpeed API cho cả desktop và mobile
    let performance = { desktop: 0, mobile: 0 };
    let seoScore = { desktop: 0, mobile: 0 };
    let accessibilityScore = { desktop: 0, mobile: 0 };
    let bestPracticesScore = { desktop: 0, mobile: 0 };
    let pageSpeedDetails = {};

    try {
      const [desktopResult, mobileResult] = await Promise.all([
        fetchPageSpeed("desktop"),
        fetchPageSpeed("mobile")
      ]);

      // Trích xuất điểm số
      performance = {
        desktop: Math.round((desktopResult.lighthouseResult?.categories?.performance?.score || 0) * 100),
        mobile: Math.round((mobileResult.lighthouseResult?.categories?.performance?.score || 0) * 100),
      };

      seoScore = {
        desktop: Math.round((desktopResult.lighthouseResult?.categories?.seo?.score || 0) * 100),
        mobile: Math.round((mobileResult.lighthouseResult?.categories?.seo?.score || 0) * 100),
      };

      accessibilityScore = {
        desktop: Math.round((desktopResult.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
        mobile: Math.round((mobileResult.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
      };

      bestPracticesScore = {
        desktop: Math.round((desktopResult.lighthouseResult?.categories?.["best-practices"]?.score || 0) * 100),
        mobile: Math.round((mobileResult.lighthouseResult?.categories?.["best-practices"]?.score || 0) * 100),
      };

      // Chi tiết PageSpeed
      pageSpeedDetails = {
        desktop: {
          loadingExperience: desktopResult.loadingExperience,
          lighthouseResult: {
            requestedUrl: desktopResult.lighthouseResult?.requestedUrl,
            finalUrl: desktopResult.lighthouseResult?.finalUrl,
            audits: {
              'first-contentful-paint': desktopResult.lighthouseResult?.audits?.['first-contentful-paint'],
              'largest-contentful-paint': desktopResult.lighthouseResult?.audits?.['largest-contentful-paint'],
              'cumulative-layout-shift': desktopResult.lighthouseResult?.audits?.['cumulative-layout-shift'],
              'total-blocking-time': desktopResult.lighthouseResult?.audits?.['total-blocking-time'],
            }
          }
        },
        mobile: {
          loadingExperience: mobileResult.loadingExperience,
          lighthouseResult: {
            requestedUrl: mobileResult.lighthouseResult?.requestedUrl,
            finalUrl: mobileResult.lighthouseResult?.finalUrl,
            audits: {
              'first-contentful-paint': mobileResult.lighthouseResult?.audits?.['first-contentful-paint'],
              'largest-contentful-paint': mobileResult.lighthouseResult?.audits?.['largest-contentful-paint'],
              'cumulative-layout-shift': mobileResult.lighthouseResult?.audits?.['cumulative-layout-shift'],
              'total-blocking-time': mobileResult.lighthouseResult?.audits?.['total-blocking-time'],
            }
          }
        }
      };

      console.log(`PageSpeed analysis completed. Performance - Desktop: ${performance.desktop}, Mobile: ${performance.mobile}`);

    } catch (error) {
      console.error("PageSpeed API error:", error);
      // Nếu PageSpeed fail, vẫn tiếp tục với giá trị mặc định
    }

    // Tạo SEO analysis dựa trên kết quả thực tế
    const seo = {
      performance,
      seoScore,
      accessibilityScore,
      bestPracticesScore,
      pageSpeedDetails,
      analyzedUrl: url,
      timestamp: new Date().toISOString(),
    };

    // AI Analysis dựa trên điểm số
    const generateAIAnalysis = () => {
      const suggestions = [];
      const avgPerformance = (performance.desktop + performance.mobile) / 2;
      const avgSEO = (seoScore.desktop + seoScore.mobile) / 2;

      if (avgPerformance < 50) {
        suggestions.push("Performance cần cải thiện đáng kể. Hãy tối ưu hình ảnh và giảm thời gian tải trang.");
      } else if (avgPerformance < 80) {
        suggestions.push("Performance tốt nhưng có thể cải thiện thêm bằng cách tối ưu JavaScript và CSS.");
      } else {
        suggestions.push("Performance tuyệt vời! Tiếp tục duy trì tốc độ tải nhanh.");
      }

      if (avgSEO < 50) {
        suggestions.push("SEO cần cải thiện. Hãy thêm meta description, title tags và structured data.");
      } else if (avgSEO < 80) {
        suggestions.push("SEO khá tốt, có thể cải thiện thêm bằng cách tối ưu internal linking.");
      } else {
        suggestions.push("SEO rất tốt! Website đã được tối ưu tốt cho search engines.");
      }

      return {
        suggestions,
        summary: `Website có điểm performance trung bình ${avgPerformance}/100 và SEO ${avgSEO}/100.`,
        overallScore: Math.round((avgPerformance + avgSEO + (accessibilityScore.desktop + accessibilityScore.mobile) / 2 + (bestPracticesScore.desktop + bestPracticesScore.mobile) / 2) / 4),
        recommendations: suggestions
      };
    };

    const ai_analysis = generateAIAnalysis();

    // Lưu kết quả vào database
    const { data, error } = await supabase.from("scans").insert({
      url,
      user_id: user_id || null,
      seo,
      ai_analysis,
    });

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: 'Failed to save scan results' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Scan results saved successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          seo,
          ai_analysis,
          scanId: data?.[0]?.id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in pagespeed-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});