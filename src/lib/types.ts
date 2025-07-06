
export interface Website {
  id: string;
  url: string;
  name: string;
  description: string;
  category: string;
  lastScanDate: string;
  lastAnalyzed: string;
  seoScore: number;
  pageSpeedScore: number;
  mobileFriendlinessScore: number;
  securityScore: number;
  technologies: string[];
  status: 'pending' | 'analyzing' | 'completed' | 'error';
}

export interface SEOIssue {
  id: string;
  websiteId: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  type: string;
  affectedUrl: string;
  recommendation: string;
  isFixed: boolean;
}

export interface AnalysisResult {
  seoScore: number;
  pageSpeedScore: number;
  mobileFriendlinessScore: number;
  securityScore: number;
  issues: SEOIssue[];
}

export interface Project {
  id: string;
  user_id: string;
  website_url: string;
  status: string;
  seo_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectInsert {
  user_id: string;
  website_url: string;
  status?: string;
  seo_score?: number;
}

export interface SeoAnalysis {
  id: string;
  project_id: string;
  analysis_data: any;
  issues_found?: number;
  recommendations: any;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  tier: 'free' | 'pro' | 'agency';
  scans_limit: number;
  ai_rewrites_limit: number;
  optimizations_limit: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserUsage {
  id: string;
  user_id: string;
  scans_used: number;
  ai_rewrites_used: number;
  optimizations_used: number;
  reset_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScanResult {
  id: string;
  user_id: string;
  website_url: string;
  scan_data_path?: string;
  optimization_log_path?: string;
  pdf_report_path?: string;
  seo_score?: number;
  issues_count?: number;
  status: string;
  created_at?: string;
}

// Mock data for development
export const mockSEOIssues: SEOIssue[] = [
  {
    id: '1',
    websiteId: 'mock-1',
    title: 'Missing meta description',
    description: 'Your page is missing a meta description',
    severity: 'high',
    category: 'Meta Tags',
    type: 'meta',
    affectedUrl: '/',
    recommendation: 'Add a compelling meta description',
    isFixed: false
  }
];

// Helper function to convert Project to Website
export function projectToWebsite(project: Project): Website {
  return {
    id: project.id,
    url: project.website_url,
    name: new URL(project.website_url).hostname,
    description: `SEO analysis for ${project.website_url}`,
    category: 'Website',
    lastScanDate: project.created_at || new Date().toISOString(),
    lastAnalyzed: project.updated_at || project.created_at || new Date().toISOString(),
    seoScore: project.seo_score || 0,
    pageSpeedScore: 0,
    mobileFriendlinessScore: 0,
    securityScore: 0,
    technologies: [],
    status: (project.status as 'pending' | 'analyzing' | 'completed' | 'error') || 'pending'
  };
}
