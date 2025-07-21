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

// Helper component for competitor comparison
function CompetitorComparison({ competitor, getScoreColor, getComparisonIcon, formatNumber }: any) {
  const [currentSite, setCurrentSite] = useState({
    seoScore: 0,
    organicKeywords: 0,
    monthlyTraffic: 0,
    backlinks: 0
  });

  useEffect(() => {
    const loadCurrentSite = async () => {
      const { data: latestScan } = await supabase
        .from('scans')
        .select('seo')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      const seoData = latestScan?.seo as any;
      setCurrentSite({
        seoScore: seoData?.score || 0,
        organicKeywords: seoData?.keywords?.length || 0,
        monthlyTraffic: seoData?.traffic || 0,
        backlinks: seoData?.backlinks || 0
      });
    };
    
    loadCurrentSite();
  }, []);

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
}

export function CompetitorAnalysisUI({ userDomain, onAnalysisComplete }: CompetitorAnalysisUIProps) {
  const { error, isError, clearError, withErrorHandling } = useErrorHandler();
  const { isLoading, progress, startLoading, updateProgress, stopLoading } = useLoadingState();
  
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [analysisUrl, setAnalysisUrl] = useState(userDomain || '');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [comparisonMetric, setComparisonMetric] = useState('seoScore');
  const [filterStrength, setFilterStrength] = useState('all');


  const analyzeCompetitors = withErrorHandling(async () => {
    if (!analysisUrl.trim()) {
      throw new Error('Please enter a website URL to analyze');
    }

    startLoading('Analyzing competitors...');
    
    try {
      updateProgress(20, 'Finding competitors...');
      
      // Call real competitor analysis API
      const { data, error } = await supabase.functions.invoke('competitor-analysis', {
        body: { 
          userWebsiteUrl: analysisUrl,
          competitorUrls: [] // Will auto-discover competitors
        }
      });

      if (error) throw error;
      
      updateProgress(50, 'Processing competitor data...');
      
      // Process real competitor data
      const realCompetitors: CompetitorData[] = data?.competitors?.map((comp: any, index: number) => ({
        id: `comp-${index + 1}`,
        domain: comp.domain || '',
        title: comp.title || comp.domain,
        seoScore: comp.seoScore || 0,
        organicKeywords: comp.organicKeywords || 0,
        monthlyTraffic: comp.monthlyTraffic || 0,
        backlinks: comp.backlinks || 0,
        topKeywords: comp.topKeywords || [],
        contentGaps: comp.contentGaps || [],
        strengthAreas: comp.strengthAreas || [],
        weakAreas: comp.weakAreas || [],
        lastUpdated: new Date().toISOString().split('T')[0]
      })) || [];

      updateProgress(100, 'Analysis complete!');
      
      setCompetitors(realCompetitors);
      onAnalysisComplete?.(realCompetitors);
      
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
                    <CompetitorComparison 
                      competitor={competitors.find(c => c.id === selectedCompetitor)!}
                      getScoreColor={getScoreColor}
                      getComparisonIcon={getComparisonIcon}
                      formatNumber={formatNumber}
                    />
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