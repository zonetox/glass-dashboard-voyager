// 🔧 Supabase Edge Function: analyze-site

// Mục tiêu:
// - Nhận URL từ frontend
// - Crawl tiêu đề, mô tả, H1–H3, hình ảnh có alt
// - Gọi PageSpeed Insights API (mobile + desktop)
// - Trả JSON kết quả về frontend

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "Missing URL" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Analyzing website: ${url}`);

    // Crawl trang
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    
    const html = await res.text();

    const cheerio = await import("https://esm.sh/cheerio@1.0.0-rc.12");
    const $ = cheerio.load(html);

    const title = $("title").text() || "";
    const metaDescription = $('meta[name="description"]').attr("content") || "";

    const h1 = $("h1").map((_, el) => $(el).text()).get();
    const h2 = $("h2").map((_, el) => $(el).text()).get();
    const h3 = $("h3").map((_, el) => $(el).text()).get();

    const images = $("img").map((_, el) => ({
      src: $(el).attr("src") || "",
      alt: $(el).attr("alt") || "",
    })).get();

    console.log(`SEO data extracted: ${h1.length} H1s, ${h2.length} H2s, ${h3.length} H3s, ${images.length} images`);

    // Gọi PageSpeed API
    const apiKey = Deno.env.get("GOOGLE_PAGESPEED_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_PAGESPEED_API_KEY not configured");
    }

    const fetchPageSpeed = async (strategy: "mobile" | "desktop") => {
      const speedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        url
      )}&strategy=${strategy}&key=${apiKey}`;
      
      console.log(`Fetching PageSpeed for ${strategy}...`);
      const speedRes = await fetch(speedUrl);
      
      if (!speedRes.ok) {
        console.error(`PageSpeed API error for ${strategy}:`, speedRes.status, speedRes.statusText);
        return null;
      }
      
      return await speedRes.json();
    };

    const [mobileResult, desktopResult] = await Promise.all([
      fetchPageSpeed("mobile"),
      fetchPageSpeed("desktop")
    ]);

    const response = {
      seo: { 
        title, 
        metaDescription, 
        h1, 
        h2, 
        h3, 
        images,
        totalImages: images.length,
        imagesWithoutAlt: images.filter(img => !img.alt).length
      },
      performance: {
        mobile: mobileResult ? {
          score: mobileResult.lighthouseResult?.categories?.performance?.score || null,
          metrics: mobileResult.lighthouseResult?.audits || {},
        } : null,
        desktop: desktopResult ? {
          score: desktopResult.lighthouseResult?.categories?.performance?.score || null,
          metrics: desktopResult.lighthouseResult?.audits || {},
        } : null,
      },
    };

    console.log(`Analysis completed successfully for ${url}`);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }, 
        status: 200 
      }
    );
  } catch (e) {
    console.error("Error in analyze-site function:", e.message);
    return new Response(
      JSON.stringify({ error: e.message }), 
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      }
    );
  }
});