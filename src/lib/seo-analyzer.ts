
import { Website, SEOIssue } from './types';
import { StandardizedSEOAnalyzer } from './standardized-seo-analyzer';

export class SEOAnalyzer {
  static async analyzeWebsite(url: string, projectId?: string, keywords: string[] = []): Promise<{
    seoScore: number;
    issues: SEOIssue[];
    status: 'pending' | 'analyzing' | 'completed' | 'error';
    analysisData?: any;
    standardizedAnalysis?: any;
    formattedOutput?: string;
  }> {
    try {
      console.log(`Starting analysis for: ${url}`);
      
      // Call the Supabase Edge Function
      const response = await fetch(
        `https://3a96eb71-2922-44f0-a7ed-cc31d816713b.supabase.co/functions/v1/analyze-website`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljamRycXl6dHp3ZWRkdGNvZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTc4MTQsImV4cCI6MjA2NzA5MzgxNH0.1hVFiDBUwBVrU8RnA4cBXDixt4-EQnNF6qtET7ruWXo`
          },
          body: JSON.stringify({ url, projectId })
        }
      );

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const analysisResult = await response.json();
      
      if (analysisResult.error) {
        throw new Error(analysisResult.error);
      }

      // Generate SEO issues based on analysis results
      const issues: SEOIssue[] = [];

      if (!analysisResult.title) {
        issues.push({
          id: crypto.randomUUID(),
          websiteId: projectId || '',
          type: 'title',
          severity: 'high',
          title: 'Missing page title',
          description: 'The page is missing a title tag',
          category: 'Meta Tags',
          affectedUrl: url,
          recommendation: 'Add a descriptive title tag to improve SEO',
          isFixed: false
        });
      }

      if (!analysisResult.metaDescription) {
        issues.push({
          id: crypto.randomUUID(),
          websiteId: projectId || '',
          type: 'meta',
          severity: 'high',
          title: 'Missing meta description',
          description: 'The page is missing a meta description',
          category: 'Meta Tags',
          affectedUrl: url,
          recommendation: 'Add a compelling meta description to improve click-through rates',
          isFixed: false
        });
      }

      if (analysisResult.headings?.h1?.length === 0) {
        issues.push({
          id: crypto.randomUUID(),
          websiteId: projectId || '',
          type: 'heading',
          severity: 'medium',
          title: 'Missing H1 tag',
          description: 'The page is missing an H1 heading',
          category: 'Content Structure',
          affectedUrl: url,
          recommendation: 'Add a clear H1 heading to structure your content',
          isFixed: false
        });
      }

      if (analysisResult.images?.missingAlt > 0) {
        issues.push({
          id: crypto.randomUUID(),
          websiteId: projectId || '',
          type: 'image',
          severity: 'medium',
          title: 'Images missing alt text',
          description: `${analysisResult.images.missingAlt} images are missing alt attributes`,
          category: 'Accessibility',
          affectedUrl: url,
          recommendation: 'Add descriptive alt text to all images for accessibility and SEO',
          isFixed: false
        });
      }

      if (analysisResult.pageSpeedInsights?.desktop?.score < 70) {
        issues.push({
          id: crypto.randomUUID(),
          websiteId: projectId || '',
          type: 'performance',
          severity: 'high',
          title: 'Poor page performance',
          description: `Page speed score is ${analysisResult.pageSpeedInsights.desktop.score}/100`,
          category: 'Performance',
          affectedUrl: url,
          recommendation: analysisResult.pageSpeedInsights.opportunities?.[0] || 'Optimize page loading speed',
          isFixed: false
        });
      }

      if (analysisResult.pageSpeedInsights?.mobile?.score < 70) {
        issues.push({
          id: crypto.randomUUID(),
          websiteId: projectId || '',
          type: 'mobile',
          severity: 'high',
          title: 'Poor mobile performance',
          description: `Mobile speed score is ${analysisResult.pageSpeedInsights.mobile.score}/100`,
          category: 'Mobile',
          affectedUrl: url,
          recommendation: 'Optimize for mobile performance',
          isFixed: false
        });
      }

      // Add AI-based recommendations as issues
      if (analysisResult.aiAnalysis?.improvementSuggestions) {
        analysisResult.aiAnalysis.improvementSuggestions.forEach((suggestion: string, index: number) => {
          issues.push({
            id: crypto.randomUUID(),
            websiteId: projectId || '',
            type: 'content',
            severity: 'medium',
            title: 'AI Content Suggestion',
            description: `AI recommendation: ${suggestion}`,
            category: 'Content Optimization',
            affectedUrl: url,
            recommendation: suggestion,
            isFixed: false
          });
        });
      }

      // Calculate SEO score based on various factors
      let seoScore = 100;
      
      // Deduct points for missing elements
      if (!analysisResult.title) seoScore -= 20;
      if (!analysisResult.metaDescription) seoScore -= 15;
      if (analysisResult.headings?.h1?.length === 0) seoScore -= 10;
      if (analysisResult.images?.missingAlt > 0) {
        seoScore -= Math.min(15, analysisResult.images.missingAlt * 2);
      }
      
      // Factor in performance scores
      if (analysisResult.pageSpeedInsights) {
        const avgPerformance = (
          analysisResult.pageSpeedInsights.desktop.score + 
          analysisResult.pageSpeedInsights.mobile.score
        ) / 2;
        seoScore = Math.round((seoScore + avgPerformance) / 2);
      }

      // Factor in AI citation potential (if available)
      if (analysisResult.aiAnalysis?.citationPotential) {
        const citationScore = this.extractCitationScore(analysisResult.aiAnalysis.citationPotential);
        if (citationScore > 0) {
          seoScore = Math.round((seoScore + citationScore * 10) / 2);
        }
      }

      seoScore = Math.max(0, Math.min(100, seoScore));

      // Create standardized analysis
      const standardizedAnalyzer = new StandardizedSEOAnalyzer(keywords);
      const standardizedAnalysis = standardizedAnalyzer.analyzeWithStandardFormat(analysisResult);
      const formattedOutput = standardizedAnalyzer.formatAnalysisOutput(standardizedAnalysis);

      console.log(`Analysis completed for: ${url}, Score: ${seoScore}`);
      console.log('Standardized Output:');
      console.log(formattedOutput);

      return {
        seoScore,
        issues,
        status: 'completed',
        analysisData: analysisResult,
        standardizedAnalysis,
        formattedOutput
      };

    } catch (error) {
      console.error('Analysis error:', error);
      return {
        seoScore: 0,
        issues: [],
        status: 'error',
        analysisData: { error: error.message },
        standardizedAnalysis: null,
        formattedOutput: 'Analysis failed'
      };
    }
  }

  private static extractCitationScore(citationText: string): number {
    // Extract numerical score from citation potential text
    const match = citationText.match(/(\d+)\/10/);
    return match ? parseInt(match[1]) : 5; // Default to 5 if no score found
  }

  static calculateOverallScore(websites: Website[]): number {
    if (websites.length === 0) return 0;
    const totalScore = websites.reduce((sum, site) => sum + site.seoScore, 0);
    return Math.round(totalScore / websites.length);
  }

  static getIssuesByPriority(issues: SEOIssue[]): {
    high: SEOIssue[];
    medium: SEOIssue[];
    low: SEOIssue[];
  } {
    return {
      high: issues.filter(issue => issue.severity === 'high'),
      medium: issues.filter(issue => issue.severity === 'medium'),
      low: issues.filter(issue => issue.severity === 'low')
    };
  }
}
