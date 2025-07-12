
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
      <div className="min-h-screen bg-background">
        {/* Mobile Tab Selector */}
        <div className="lg:hidden mb-6">
          <select 
            value={activeTab} 
            onChange={(e) => handleTabChange(e.target.value)}
            className="w-full p-3 bg-card border border-border rounded-lg text-foreground"
          >
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'analyzer', label: '🔍 Analyzer' },
              { id: 'writer', label: '✍️ Writer' },
              { id: 'meta-optimizer', label: '🏷️ Meta Tags' },
              { id: 'faq-generator', label: '❓ FAQ Schema' },
              { id: 'full-score', label: '🎯 Full Score' },
              { id: 'scan-history', label: '📋 History' },
              { id: 'progress', label: '📈 Progress' },
              { id: 'usage', label: '📊 Usage' },
              { id: 'competitors', label: '🏆 Competitors' },
              { id: 'scheduled', label: '⏰ Scheduled' },
              { id: 'admin', label: '⚙️ Admin' },
              { id: 'admin-overview', label: '👨‍💼 Admin Overview' },
              { id: 'test', label: '🧪 Test' },
              { id: 'api', label: '🔌 API' },
              { id: 'profile', label: '👤 Profile' },
            ].map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Grid Layout */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-8 xl:grid-cols-6">
          {/* Left Sidebar Navigation - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-2">
              <h2 className="text-lg font-semibold text-foreground mb-4 px-3">Navigation</h2>
              
              {/* Main Section */}
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Main</h3>
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'analyzer', label: 'Analyzer', icon: '🔍' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* SEO Tools Section */}
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">SEO Tools</h3>
                {[
                  { id: 'writer', label: 'Writer', icon: '✍️' },
                  { id: 'meta-optimizer', label: 'Meta Tags', icon: '🏷️' },
                  { id: 'faq-generator', label: 'FAQ Schema', icon: '❓' },
                  { id: 'full-score', label: 'Full Score', icon: '🎯' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Reports Section */}
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Reports</h3>
                {[
                  { id: 'scan-history', label: 'History', icon: '📋' },
                  { id: 'progress', label: 'Progress', icon: '📈' },
                  { id: 'usage', label: 'Usage', icon: '📊' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Analysis Section */}
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Analysis</h3>
                {[
                  { id: 'competitors', label: 'Competitors', icon: '🏆' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Automation Section */}
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Automation</h3>
                {[
                  { id: 'scheduled', label: 'Scheduled', icon: '⏰' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Settings Section */}
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Settings</h3>
                {[
                  { id: 'api', label: 'API', icon: '🔌' },
                  { id: 'admin', label: 'Admin', icon: '⚙️' },
                  { id: 'admin-overview', label: 'Admin Overview', icon: '👨‍💼' },
                  { id: 'test', label: 'Test', icon: '🧪' },
                  { id: 'profile', label: 'Profile', icon: '👤' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4 xl:col-span-5">
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {[
                      { id: 'overview', label: 'Dashboard Overview' },
                      { id: 'analyzer', label: 'Website Analyzer' },
                      { id: 'writer', label: 'Content Writer' },
                      { id: 'meta-optimizer', label: 'Meta Tags Optimizer' },
                      { id: 'faq-generator', label: 'FAQ Schema Generator' },
                      { id: 'full-score', label: 'Full Score Analysis' },
                      { id: 'scan-history', label: 'Scan History' },
                      { id: 'progress', label: 'Progress Tracker' },
                      { id: 'usage', label: 'Usage Statistics' },
                      { id: 'competitors', label: 'Competitor Analysis' },
                      { id: 'scheduled', label: 'Scheduled Scans' },
                      { id: 'admin', label: 'Admin Settings' },
                      { id: 'admin-overview', label: 'Admin Overview' },
                      { id: 'test', label: 'API Testing' },
                      { id: 'api', label: 'API Management' },
                      { id: 'profile', label: 'User Profile' },
                    ].find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {[
                      { id: 'overview', desc: 'Monitor your SEO performance and website metrics' },
                      { id: 'analyzer', desc: 'Analyze websites for SEO and performance issues' },
                      { id: 'writer', desc: 'Generate SEO-optimized content with AI assistance' },
                      { id: 'meta-optimizer', desc: 'Optimize meta tags for better search rankings' },
                      { id: 'faq-generator', desc: 'Create FAQ schema markup for enhanced search results' },
                      { id: 'full-score', desc: 'Comprehensive website scoring and analysis' },
                      { id: 'scan-history', desc: 'View and manage your website scan history' },
                      { id: 'progress', desc: 'Track your SEO optimization progress over time' },
                      { id: 'usage', desc: 'Monitor your API usage and account limits' },
                      { id: 'competitors', desc: 'Compare your website against competitors' },
                      { id: 'scheduled', desc: 'Manage automated website scans and alerts' },
                      { id: 'admin', desc: 'Configure system settings and preferences' },
                      { id: 'admin-overview', desc: 'System administration and user management' },
                      { id: 'test', desc: 'Test API endpoints and functionality' },
                      { id: 'api', desc: 'Manage API tokens and access controls' },
                      { id: 'profile', desc: 'Manage your account settings and preferences' },
                    ].find(item => item.id === activeTab)?.desc || 'Welcome to your dashboard'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="bg-card rounded-lg border border-border">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
