
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Tabs - Responsive Scrollable */}
        <div className="border-b border-border">
          <nav className="flex overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 min-w-max px-4">
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
                { id: 'admin', label: 'Admin', icon: '⚙️' },
                { id: 'admin-overview', label: 'Admin Overview', icon: '👨‍💼' },
                { id: 'test', label: 'Test', icon: '🧪' },
                { id: 'api', label: 'API', icon: '🔌' },
                { id: 'profile', label: 'Profile', icon: '👤' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                    activeTab === item.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
