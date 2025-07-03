
import { DashboardLayout } from '@/components/DashboardLayout';
import { WebsiteAnalyzer } from '@/components/dashboard/website-analyzer';
import { OptimizationResults } from '@/components/dashboard/optimization-results';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { useSEOAnalysis } from '@/hooks/use-seo-analysis';

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

          {/* Analysis Results Card - Full Width on Mobile, Spans 2 Columns on Large */}
          <div className="lg:col-span-1">
            <OptimizationResults
              websites={websites}
              getWebsiteIssues={getWebsiteIssues}
              onToggleIssue={toggleIssueFixed}
            />
          </div>
        </div>

        {/* Full Width Results Section for Better Mobile Experience */}
        <div className="lg:hidden">
          <OptimizationResults
            websites={websites}
            getWebsiteIssues={getWebsiteIssues}
            onToggleIssue={toggleIssueFixed}
          />
        </div>

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
