
import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SEODashboard } from '@/components/dashboard/seo-dashboard';
import { WebsiteAnalyzer } from '@/components/dashboard/website-analyzer';
import { ContentWriter } from '@/components/dashboard/content-writer';
import { APITokens } from '@/components/dashboard/api-tokens';
import { CompetitorAnalysis } from '@/components/dashboard/competitor-analysis';
import { MetaOptimizer } from '@/components/dashboard/meta-optimizer';
import { FAQGenerator } from '@/components/dashboard/faq-generator';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SEODashboard />;
      case 'analyzer':
        return <WebsiteAnalyzer />;
      case 'writer':
        return <ContentWriter />;
      case 'meta-optimizer':
        return <MetaOptimizer />;
      case 'faq-generator':
        return <FAQGenerator />;
      case 'api':
        return <APITokens />;
      case 'competitors':
        return <CompetitorAnalysis />;
      default:
        return <SEODashboard />;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analyzer', label: 'Analyzer', icon: '🔍' },
    { id: 'writer', label: 'Writer', icon: '✍️' },
    { id: 'meta-optimizer', label: 'Meta Tags', icon: '🏷️' },
    { id: 'faq-generator', label: 'FAQ Schema', icon: '❓' },
    { id: 'api', label: 'API', icon: '🔌' },
    { id: 'competitors', label: 'Competitors', icon: '🏆' },
  ];

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      navItems={navItems}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
