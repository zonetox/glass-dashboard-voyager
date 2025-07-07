
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Target, Zap, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StrategyAdvice {
  websiteStatus: {
    score: number;
    health: string;
    trends: string;
  };
  contentOpportunities: string[];
  contentTypes: string[];
  technicalSEO: string[];
  industrySpecific: string[];
}

export function StrategyAdvisor() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [advice, setAdvice] = useState<StrategyAdvice | null>(null);
  const [loading, setLoading] = useState(false);

  const getStrategyAdvice = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('strategy-advisor', {
        body: {
          websiteUrl: websiteUrl.trim(),
          userId: user.id
        }
      });

      if (error) throw error;

      // Parse the AI response
      try {
        const parsedAdvice = JSON.parse(data.advice);
        setAdvice(parsedAdvice);
      } catch {
        // If JSON parsing fails, create structured advice from text
        setAdvice({
          websiteStatus: {
            score: data.websiteData?.currentScore || 0,
            health: 'Analysis completed',
            trends: 'Data collected'
          },
          contentOpportunities: data.advice.split('\n').filter((line: string) => 
            line.includes('content') || line.includes('topic')
          ).slice(0, 5),
          contentTypes: [
            'Blog posts and tutorials',
            'FAQ sections',
            'Product guides',
            'Customer testimonials',
            'Case studies'
          ],
          technicalSEO: [
            'Schema markup implementation',
            'Page speed optimization',
            'Mobile responsiveness',
            'Internal linking structure',
            'XML sitemap optimization'
          ],
          industrySpecific: data.advice.split('\n').filter((line: string) => 
            line.includes('industry') || line.includes('competitor')
          ).slice(0, 3)
        });
      }

      toast.success('Strategy analysis completed!');
    } catch (error) {
      console.error('Error getting strategy advice:', error);
      toast.error('Failed to get strategy advice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Strategy Advisor</h2>
        <p className="text-gray-600">Get AI-powered strategic recommendations for your website</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Website Analysis
          </CardTitle>
          <CardDescription>
            Enter your website URL to get comprehensive strategic advice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="strategy-url">Website URL</Label>
              <Input
                id="strategy-url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={getStrategyAdvice} disabled={loading}>
                {loading ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Get Strategy
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {advice && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Website Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current SEO Score</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {advice.websiteStatus.score}/100
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Overall Health</h4>
                  <p className="text-gray-600">{advice.websiteStatus.health}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Performance Trends</h4>
                  <p className="text-gray-600">{advice.websiteStatus.trends}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Content Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {advice.contentOpportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Recommended Content Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {advice.contentTypes.map((type, index) => (
                  <Badge key={index} variant="secondary" className="justify-start">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Technical SEO Priorities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {advice.technicalSEO.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {advice.industrySpecific.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" />
                  Industry-Specific Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {advice.industrySpecific.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
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
