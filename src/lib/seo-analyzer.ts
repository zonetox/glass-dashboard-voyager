
import { Website, SEOIssue } from './types';

export class SEOAnalyzer {
  static async analyzeWebsite(url: string): Promise<{
    seoScore: number;
    issues: SEOIssue[];
    status: Website['status'];
  }> {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis results
    return {
      seoScore: Math.floor(Math.random() * 40) + 60, // 60-100
      issues: [
        {
          id: crypto.randomUUID(),
          websiteId: '',
          type: 'title',
          severity: 'high',
          title: 'Missing meta titles',
          description: 'Some pages are missing title tags',
          recommendation: 'Add descriptive title tags to improve SEO',
          isFixed: false
        },
        {
          id: crypto.randomUUID(),
          websiteId: '',
          type: 'performance',
          severity: 'medium',  
          title: 'Image optimization needed',
          description: 'Images could be compressed for better performance',
          recommendation: 'Use WebP format and compress images',
          isFixed: false
        }
      ],
      status: 'completed'
    };
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
