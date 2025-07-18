import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLoadingState } from '@/hooks/useLoadingState';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  Users,
  Globe,
  BarChart3,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CompetitorData {
  id: string;
  domain: string;
  title: string;
  seoScore: number;
  organicKeywords: number;
  monthlyTraffic: number;
  backlinks: number;
  topKeywords: string[];
  contentGaps: string[];
  strengthAreas: string[];
  weakAreas: string[];
  lastUpdated: string;
}

interface CompetitorAnalysisUIProps {
  userDomain?: string;
  onAnalysisComplete?: (data: any) => void;
}

export function CompetitorAnalysisUI({ userDomain, onAnalysisComplete }: CompetitorAnalysisUIProps) {
  const { error, isError, clearError, withErrorHandling } = useErrorHandler();
  const { isLoading, progress, startLoading, updateProgress, stopLoading } = useLoadingState();
  
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [analysisUrl, setAnalysisUrl] = useState(userDomain || '');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [comparisonMetric, setComparisonMetric] = useState('seoScore');
  const [filterStrength, setFilterStrength] = useState('all');

  // Mock competitor data for demo
  const mockCompetitors: CompetitorData[] = [
    {
      id: '1',
      domain: 'competitor1.com',
      title: 'Leading SEO Agency',
      seoScore: 92,
      organicKeywords: 15420,
      monthlyTraffic: 125000,
      backlinks: 8900,
      topKeywords: ['seo services', 'digital marketing', 'website optimization', 'local seo', 'content marketing'],
      contentGaps: ['voice search optimization', 'mobile-first indexing', 'core web vitals'],
      strengthAreas: ['Technical SEO', 'Content Strategy', 'Link Building'],
      weakAreas: ['Page Speed', 'Mobile Optimization'],
      lastUpdated: '2024-01-15'
    },
    {
      id: '2', 
      domain: 'competitor2.com',
      title: 'Digital Marketing Pro',
      seoScore: 87,
      organicKeywords: 12100,
      monthlyTraffic: 98000,
      backlinks: 6700,
      topKeywords: ['ppc management', 'social media marketing', 'seo audit', 'keyword research', 'analytics'],
      contentGaps: ['schema markup', 'international seo', 'technical audits'],
      strengthAreas: ['PPC Campaign', 'Social Media', 'Analytics'],
      weakAreas: ['Technical SEO', 'Content Depth'],
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      domain: 'competitor3.com', 
      title: 'Growth Marketing Hub',
      seoScore: 83,
      organicKeywords: 9800,
      monthlyTraffic: 76000,
      backlinks: 5200,
      topKeywords: ['growth hacking', 'conversion optimization', 'email marketing', 'lead generation', 'marketing automation'],
      contentGaps: ['local seo strategies', 'e-commerce seo', 'video optimization'],
      strengthAreas: ['Conversion Rate', 'Email Marketing', 'Lead Generation'],
      weakAreas: ['Local SEO', 'Video Content'],
      lastUpdated: '2024-01-13'
    }
  ];

  const analyzeCompetitors = withErrorHandling(async () => {
    if (!analysisUrl.trim()) {
      throw new Error('Please enter a website URL to analyze');
    }

    startLoading('Analyzing competitors...');
    
    try {
      updateProgress(20, 'Finding competitors...');
      
      // Simulate API call to competitor analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateProgress(50, 'Analyzing competitor strengths...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateProgress(80, 'Identifying content gaps...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateProgress(100, 'Analysis complete!');
      
      setCompetitors(mockCompetitors);
      onAnalysisComplete?.(mockCompetitors);
      
    } finally {
      stopLoading();
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getComparisonIcon = (current: number, competitor: number) => {
    if (current > competitor) return <ArrowUpRight className="h-4 w-4 text-green-400" />;
    if (current < competitor) return <ArrowDownRight className="h-4 w-4 text-red-400" />;
    return <div className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Analysis Input */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isError && (
            <ErrorMessage
              title="Analysis Error"
              message={error?.message || 'Failed to analyze competitors'}
              onRetry={() => {
                clearError();
                analyzeCompetitors();
              }}
              onDismiss={clearError}
            />
          )}

          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={analysisUrl}
                onChange={(e) => setAnalysisUrl(e.target.value)}
                placeholder="Enter your website URL to find competitors..."
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button 
              onClick={analyzeCompetitors}
              disabled={isLoading || !analysisUrl.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Analyze
            </Button>
          </div>

          {isLoading && (
            <LoadingSpinner 
              text="Analyzing competitors and market positioning..."
              progress={progress}
              className="py-8"
            />
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {competitors.length > 0 && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="keywords" className="text-white">Keywords</TabsTrigger>
            <TabsTrigger value="content" className="text-white">Content Gaps</TabsTrigger>
            <TabsTrigger value="comparison" className="text-white">Head-to-Head</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Competitor Overview Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitors.map((competitor) => (
                <Card key={competitor.id} className="glass-card border-white/10 hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{competitor.title}</CardTitle>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {competitor.domain}
                        </p>
                      </div>
                      <Badge variant="outline" className={getScoreBadge(competitor.seoScore)}>
                        {competitor.seoScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Keywords</div>
                        <div className="text-white font-medium">{formatNumber(competitor.organicKeywords)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Traffic</div>
                        <div className="text-white font-medium">{formatNumber(competitor.monthlyTraffic)}/mo</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Backlinks</div>
                        <div className="text-white font-medium">{formatNumber(competitor.backlinks)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Updated</div>
                        <div className="text-white font-medium">{competitor.lastUpdated}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Strength Areas</div>
                      <div className="flex flex-wrap gap-1">
                        {competitor.strengthAreas.slice(0, 3).map((area, index) => (
                          <Badge key={index} variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedCompetitor(competitor.id)}
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Market Position Chart */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Market Position Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {competitors.map((competitor, index) => (
                    <div key={competitor.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            #{index + 1}
                          </Badge>
                          <span className="text-white font-medium">{competitor.domain}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`font-bold ${getScoreColor(competitor.seoScore)}`}>
                            {competitor.seoScore}
                          </span>
                          <span className="text-gray-400">
                            {formatNumber(competitor.monthlyTraffic)} traffic
                          </span>
                        </div>
                      </div>
                      <Progress value={competitor.seoScore} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Top Ranking Keywords by Competitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {competitors.map((competitor) => (
                    <div key={competitor.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">{competitor.domain}</h4>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {formatNumber(competitor.organicKeywords)} keywords
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {competitor.topKeywords.map((keyword, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="bg-white/5 text-gray-300 border-white/20 hover:border-primary/30 cursor-pointer"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Content Gap Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {competitors.map((competitor) => (
                    <div key={competitor.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">{competitor.domain}</h4>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          {competitor.contentGaps.length} gaps identified
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-green-400">Their Strengths</h5>
                          <div className="space-y-1">
                            {competitor.strengthAreas.map((area, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-400" />
                                <span className="text-gray-300">{area}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-yellow-400">Content Gaps</h5>
                          <div className="space-y-1">
                            {competitor.contentGaps.map((gap, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Target className="h-3 w-3 text-yellow-400" />
                                <span className="text-gray-300">{gap}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Head-to-Head Comparison
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
                      <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select competitor" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {competitors.map((comp) => (
                          <SelectItem key={comp.id} value={comp.id} className="text-white">
                            {comp.domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedCompetitor && (
                  <div className="space-y-6">
                    {(() => {
                      const competitor = competitors.find(c => c.id === selectedCompetitor);
                      if (!competitor) return null;
                      
                      // Mock current site data for comparison
                      const currentSite = {
                        seoScore: 75,
                        organicKeywords: 8500,
                        monthlyTraffic: 45000,
                        backlinks: 3200
                      };

                      return (
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="text-white font-medium">Your Website</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <span className="text-gray-300">SEO Score</span>
                                <div className="flex items-center gap-2">
                                  <span className={getScoreColor(currentSite.seoScore)}>{currentSite.seoScore}</span>
                                  {getComparisonIcon(currentSite.seoScore, competitor.seoScore)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                <span className="text-gray-300">Keywords</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-white">{formatNumber(currentSite.organicKeywords)}</span>
                                  {getComparisonIcon(currentSite.organicKeywords, competitor.organicKeywords)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                <span className="text-gray-300">Monthly Traffic</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-white">{formatNumber(currentSite.monthlyTraffic)}</span>
                                  {getComparisonIcon(currentSite.monthlyTraffic, competitor.monthlyTraffic)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                <span className="text-gray-300">Backlinks</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-white">{formatNumber(currentSite.backlinks)}</span>
                                  {getComparisonIcon(currentSite.backlinks, competitor.backlinks)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-white font-medium">{competitor.domain}</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <span className="text-gray-300">SEO Score</span>
                                <span className={getScoreColor(competitor.seoScore)}>{competitor.seoScore}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                <span className="text-gray-300">Keywords</span>
                                <span className="text-white">{formatNumber(competitor.organicKeywords)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                <span className="text-gray-300">Monthly Traffic</span>
                                <span className="text-white">{formatNumber(competitor.monthlyTraffic)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                <span className="text-gray-300">Backlinks</span>
                                <span className="text-white">{formatNumber(competitor.backlinks)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}