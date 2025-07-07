
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PageData {
  url: string;
  title: string;
  description: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  wordCount: number;
  missingSchema: string[];
  seoScore: number;
  readabilityScore: number;
  speedScore: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { rootDomain, maxPages = 100 } = await req.json()

    if (!rootDomain) {
      return new Response(
        JSON.stringify({ error: 'Root domain is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Starting fullscan for ${rootDomain} by user ${user.id}`)

    // Create initial scan record
    const { data: scanRecord, error: insertError } = await supabase
      .from('fullscan_results')
      .insert({
        user_id: user.id,
        root_domain: rootDomain,
        status: 'scanning',
        total_pages: 0,
        completed_pages: 0
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating scan record:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create scan record' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Start the scanning process (async)
    performFullScan(scanRecord.id, rootDomain, maxPages, supabase)

    return new Response(
      JSON.stringify({ 
        message: 'Full scan started',
        scanId: scanRecord.id,
        status: 'scanning'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Fullscan error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function performFullScan(scanId: string, rootDomain: string, maxPages: number, supabase: any) {
  try {
    console.log(`Performing full scan for ${rootDomain}`)

    const discoveredUrls = await crawlWebsite(rootDomain, maxPages)
    
    // Update total pages
    await supabase
      .from('fullscan_results')
      .update({ total_pages: discoveredUrls.length })
      .eq('id', scanId)

    const scanResults: PageData[] = []
    let completedPages = 0

    for (const url of discoveredUrls) {
      try {
        console.log(`Scanning page: ${url}`)
        const pageData = await analyzePage(url)
        scanResults.push(pageData)
        completedPages++

        // Update progress
        await supabase
          .from('fullscan_results')
          .update({ 
            completed_pages: completedPages,
            scan_data: scanResults 
          })
          .eq('id', scanId)

        // Small delay to avoid overwhelming the target site
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error scanning ${url}:`, error)
        completedPages++
      }
    }

    // Calculate summary statistics
    const summaryStats = calculateSummaryStats(scanResults)

    // Mark scan as completed
    await supabase
      .from('fullscan_results')
      .update({
        status: 'completed',
        completed_pages: completedPages,
        scan_data: scanResults,
        summary_stats: summaryStats
      })
      .eq('id', scanId)

    console.log(`Full scan completed for ${rootDomain}`)

  } catch (error) {
    console.error('Error in performFullScan:', error)
    
    // Mark scan as failed
    await supabase
      .from('fullscan_results')
      .update({ status: 'failed' })
      .eq('id', scanId)
  }
}

async function crawlWebsite(rootDomain: string, maxPages: number): Promise<string[]> {
  const visited = new Set<string>()
  const toVisit = [rootDomain]
  const discovered: string[] = []

  while (toVisit.length > 0 && discovered.length < maxPages) {
    const currentUrl = toVisit.shift()!
    
    if (visited.has(currentUrl)) continue
    visited.add(currentUrl)

    try {
      const response = await fetch(currentUrl, {
        headers: {
          'User-Agent': 'SEO Scanner Bot 1.0'
        }
      })

      if (!response.ok) continue

      discovered.push(currentUrl)
      
      const html = await response.text()
      const links = extractLinks(html, rootDomain)
      
      for (const link of links) {
        if (!visited.has(link) && !toVisit.includes(link)) {
          toVisit.push(link)
        }
      }

    } catch (error) {
      console.error(`Error crawling ${currentUrl}:`, error)
    }
  }

  return discovered
}

function extractLinks(html: string, rootDomain: string): string[] {
  const links: string[] = []
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  
  let match
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    
    if (href.startsWith('/')) {
      // Relative URL
      links.push(new URL(href, rootDomain).toString())
    } else if (href.startsWith(rootDomain)) {
      // Absolute URL within same domain
      links.push(href)
    }
  }

  return [...new Set(links)] // Remove duplicates
}

async function analyzePage(url: string): Promise<PageData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SEO Scanner Bot 1.0'
      }
    })

    const html = await response.text()
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    const description = descMatch ? descMatch[1].trim() : ''

    // Extract headings
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []
    const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || []
    
    const headings = {
      h1: h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
      h2: h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
      h3: h3Matches.map(h => h.replace(/<[^>]+>/g, '').trim())
    }

    // Calculate word count
    const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                           .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                           .replace(/<[^>]+>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim()
    
    const wordCount = textContent.split(' ').filter(word => word.length > 0).length

    // Check for missing schema
    const missingSchema = []
    if (!html.includes('application/ld+json')) {
      missingSchema.push('Structured Data')
    }
    if (!html.includes('og:title')) {
      missingSchema.push('Open Graph')
    }
    if (!html.includes('twitter:card')) {
      missingSchema.push('Twitter Cards')
    }

    // Calculate SEO score (simplified)
    let seoScore = 100
    if (!title) seoScore -= 20
    if (!description) seoScore -= 15
    if (headings.h1.length === 0) seoScore -= 15
    if (wordCount < 300) seoScore -= 10
    if (missingSchema.length > 0) seoScore -= (missingSchema.length * 10)

    // Calculate readability score (simplified)
    const avgWordsPerSentence = textContent.split(/[.!?]+/).length > 0 
      ? wordCount / textContent.split(/[.!?]+/).length 
      : 0
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2))

    // Simulate speed score
    const speedScore = Math.floor(Math.random() * 30) + 70

    return {
      url,
      title,
      description,
      headings,
      wordCount,
      missingSchema,
      seoScore: Math.max(0, seoScore),
      readabilityScore: Math.max(0, readabilityScore),
      speedScore
    }

  } catch (error) {
    console.error(`Error analyzing ${url}:`, error)
    return {
      url,
      title: '',
      description: '',
      headings: { h1: [], h2: [], h3: [] },
      wordCount: 0,
      missingSchema: ['Analysis Failed'],
      seoScore: 0,
      readabilityScore: 0,
      speedScore: 0
    }
  }
}

function calculateSummaryStats(pages: PageData[]) {
  if (pages.length === 0) {
    return {
      avg_seo_score: 0,
      avg_readability: 0,
      avg_speed: 0,
      issues_found: 0,
      total_pages: 0
    }
  }

  const totalSeoScore = pages.reduce((sum, page) => sum + page.seoScore, 0)
  const totalReadability = pages.reduce((sum, page) => sum + page.readabilityScore, 0)
  const totalSpeed = pages.reduce((sum, page) => sum + page.speedScore, 0)
  const totalIssues = pages.reduce((sum, page) => sum + page.missingSchema.length, 0)

  return {
    avg_seo_score: Math.round(totalSeoScore / pages.length),
    avg_readability: Math.round(totalReadability / pages.length),
    avg_speed: Math.round(totalSpeed / pages.length),
    issues_found: totalIssues,
    total_pages: pages.length
  }
}
