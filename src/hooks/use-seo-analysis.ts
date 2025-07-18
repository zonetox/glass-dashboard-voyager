
import { useState, useEffect } from 'react';
import { Website, SEOIssue, projectToWebsite } from '@/lib/types';
import { SEOAnalyzer } from '@/lib/seo-analyzer';
import { useAuth } from '@/hooks/useAuth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLoadingState } from '@/hooks/useLoadingState';
import { 
  createProject, 
  getProjectsByUser, 
  updateProjectStatus, 
  subscribeToProjects 
} from '@/lib/database';
import type { Project } from '@/lib/types';

export function useSEOAnalysis() {
  const { user } = useAuth();
  const { error, isError, clearError, withErrorHandling } = useErrorHandler();
  const { isLoading, progress, startLoading, updateProgress, stopLoading, withLoading } = useLoadingState('Loading projects...');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [issues, setIssues] = useState<SEOIssue[]>([]);

  // Load user's projects on mount
  useEffect(() => {
    if (user?.id) {
      loadProjects();
    }
  }, [user?.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (user?.id) {
      const channel = subscribeToProjects(user.id, (updatedProjects) => {
        setProjects(updatedProjects);
        setWebsites(updatedProjects.map(projectToWebsite));
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user?.id]);

  const loadProjects = withLoading(
    withErrorHandling(async () => {
      if (!user?.id) return;

      const userProjects = await getProjectsByUser(user.id);
      setProjects(userProjects);
      setWebsites(userProjects.map(projectToWebsite));
    }),
    'Loading projects...'
  );

  const analyzeWebsite = withErrorHandling(async (url: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in');
    }

    startLoading('Analyzing website...');

    try {
      // Validate URL
      new URL(url);
      updateProgress(10, 'Creating project...');
      
      // Create project in database
      const project = await createProject(user.id, url);
      if (!project) {
        throw new Error('Failed to create project');
      }

      updateProgress(25, 'Starting analysis...');
      // Update project status to analyzing
      await updateProjectStatus(project.id, 'analyzing');
      
      updateProgress(50, 'Running SEO analysis...');
      // Perform analysis with project ID so results are saved
      const analysisResult = await SEOAnalyzer.analyzeWebsite(url, project.id);
      
      updateProgress(75, 'Saving results...');
      // Update project with results
      await updateProjectStatus(
        project.id, 
        analysisResult.status, 
        analysisResult.seoScore
      );

      // Update local issues with the new analysis results
      if (analysisResult.issues.length > 0) {
        setIssues(prev => [...prev, ...analysisResult.issues]);
      }

      // Store analysis data with the website for the dashboard
      setWebsites(prev => prev.map(website => 
        website.id === project.id 
          ? { ...website, analysisData: analysisResult.analysisData }
          : website
      ));

      updateProgress(90, 'Finalizing...');
      // Reload projects to get updated data
      await loadProjects();
      updateProgress(100, 'Complete!');

    } finally {
      stopLoading();
    }
  });

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
    progress,
    error: error?.message || null,
    isError,
    clearError,
    overallScore,
    totalIssues,
    fixedIssues,
    analyzeWebsite,
    getWebsiteIssues,
    toggleIssueFixed,
    loadProjects
  };
}
