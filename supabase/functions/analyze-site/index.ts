// 🔧 Supabase Edge Function: analyze-site (AI-Enhanced)

// Mục tiêu:
// - Nhận URL từ frontend
// - Crawl tiêu đề, mô tả, H1–H3, hình ảnh có alt
// - Gọi PageSpeed Insights API (mobile + desktop)
// - Phân tích SEO nâng cao bằng AI (GPT)
// - Trả JSON kết quả về frontend

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.0";
import { checkUserPlanLimit, incrementUserUsage, getUserIdFromRequest } from "../_shared/plan-utils.ts";

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

    // Check user plan limits
    const userId = await getUserIdFromRequest(req);
    if (userId) {
      console.log(`Checking plan limits for user: ${userId}`);
      const planCheck = await checkUserPlanLimit(userId);
      
      if (!planCheck.allowed) {
        return new Response(
          JSON.stringify({ 
            error: planCheck.error,
            plan: planCheck.plan,
            limitExceeded: true 
          }), 
          { 
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      console.log(`Plan check passed for user: ${userId}, remaining: ${planCheck.plan?.remaining_count}`);
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

    // Extract additional SEO elements
    const canonical = $('link[rel="canonical"]').attr("href") || "";
    const robotsMeta = $('meta[name="robots"]').attr("content") || "";
    const viewport = $('meta[name="viewport"]').attr("content") || "";
    
    // Social and i18n tags
    const ogTags: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, el) => {
      const prop = $(el).attr('property') || '';
      const content = $(el).attr('content') || '';
      if (prop) ogTags[prop] = content;
    });
    const twitterTags: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name') || '';
      const content = $(el).attr('content') || '';
      if (name) twitterTags[name] = content;
    });
    const hreflangs = $('link[rel="alternate"][hreflang]').map((_, el) => ({
      hreflang: $(el).attr('hreflang') || '',
      href: $(el).attr('href') || ''
    })).get();

    // Link analysis
    const pageUrl = new URL(url);
    const allAnchors = $('a[href]').map((_, el) => $(el).attr('href') || '').get();
    const internalLinks = allAnchors.filter((href: string) => {
      if (!href) return false;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
      if (href.startsWith('/')) return true;
      try { return new URL(href, pageUrl.origin).origin === pageUrl.origin; } catch { return false; }
    });
    const externalLinks = allAnchors.filter((href: string) => {
      if (!href) return false;
      if (!/^https?:\/\//i.test(href)) return false;
      try { return new URL(href).origin !== pageUrl.origin; } catch { return false; }
    });

    // JSON-LD schema extraction
    let jsonLd: any = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const txt = $(el).contents().text();
        if (txt) {
          const parsed = JSON.parse(txt);
          if (!jsonLd) jsonLd = parsed;
        }
      } catch (_) { /* ignore */ }
    });

    // Security checks
    const isHttps = pageUrl.protocol === 'https:';
    let mixedContentCount = 0;
    if (isHttps) {
      $('img[src], script[src], link[href]').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('href') || '';
        if (src.startsWith('http://')) mixedContentCount++;
      });
    }

    // robots.txt and sitemap
    let robotsTxtStatus: 'present' | 'missing' | 'error' = 'missing';
    let robotsContent = '';
    let disallowAll = false;
    let sitemapUrl = '';
    let sitemapFound = false;
    try {
      const robotsUrl = new URL('/robots.txt', pageUrl.origin).toString();
      const robotsRes = await fetch(robotsUrl);
      if (robotsRes.ok) {
        robotsTxtStatus = 'present';
        robotsContent = await robotsRes.text();
        disallowAll = /User-agent:\s*\*([\s\S]*?)Disallow:\s*\//i.test(robotsContent);
        const match = robotsContent.match(/Sitemap:\s*(.*)/i);
        if (match && match[1]) sitemapUrl = match[1].trim();
      }
    } catch (_) {
      robotsTxtStatus = 'error';
    }
    try {
      const smUrl = sitemapUrl || new URL('/sitemap.xml', pageUrl.origin).toString();
      const smRes = await fetch(smUrl, { method: 'HEAD' });
      sitemapFound = smRes.ok;
      if (!sitemapUrl) sitemapUrl = smUrl;
    } catch (_) {
      sitemapFound = false;
    }

    // Extract body text for AI analysis (limit to 6000 chars for GPT)
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const content = bodyText.slice(0, 6000);
    const wordCount = bodyText.split(" ").filter(Boolean).length;

    // Gọi PageSpeed API
    const pageSpeedApiKey = Deno.env.get("GOOGLE_PAGESPEED_API_KEY");
    if (!pageSpeedApiKey) {
      throw new Error("GOOGLE_PAGESPEED_API_KEY not configured");
    }

    const fetchPageSpeed = async (strategy: "mobile" | "desktop") => {
      const speedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        url
      )}&strategy=${strategy}&key=${pageSpeedApiKey}`;
      
      console.log(`Fetching PageSpeed for ${strategy}...`);
      const speedRes = await fetch(speedUrl);
      
      if (!speedRes.ok) {
        console.error(`PageSpeed API error for ${strategy}:`, speedRes.status, speedRes.statusText);
        return null;
      }
      
      return await speedRes.json();
    };

    // AI Analysis with OpenAI GPT
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    let aiAnalysis = null;
    
    if (openAIApiKey) {
      console.log("Starting AI analysis...");
      try {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `Bạn là một chuyên gia SEO. Hãy phân tích nội dung HTML sau để xác định các yếu tố SEO sau: 
