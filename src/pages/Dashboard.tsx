
import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardHeader } from '@/components/DashboardHeader';
import { WebsiteAnalyzer } from '@/components/dashboard/website-analyzer';
import { OptimizationHistory } from '@/components/dashboard/optimization-history';
import { ScanHistory } from '@/components/dashboard/scan-history';
import { RollbackManager } from '@/components/dashboard/rollback-manager';
import { ThemeToggle } from '@/components/theme-toggle';
import { UsageTracker } from '@/components/dashboard/usage-tracker';
import { FullScanManager } from '@/components/dashboard/fullscan-manager';
import { OrganizationManager } from '@/components/dashboard/organization-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScheduledScans } from '@/components/dashboard/scheduled-scans';
import { StrategyAdvisor } from '@/components/dashboard/strategy-advisor';
import { APITokens } from '@/components/dashboard/api-tokens';
import { CompetitorAnalysis } from '@/components/dashboard/competitor-analysis';

export default function Dashboard() {
  const [analysisUrl, setAnalysisUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    try {
      // TODO: Implement actual analysis logic
      console.log('Analyzing website:', url);
      setAnalysisUrl(url);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader />
        
        <Tabs defaultValue="analyze" className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="analyze" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                Analyze
              </TabsTrigger>
              <TabsTrigger value="optimize" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                Optimize
              </TabsTrigger>
              <TabsTrigger value="content" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                Content
              </TabsTrigger>
              <TabsTrigger value="strategy" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                Strategy
              </TabsTrigger>
              <TabsTrigger value="competitors" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                Competitors
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                Scheduled
              </TabsTrigger>
              <TabsTrigger value="api" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                API
              </TabsTrigger>
              <TabsTrigger value="fullscan" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                Full Scan
              </TabsTrigger>
              <TabsTrigger value="organizations" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                Organizations
              </TabsTrigger>
              <TabsTrigger value="rollback" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                Rollback
              </TabsTrigger>
              <TabsTrigger value="history" className="bg-white/5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-white/20">
                History
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UsageTracker />
            </div>
          </div>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid gap-6">
              <WebsiteAnalyzer onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
            </div>
          </TabsContent>

          <TabsContent value="optimize" className="space-y-6">
            <div className="grid gap-6">
              <div>Optimize</div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6">
              <div>Content</div>
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            <StrategyAdvisor />
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6">
            <CompetitorAnalysis />
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <ScheduledScans />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <APITokens />
          </TabsContent>

          <TabsContent value="fullscan" className="space-y-6">
            <FullScanManager />
          </TabsContent>

          <TabsContent value="organizations" className="space-y-6">
            <OrganizationManager />
          </TabsContent>

          <TabsContent value="rollback" className="space-y-6">
            <div className="grid gap-6">
              <RollbackManager />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <OptimizationHistory onRescan={(url) => {
                setAnalysisUrl(url);
                // Switch to analyze tab
                const analyzeTab = document.querySelector('[data-state="active"][value="analyze"]');
                if (analyzeTab) {
                  (analyzeTab as HTMLElement).click();
                }
              }} />
              <ScanHistory />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
