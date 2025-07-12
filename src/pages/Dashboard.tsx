
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SEODashboard } from '@/components/dashboard/seo-dashboard';
import { WebsiteAnalyzer } from '@/components/dashboard/website-analyzer';
import { ContentWriter } from '@/components/dashboard/content-writer';
import { APITokens } from '@/components/dashboard/api-tokens';
import { CompetitorAnalysis } from '@/components/dashboard/competitor-analysis';
import { MetaOptimizer } from '@/components/dashboard/meta-optimizer';
import { FAQGenerator } from '@/components/dashboard/faq-generator';
import { FullScoreAnalyzer } from '@/components/dashboard/full-score-analyzer';
import { ScanHistory } from '@/components/dashboard/scan-history';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { UsageTracker } from '@/components/dashboard/usage-tracker';
import { ScheduledScans } from '@/components/dashboard/scheduled-scans';
import { AdminSettings } from '@/components/dashboard/admin-settings';
import { AdminTestRunner } from '@/components/dashboard/admin-test-runner';
import { AdminOverview } from '@/components/dashboard/admin-overview';
import { UserProfile } from '@/components/UserProfile';
import { APITestComponent } from '@/components/dashboard/api-test-component';
import { Website, SEOIssue, mockSEOIssues } from '@/lib/types';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'overview';
    setActiveTab(tabFromUrl);
  }, [location.search]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard?tab=${tabId}`);
    }
  };
  

  // Mock website data for demonstration
  const mockWebsite: Website = {
    id: 'demo-1',
    url: 'https://example.com',
    name: 'Example Website',
    description: 'Demo website for SEO analysis',
    category: 'Business',
    lastScanDate: new Date().toISOString(),
    lastAnalyzed: new Date().toISOString(),
    seoScore: 75,
    pageSpeedScore: 85,
    mobileFriendlinessScore: 90,
    securityScore: 95,
    technologies: ['React', 'Tailwind CSS'],
    status: 'completed'
  };

  const handleAnalysisComplete = (result: any) => {
    console.log('Analysis completed:', result);
    // Here you can handle the analysis result, e.g., save to state, update UI, etc.
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SEODashboard website={mockWebsite} issues={mockSEOIssues} />;
      case 'analyzer':
        return <WebsiteAnalyzer onAnalysisComplete={handleAnalysisComplete} />;
      case 'writer':
        return <ContentWriter />;
      case 'meta-optimizer':
        return <MetaOptimizer />;
      case 'faq-generator':
        return <FAQGenerator />;
      case 'full-score':
        return <FullScoreAnalyzer />;
      case 'scan-history':
        return <ScanHistory />;
      case 'progress':
        return <ProgressTracker />;
      case 'usage':
        return <UsageTracker />;
      case 'api':
        return <APITokens />;
      case 'competitors':
        return <CompetitorAnalysis />;
      case 'scheduled':
        return <ScheduledScans />;
      case 'admin':
        return <AdminSettings />;
      case 'admin-overview':
        return <AdminOverview />;
      case 'test':
        return <APITestComponent />;
      case 'profile':
        return <UserProfile />;
      default:
        return <SEODashboard website={mockWebsite} issues={mockSEOIssues} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Mobile Dropdown */}
      <div className="lg:hidden p-4">
        <select 
          value={activeTab} 
          onChange={(e) => handleTabChange(e.target.value)}
          className="w-full p-3 bg-card border border-border rounded-lg text-foreground"
        >
          <option value="overview">📊 Overview</option>
          <option value="analyzer">🔍 Analyzer</option>
          <option value="writer">✍️ Writer</option>
          <option value="meta-optimizer">🏷️ Meta Tags</option>
          <option value="faq-generator">❓ FAQ Schema</option>
          <option value="full-score">🎯 Full Score</option>
          <option value="scan-history">📋 History</option>
          <option value="progress">📈 Progress</option>
          <option value="usage">📊 Usage</option>
          <option value="competitors">🏆 Competitors</option>
          <option value="scheduled">⏰ Scheduled</option>
          <option value="api">🔌 API</option>
          <option value="admin">⚙️ Admin</option>
          <option value="profile">👤 Profile</option>
        </select>
      </div>

      {/* Desktop: Simple Sidebar + Content */}
      <div className="lg:flex">
        {/* Simple Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:w-64 lg:min-h-screen lg:bg-card lg:border-r lg:border-border">
          <div className="p-6">
            <h1 className="text-xl font-bold text-foreground mb-6">SEO Dashboard</h1>
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'analyzer', label: 'Analyzer', icon: '🔍' },
                { id: 'writer', label: 'Writer', icon: '✍️' },
                { id: 'meta-optimizer', label: 'Meta Tags', icon: '🏷️' },
                { id: 'faq-generator', label: 'FAQ Schema', icon: '❓' },
                { id: 'full-score', label: 'Full Score', icon: '🎯' },
                { id: 'scan-history', label: 'History', icon: '📋' },
                { id: 'progress', label: 'Progress', icon: '📈' },
                { id: 'usage', label: 'Usage', icon: '📊' },
                { id: 'competitors', label: 'Competitors', icon: '🏆' },
                { id: 'scheduled', label: 'Scheduled', icon: '⏰' },
                { id: 'api', label: 'API', icon: '🔌' },
                { id: 'admin', label: 'Admin', icon: '⚙️' },
                { id: 'profile', label: 'Profile', icon: '👤' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
