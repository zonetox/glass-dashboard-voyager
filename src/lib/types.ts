export interface Website {
  id: string;
  url: string;
  name: string;
  description: string;
  category: string;
  lastScanDate: string;
  seoScore: number;
  pageSpeedScore: number;
  mobileFriendlinessScore: number;
  securityScore: number;
  technologies: string[];
}

export interface SEOIssue {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
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
