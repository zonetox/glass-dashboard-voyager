
export interface Website {
  id: string;
  url: string;
  status: 'analyzing' | 'completed' | 'error' | 'pending';
  seoScore: number;
  issues: number;
  lastAnalyzed: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SEOIssue {
  id: string;
  websiteId: string;
  type: 'title' | 'meta' | 'heading' | 'image' | 'performance' | 'mobile';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  isFixed: boolean;
}

export interface OptimizationProgress {
  websiteId: string;
  totalIssues: number;
  fixedIssues: number;
  inProgress: number;
  lastUpdated: string;
}

export const mockWebsiteData: Website = {
  id: "1",
  url: "https://example.com",
  status: "analyzing",
  seoScore: 65,
  issues: 12,
  lastAnalyzed: "2024-01-15",
  userId: "user-1",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
};

export const mockSEOIssues: SEOIssue[] = [
  {
    id: "1",
    websiteId: "1",
    type: "title",
    severity: "high",
    title: "Missing page titles",
    description: "5 pages are missing title tags",
    recommendation: "Add descriptive title tags to all pages",
    isFixed: false
  },
  {
    id: "2", 
    websiteId: "1",
    type: "performance",
    severity: "medium",
    title: "Slow loading images",
    description: "Images are not optimized for web",
    recommendation: "Compress and resize images",
    isFixed: true
  }
];