- Intent của bài viết (Informational, Navigational, Transactional, Commercial)
- Semantic topic (từ khóa chính đang bao phủ)
- Từ khóa hoặc heading còn thiếu (content gap)
- Gợi ý thay title, meta description, và h1 tốt hơn
- Heading phụ nên bổ sung
- Mật độ từ khóa (top 5 keyword xuất hiện nhiều nhất)
- Tổng số từ trong nội dung
Trả về theo cấu trúc JSON chính xác.`
              },
              {
                role: 'user',
                content: `URL: ${url}
Title hiện tại: ${title}
Meta description hiện tại: ${metaDescription}
H1 tags: ${h1.join(", ")}
H2 tags: ${h2.join(", ")}
H3 tags: ${h3.join(", ")}
Số từ: ${wordCount}
Nội dung chính: ${content}`
              }
            ],
            temperature: 0.4,
            max_tokens: 2000,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiContent = aiData.choices[0].message.content;
          
          try {
            // Try to parse JSON from AI response
            const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              aiAnalysis = JSON.parse(jsonMatch[0]);
              console.log("AI analysis completed successfully");
            } else {
              console.error("No valid JSON found in AI response");
            }
          } catch (parseError) {
            console.error("Failed to parse AI response:", parseError.message);
          }
        } else {
          console.error("OpenAI API error:", aiResponse.status, aiResponse.statusText);
        }
      } catch (aiError) {
        console.error("AI analysis failed:", aiError.message);
      }
    } else {
      console.log("OPENAI_API_KEY not configured - skipping AI analysis");
    }

    // Run PageSpeed analysis in parallel with AI
    const [mobileResult, desktopResult] = await Promise.all([
      fetchPageSpeed("mobile"),
      fetchPageSpeed("desktop")
    ]);

    const getVitals = (res: any) => {
      const audits = res?.lighthouseResult?.audits || {};
      return {
        lcp: audits['largest-contentful-paint']?.numericValue ?? null,
        cls: audits['cumulative-layout-shift']?.numericValue ?? null,
        tbt: audits['total-blocking-time']?.numericValue ?? null,
        tti: audits['interactive']?.numericValue ?? null,
      };
    };

    const response = {
      seo: { 
        title, 
        metaDescription, 
        h1, 
        h2, 
        h3, 
        images,
        totalImages: images.length,
        imagesWithoutAlt: images.filter(img => !img.alt).length,
        canonical,
        robotsMeta,
        viewport,
        wordCount
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
      coreWebVitals: {
        mobile: mobileResult ? getVitals(mobileResult) : null,
        desktop: desktopResult ? getVitals(desktopResult) : null,
      },
      indexability: {
        robotsMeta,
        robotsTxtStatus,
        disallowAll,
        sitemapFound,
        sitemapUrl,
        canonical,
        canonicalMatches: canonical ? (() => {
          try { return new URL(canonical, pageUrl.origin).href === new URL(url).href; } catch { return false; }
        })() : false,
        indexable: robotsMeta.toLowerCase().includes('noindex') ? false : (!disallowAll),
      },
      social: {
        og: ogTags,
        twitter: twitterTags,
      },
      i18n: {
        hreflangs,
      },
      security: {
        isHttps,
        mixedContentCount,
      },
      links: {
        internal: internalLinks.length,
        external: externalLinks.length,
      },
      schemaMarkup: jsonLd ? {
        type: (Array.isArray(jsonLd) ? (jsonLd[0]?.['@type'] || 'WebPage') : (jsonLd['@type'] || 'WebPage')),
        jsonLd
      } : { type: 'WebPage', jsonLd: null },
      aiAnalysis: aiAnalysis || {
        searchIntent: "Unknown",
        semanticTopics: [],
        contentGap: [],
        suggestions: {
          newTitle: title,
          improvedMeta: metaDescription,
          extraHeadings: []
        },
        keywordDensity: [],
        technicalSEO: {
          hasCanonical: !!canonical,
          robotsDirective: robotsMeta || "Not specified",
          headingStructure: h1.length === 1 ? "Good" : h1.length === 0 ? "Missing H1" : "Multiple H1s",
          imageOptimization: images.length > 0 ? `${images.filter(img => !img.alt).length}/${images.length} images missing alt text` : "No images found"
        },
        overallScore: 50,
        priorityIssues: ["AI analysis unavailable"]
      }
    } as any;

    // Save results to Supabase database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseServiceKey) {
      console.log("Saving analysis results to database...");
      try {
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabaseClient.from("scans").insert({
          url,
          seo: response.seo,
          ai_analysis: response.aiAnalysis,
          user_id: userId
        });

        if (error) {
          console.error("Failed to save scan results:", error.message);
        } else {
          console.log("Scan results saved successfully");
          // Add the saved scan ID to the response if available
          if (data && data.length > 0) {
            response.scanId = data[0].id;
          }
        }
      } catch (dbError) {
        console.error("Database save error:", dbError.message);
      }
    } else {
      console.log("Supabase credentials not configured - skipping database save");
    }

    // Increment usage count for authenticated users
    if (userId) {
      const usageIncremented = await incrementUserUsage(userId);
      if (usageIncremented) {
        console.log(`Usage incremented for user: ${userId}`);
      } else {
        console.error(`Failed to increment usage for user: ${userId}`);
      }
    }

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