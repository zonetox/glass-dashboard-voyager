// 🔧 Supabase Edge Function: analyze-site (AI-Enhanced)

// Mục tiêu:
// - Nhận URL từ frontend
// - Crawl tiêu đề, mô tả, H1–H3, hình ảnh có alt
// - Gọi PageSpeed Insights API (mobile + desktop)
// - Phân tích SEO nâng cao bằng AI (GPT)
// - Trả JSON kết quả về frontend

import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Extract additional SEO elements
    const canonical = $('link[rel="canonical"]').attr("href") || "";
    const robotsMeta = $('meta[name="robots"]').attr("content") || "";
    const viewport = $('meta[name="viewport"]').attr("content") || "";
    
    // Extract body text for analysis
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText.split(" ").length;
    
    console.log(`SEO data extracted: ${h1.length} H1s, ${h2.length} H2s, ${h3.length} H3s, ${images.length} images, ${wordCount} words`);

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
        const aiPrompt = `Analyze this webpage content for advanced SEO insights:

URL: ${url}
Title: ${title}
Meta Description: ${metaDescription}
H1 tags: ${h1.join(", ")}
H2 tags: ${h2.join(", ")}
H3 tags: ${h3.join(", ")}
Word count: ${wordCount}
Images: ${images.length} total, ${images.filter(img => !img.alt).length} without alt text
Canonical: ${canonical}
Robots meta: ${robotsMeta}

Content preview (first 1000 chars): ${bodyText.substring(0, 1000)}

Please provide a JSON response with the following structure:
{
  "searchIntent": "string (Informational/Transactional/Commercial/Navigational)",
  "semanticTopics": ["array of main topics covered"],
  "contentGap": ["array of missing topics/headings that should be added"],
  "suggestions": {
    "newTitle": "improved title suggestion",
    "improvedMeta": "improved meta description",
    "extraHeadings": ["suggested H2/H3 headings to add"]
  },
  "keywordDensity": [{"keyword": "word", "density": 1.2}],
  "technicalSEO": {
    "hasCanonical": boolean,
    "robotsDirective": "string",
    "headingStructure": "string assessment",
    "imageOptimization": "string assessment"
  },
  "overallScore": number (1-100),
  "priorityIssues": ["array of top 3 issues to fix"]
}`;

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert SEO analyst. Analyze website content and provide detailed SEO insights in valid JSON format only.' },
              { role: 'user', content: aiPrompt }
            ],
            temperature: 0.3,
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