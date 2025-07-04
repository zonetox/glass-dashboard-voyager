
import { DashboardLayout } from '@/components/DashboardLayout';
import { WebsiteAnalyzer } from '@/components/dashboard/website-analyzer';
import { OptimizationResults } from '@/components/dashboard/optimization-results';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { SEODashboard } from '@/components/dashboard/seo-dashboard';
import { useSEOAnalysis } from '@/hooks/use-seo-analysis';
import { useState } from 'react';

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

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Analysis Results Card */}
          <div className="lg:col-span-1">
            <OptimizationResults
              websites={websites}
              getWebsiteIssues={getWebsiteIssues}
              onToggleIssue={toggleIssueFixed}
            />
          </div>
        </div>

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

        {/* Quick Stats Section */}
        {websites.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>
    </DashboardLayout>
  );
}
