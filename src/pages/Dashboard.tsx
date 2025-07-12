
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
      case 'ai-seo':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl">🤖</div>
              <h2 className="text-3xl font-bold">AI Gợi ý SEO</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sử dụng trí tuệ nhân tạo để phân tích và đưa ra gợi ý cải thiện SEO cho website của bạn
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ContentWriter />
              <MetaOptimizer />
              <FAQGenerator />
              <FullScoreAnalyzer />
            </div>
          </div>
        );
      case 'auto-fix':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl">🔧</div>
              <h2 className="text-3xl font-bold">Fix Tự động</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tự động phát hiện và sửa các lỗi SEO phổ biến trên website của bạn
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ScanHistory />
              <ProgressTracker />
              <ScheduledScans />
              <CompetitorAnalysis />
            </div>
          </div>
        );
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
      <div className="lg:hidden p-6">
        <select 
          value={activeTab} 
          onChange={(e) => handleTabChange(e.target.value)}
          className="w-full p-4 bg-card border border-border rounded-lg text-foreground text-lg font-medium"
        >
          <option value="overview">📊 Tổng quan</option>
          <option value="analyzer">🔍 Phân tích SEO</option>
          <option value="ai-seo">🤖 AI Gợi ý</option>
          <option value="auto-fix">🔧 Fix Tự động</option>
          <option value="usage">📊 Sử dụng</option>
          <option value="api">🔌 API</option>
          <option value="admin">⚙️ Admin</option>
          <option value="profile">👤 Profile</option>
        </select>
      </div>

      {/* Desktop: Simple Sidebar + Content */}
      <div className="lg:flex">
        {/* Simple Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:w-80 lg:min-h-screen lg:bg-card lg:border-r lg:border-border">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-8">SEO Dashboard</h1>
            <nav className="space-y-3">
              {[
                { 
                  id: 'overview', 
                  label: 'Tổng quan', 
                  icon: '📊',
                  description: 'Xem tổng quan thống kê SEO'
                },
                { 
                  id: 'analyzer', 
                  label: 'Phân tích SEO', 
                  icon: '🔍',
                  description: 'Quét và phân tích website'
                },
                { 
                  id: 'ai-seo', 
                  label: 'AI Gợi ý', 
                  icon: '🤖',
                  description: 'Trí tuệ nhân tạo hỗ trợ SEO'
                },
                { 
                  id: 'auto-fix', 
                  label: 'Fix Tự động', 
                  icon: '🔧',
                  description: 'Tự động sửa lỗi SEO'
                },
                { 
                  id: 'usage', 
                  label: 'Sử dụng', 
                  icon: '📊',
                  description: 'Theo dõi sử dụng API'
                },
                { 
                  id: 'api', 
                  label: 'API', 
                  icon: '🔌',
                  description: 'Quản lý API tokens'
                },
                { 
                  id: 'admin', 
                  label: 'Admin', 
                  icon: '⚙️',
                  description: 'Cài đặt hệ thống'
                },
                { 
                  id: 'profile', 
                  label: 'Profile', 
                  icon: '👤',
                  description: 'Thông tin tài khoản'
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left p-4 rounded-xl text-base transition-all duration-200 flex flex-col gap-1 hover:scale-[1.02] ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <p className="text-xs opacity-80 ml-8">
                    {item.description}
                  </p>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
