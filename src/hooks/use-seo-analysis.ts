
import { useState, useEffect } from 'react';
import { Website, SEOIssue, mockWebsiteData, mockSEOIssues } from '@/lib/types';
import { SEOAnalyzer } from '@/lib/seo-analyzer';

export function useSEOAnalysis() {
  const [websites, setWebsites] = useState<Website[]>([mockWebsiteData]);
  const [issues, setIssues] = useState<SEOIssue[]>(mockSEOIssues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWebsite = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate URL
      new URL(url);
      
      const analysisResult = await SEOAnalyzer.analyzeWebsite(url);
      
      const newWebsite: Website = {
        id: crypto.randomUUID(),
        url,
        status: analysisResult.status,
        seoScore: analysisResult.seoScore,
        issues: analysisResult.issues.length,
        lastAnalyzed: new Date().toISOString().split('T')[0],
        userId: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setWebsites(prev => [newWebsite, ...prev]);
      setIssues(prev => [...analysisResult.issues.map(issue => ({
        ...issue,
        websiteId: newWebsite.id
      })), ...prev]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getWebsiteIssues = (websiteId: string) => {
    return issues.filter(issue => issue.websiteId === websiteId);
  };

  const toggleIssueFixed = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, isFixed: !issue.isFixed }
        : issue
    ));
  };

  const overallScore = SEOAnalyzer.calculateOverallScore(websites);
  const totalIssues = issues.length;
  const fixedIssues = issues.filter(issue => issue.isFixed).length;

  return {
    websites,
    issues,
    isLoading,
    error,
    overallScore,
    totalIssues,
    fixedIssues,
    analyzeWebsite,
    getWebsiteIssues,
    toggleIssueFixed
  };
}
