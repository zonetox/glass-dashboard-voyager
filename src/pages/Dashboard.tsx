
import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SEODashboard } from '@/components/dashboard/seo-dashboard';
import { WebsiteAnalyzer } from '@/components/dashboard/website-analyzer';
import { ContentWriter } from '@/components/dashboard/content-writer';
import { APITokens } from '@/components/dashboard/api-tokens';
import { CompetitorAnalysis } from '@/components/dashboard/competitor-analysis';
import { MetaOptimizer } from '@/components/dashboard/meta-optimizer';
import { FAQGenerator } from '@/components/dashboard/faq-generator';
import { FullScoreAnalyzer } from '@/components/dashboard/full-score-analyzer';
import { Website, SEOIssue, mockSEOIssues } from '@/lib/types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  

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
      case 'api':
        return <APITokens />;
      case 'competitors':
        return <CompetitorAnalysis />;
      default:
        return <SEODashboard website={mockWebsite} issues={mockSEOIssues} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-800">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'analyzer', label: 'Analyzer', icon: '🔍' },
              { id: 'writer', label: 'Writer', icon: '✍️' },
              { id: 'meta-optimizer', label: 'Meta Tags', icon: '🏷️' },
              { id: 'faq-generator', label: 'FAQ Schema', icon: '❓' },
              { id: 'full-score', label: 'Full Score', icon: '🎯' },
              { id: 'api', label: 'API', icon: '🔌' },
              { id: 'competitors', label: 'Competitors', icon: '🏆' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === item.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
