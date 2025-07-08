
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, TrendingDown, Minus, Target, Lightbulb, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CompetitorData {
  url: string;
  contentCount: number;
  pageSpeed: { desktop: number; mobile: number };
  aiReadability: number;
  schemas: string[];
}

interface AnalysisResult {
  userSite: CompetitorData;
  competitors: CompetitorData[];
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    contentOpportunities?: string[];
  };
  comparison: any;
}

export function CompetitorAnalysis() {
  const [userWebsite, setUserWebsite] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState(['', '', '']);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateCompetitorUrl = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  const analyzeCompetitors = async () => {
    if (!userWebsite.trim()) {
      toast({
        title: "Error",
        description: "Please enter your website URL",
        variant: "destructive",
      });
      return;
    }

    const validCompetitors = competitorUrls.filter(url => url.trim());
    if (validCompetitors.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one competitor URL",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('competitor-analysis', {
        body: {
          userWebsiteUrl: userWebsite,
          competitorUrls: validCompetitors,
          userId: user?.id
        }
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: "Analysis Complete",
        description: "Competitor analysis has been completed successfully",
      });
    } catch (error) {
      console.error('Error analyzing competitors:', error);
      toast({
        title: "Error",
        description: "Failed to analyze competitors",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getComparisonIcon = (advantage: string) => {
    if (advantage === 'user') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (advantage === 'competitors') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getAdvantageColor = (advantage: string) => {
    if (advantage === 'user') return 'text-green-400';
    if (advantage === 'competitors') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Competitor Analysis</h2>
        <p className="text-gray-400">Compare your website against competitors across key SEO metrics</p>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Setup Analysis</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your website and up to 3 competitor URLs to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Your Website</label>
              <Input
                value={userWebsite}
                onChange={(e) => setUserWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Competitor URLs</label>
              <div className="space-y-2">
                {competitorUrls.map((url, index) => (
                  <Input
                    key={index}
                    value={url}
                    onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                    placeholder={`https://competitor${index + 1}.com`}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                ))}
              </div>
            </div>

            <Button 
              onClick={analyzeCompetitors} 
              disabled={analyzing}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {analyzing ? 'Analyzing...' : 'Start Analysis'}
              <Target className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          {/* Comparison Overview */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Competitive Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Content Count */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Content Count</span>
                    {results.comparison?.contentCount && getComparisonIcon(results.comparison.contentCount.advantage)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Your Site</span>
                      <span className="text-white">{results.userSite?.contentCount || 0}</span>
                    </div>
                    <Progress 
                      value={Math.min((results.userSite?.contentCount || 0) / 1000 * 100, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Competitors</span>
                      <span className="text-gray-400">
                        {Math.round(results.comparison?.contentCount?.competitors || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Page Speed Desktop */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Desktop Speed</span>
                    {results.comparison?.pageSpeed?.desktop && getComparisonIcon(results.comparison.pageSpeed.desktop.advantage)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Your Site</span>
                      <span className="text-white">{results.userSite?.pageSpeed?.desktop || 0}</span>
                    </div>
                    <Progress 
                      value={results.userSite?.pageSpeed?.desktop || 0} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Competitors</span>
                      <span className="text-gray-400">
                        {Math.round(results.comparison?.pageSpeed?.desktop?.competitors || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Readability */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">AI Readability</span>
                    {results.comparison?.aiReadability && getComparisonIcon(results.comparison.aiReadability.advantage)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Your Site</span>
                      <span className="text-white">{results.userSite?.aiReadability || 0}</span>
                    </div>
                    <Progress 
                      value={results.userSite?.aiReadability || 0} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Competitors</span>
                      <span className="text-gray-400">
                        {Math.round(results.comparison?.aiReadability?.competitors || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Competitor Data */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-white">Website</th>
                      <th className="text-right py-2 text-white">Content</th>
                      <th className="text-right py-2 text-white">Desktop Speed</th>
                      <th className="text-right py-2 text-white">Mobile Speed</th>
                      <th className="text-right py-2 text-white">AI Readability</th>
                      <th className="text-left py-2 text-white">Schemas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">Your Site</Badge>
                          <span className="text-sm text-gray-400">{new URL(results.userSite?.url || '').hostname}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 text-white">{results.userSite?.contentCount}</td>
                      <td className="text-right py-3 text-white">{results.userSite?.pageSpeed?.desktop}</td>
                      <td className="text-right py-3 text-white">{results.userSite?.pageSpeed?.mobile}</td>
                      <td className="text-right py-3 text-white">{results.userSite?.aiReadability}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {results.userSite?.schemas?.slice(0, 3).map((schema, idx) => (
                            <Badge key={idx} className="bg-gray-700 text-gray-300 text-xs">
                              {schema}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                    {results.competitors?.map((competitor, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-3">
                          <span className="text-sm text-gray-400">{new URL(competitor.url).hostname}</span>
                        </td>
                        <td className="text-right py-3 text-gray-300">{competitor.contentCount}</td>
                        <td className="text-right py-3 text-gray-300">{competitor.pageSpeed?.desktop}</td>
                        <td className="text-right py-3 text-gray-300">{competitor.pageSpeed?.mobile}</td>
                        <td className="text-right py-3 text-gray-300">{competitor.aiReadability}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {competitor.schemas?.slice(0, 3).map((schema, idx) => (
                              <Badge key={idx} className="bg-gray-700 text-gray-300 text-xs">
                                {schema}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          {results.insights && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.insights.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.insights.weaknesses?.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations */}
          {results.insights?.recommendations && (
            <Card className="glass-card border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Actionable Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {results.insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-300">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
