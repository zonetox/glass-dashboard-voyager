
import { DashboardLayout } from '@/components/DashboardLayout';
import { WebsiteAnalyzer } from '@/components/dashboard/website-analyzer';
import { OptimizationResults } from '@/components/dashboard/optimization-results';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { SEODashboard } from '@/components/dashboard/seo-dashboard';
import { OptimizationHistory } from '@/components/dashboard/optimization-history';
import { SemanticAnalyzer } from '@/components/dashboard/semantic-analyzer';
import { ContentClusterGenerator } from '@/components/dashboard/content-cluster-generator';
import { ContentWriter } from '@/components/dashboard/content-writer';
import { InternalLinksOptimizer } from '@/components/dashboard/internal-links-optimizer';
import { UsageTracker } from '@/components/dashboard/usage-tracker';
import { ScanHistory } from '@/components/dashboard/scan-history';
import { useSEOAnalysis } from '@/hooks/use-seo-analysis';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const {
    websites,
    issues,
    isLoading,
    error,
    overallScore,
    totalIssues,
    fixedIssues,
    analyzeWebsite,
    getWebsiteIssues,
    toggleIssueFixed
  } = useSEOAnalysis();

  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);

  // Get the selected website data
  const currentWebsite = selectedWebsite ? websites.find(w => w.id === selectedWebsite) : websites[0];
  const currentIssues = currentWebsite ? getWebsiteIssues(currentWebsite.id) : [];

  const handleRescan = (url: string) => {
    analyzeWebsite(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            SEO Auto Tool
          </h1>
          <p className="text-gray-400">
            Analyze and optimize your websites for better search engine rankings
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/10">
              Overview
            </TabsTrigger>
            <TabsTrigger value="usage" className="text-white data-[state=active]:bg-white/10">
              Usage & Plan
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/10">
              History
            </TabsTrigger>
            <TabsTrigger value="semantic" className="text-white data-[state=active]:bg-white/10">
              Semantic Analysis
            </TabsTrigger>
            <TabsTrigger value="content-cluster" className="text-white data-[state=active]:bg-white/10">
              Content Clusters
            </TabsTrigger>
            <TabsTrigger value="content-writer" className="text-white data-[state=active]:bg-white/10">
              AI Writer
            </TabsTrigger>
            <TabsTrigger value="internal-links" className="text-white data-[state=active]:bg-white/10">
              Internal Links
            </TabsTrigger>
            <TabsTrigger value="detailed" className="text-white data-[state=active]:bg-white/10">
              Detailed View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Add Website Card */}
              <div className="lg:col-span-1">
                <WebsiteAnalyzer 
                  onAnalyze={analyzeWebsite}
                  isLoading={isLoading}
                />
              </div>

              {/* Progress Tracker Card */}
              <div className="lg:col-span-1">
                <ProgressTracker
                  overallScore={overallScore}
                  totalIssues={totalIssues}
                  fixedIssues={fixedIssues}
                  websites={websites.length}
                />
              </div>

              {/* Usage Tracker Card */}
              <div className="lg:col-span-1">
                <UsageTracker />
              </div>

              {/* Analysis Results Card */}
              <div className="lg:col-span-1">
                <OptimizationResults
                  websites={websites}
                  getWebsiteIssues={getWebsiteIssues}
                  onToggleIssue={toggleIssueFixed}
                />
              </div>
            </div>

            {/* Quick Stats Section */}
            {websites.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                  <div className="text-2xl font-bold text-blue-400">{websites.length}</div>
                  <div className="text-sm text-gray-400">Websites Analyzed</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                  <div className="text-2xl font-bold text-green-400">{overallScore}</div>
                  <div className="text-sm text-gray-400">Average Score</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{totalIssues}</div>
                  <div className="text-sm text-gray-400">Total Issues</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                  <div className="text-2xl font-bold text-purple-400">{fixedIssues}</div>
                  <div className="text-sm text-gray-400">Issues Fixed</div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="usage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UsageTracker />
              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Plan Comparison</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Free</span>
                      <span className="text-gray-400">5 scans, 10 rewrites, 2 optimizations</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400">Pro</span>
                      <span className="text-gray-400">50 scans, 100 rewrites, 20 optimizations</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400">Agency</span>
                      <span className="text-gray-400">Unlimited everything</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <ScanHistory onRescan={handleRescan} />
              <OptimizationHistory onRescan={handleRescan} />
            </div>
          </TabsContent>

          <TabsContent value="semantic">
            <SemanticAnalyzer />
          </TabsContent>

          <TabsContent value="content-cluster">
            <ContentClusterGenerator />
          </TabsContent>

          <TabsContent value="content-writer">
            <ContentWriter />
          </TabsContent>

          <TabsContent value="internal-links">
            <InternalLinksOptimizer />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {/* Website Selection for Detailed View */}
            {websites.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-white font-medium">Select website for detailed optimization:</span>
                {websites.map((website) => (
                  <button
                    key={website.id}
                    onClick={() => setSelectedWebsite(website.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedWebsite === website.id || (!selectedWebsite && website === websites[0])
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {new URL(website.url).hostname}
                  </button>
                ))}
              </div>
            )}

            {/* Detailed SEO Dashboard */}
            {currentWebsite && (
              <SEODashboard
                website={currentWebsite}
                issues={currentIssues}
                analysisData={(currentWebsite as any).analysisData}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
