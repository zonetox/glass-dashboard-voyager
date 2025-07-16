
import { useState, useEffect } from 'react';
import { Website, SEOIssue, projectToWebsite } from '@/lib/types';
import { SEOAnalyzer } from '@/lib/seo-analyzer';
import { useAuth } from '@/hooks/useAuth';
import { 
  createProject, 
  getProjectsByUser, 
  updateProjectStatus, 
  subscribeToProjects 
} from '@/lib/database';
import type { Project } from '@/lib/types';

export function useSEOAnalysis() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const loadProjects = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const userProjects = await getProjectsByUser(user.id);
      setProjects(userProjects);
      setWebsites(userProjects.map(projectToWebsite));
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWebsite = async (url: string) => {
    if (!user?.id) {
      setError('User must be logged in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate URL
      new URL(url);
      
      // Create project in database
      const project = await createProject(user.id, url);
      if (!project) {
        throw new Error('Failed to create project');
      }

      // Update project status to analyzing
      await updateProjectStatus(project.id, 'analyzing');
      
      // Perform analysis with project ID so results are saved
      const analysisResult = await SEOAnalyzer.analyzeWebsite(url, project.id);
      
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

      // Reload projects to get updated data
      await loadProjects();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Analysis error:', err);
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
    toggleIssueFixed,
    loadProjects
  };
}
