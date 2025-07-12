
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Target, Loader2, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScoreBreakdown {
  seo_traditional: number;
  ai_readability: number;
  semantic_depth: number;
  technical_performance: number;
  schema_structured_data: number;
}

interface FullScoreResult {
  overall_score: number;
  grade: 'Critical' | 'Average' | 'Good' | 'Excellent';
  color: string;
  emoji: string;
  breakdown: ScoreBreakdown;
  recommendations: string[];
  analysis_date: string;
}

export function FullScoreAnalyzer() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scoreResult, setScoreResult] = useState<FullScoreResult | null>(null);
  const { toast } = useToast();

  const analyzeFullScore = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting full score analysis for:', websiteUrl);
      
      const { data, error } = await supabase.functions.invoke('internal-fullscore', {
        body: { 
          url: websiteUrl.trim()
        }
      });

      console.log('Full score analysis response:', { data, error, status: !error ? 'success' : 'error' });

      if (error) {
        console.error('Full score analysis error details:', error);
        throw new Error(error.message || 'Failed to analyze website');
      }

      const result: FullScoreResult = {
        overall_score: data.overall_score || 0,
        grade: data.grade || 'Critical',
        color: data.color || '#EF4444',
        emoji: data.emoji || '🔴',
        breakdown: data.breakdown || {
          seo_traditional: 0,
          ai_readability: 0,
          semantic_depth: 0,
          technical_performance: 0,
          schema_structured_data: 0
        },
        recommendations: data.recommendations || [],
        analysis_date: new Date().toISOString()
      };

      setScoreResult(result);
      toast({
        title: "Analysis Complete",
        description: `Overall score: ${result.overall_score}/100 (${result.grade})`
      });

    } catch (error: any) {
      console.error('Error analyzing full score:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint
      });
      
      toast({
        title: "Error",
        description: `Failed to analyze website score: ${error?.message || 'Please try again.'}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 40) return '#EF4444';
    if (score <= 70) return '#EAB308';
    if (score <= 90) return '#22C55E';
    return '#8B5CF6';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 40) return 'Critical';
    if (score <= 70) return 'Average';
    if (score <= 90) return 'Good';
    return 'Excellent';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Full Score Analysis
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Get comprehensive SEO and performance analysis with our advanced scoring system
        </p>
      </div>

      {/* Analysis Form */}
      <Card className="glass-card border-white/10 max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-300 text-base font-medium">Website URL</Label>
              <div className="relative">
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-12 text-lg"
                  disabled={isAnalyzing}
                />
              </div>
            </div>

            <Button 
              onClick={analyzeFullScore}
              disabled={isAnalyzing || !websiteUrl.trim()}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg shadow-lg transition-all duration-200"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Analyzing Website...
                </>
              ) : (
                <>
                  <BarChart className="h-5 w-5 mr-3" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scoring System Info */}
      <Card className="glass-card border-white/10 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-xl text-center">Comprehensive Scoring System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'SEO Traditional', icon: '🔍', percentage: '20%' },
              { name: 'AI Readability', icon: '🤖', percentage: '20%' },
              { name: 'Semantic Depth', icon: '📊', percentage: '20%' },
              { name: 'Technical Performance', icon: '⚡', percentage: '20%' },
              { name: 'Schema & Structured Data', icon: '🏗️', percentage: '20%' }
            ].map((item, index) => (
              <div key={index} className="text-center p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-400/30 transition-colors">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white font-medium text-sm mb-1">{item.name}</div>
                <div className="text-purple-400 font-semibold">{item.percentage}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {scoreResult && (
        <div className="space-y-8 animate-fade-in">
          {/* Overall Score Card */}
          <Card className="glass-card border-white/10 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="text-center">
                    <div 
                      className="text-8xl font-bold mb-2" 
                      style={{ color: scoreResult.color }}
                    >
                      {scoreResult.overall_score}
                    </div>
                    <div className="text-3xl text-white mb-2">{scoreResult.grade}</div>
                    <div className="text-6xl">{scoreResult.emoji}</div>
                  </div>
                  
                  <div className="flex-1 w-full max-w-md space-y-4">
                    <h3 className="text-xl font-semibold text-white">Overall Performance</h3>
                    <Progress 
                      value={scoreResult.overall_score} 
                      className="w-full h-4"
                      style={{
                        '--progress-background': scoreResult.color
                      } as any}
                    />
                    <p className="text-gray-400 text-sm">
                      Based on comprehensive analysis of 5 key metrics
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown Grid */}
          <Card className="glass-card border-white/10 max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl text-center">Detailed Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(scoreResult.breakdown).map(([key, score]) => {
                  const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  const color = getScoreColor(score);
                  const icons = {
                    'Seo Traditional': '🔍',
                    'Ai Readability': '🤖',
                    'Semantic Depth': '📊',
                    'Technical Performance': '⚡',
                    'Schema Structured Data': '🏗️'
                  };
                  
                  return (
                    <div key={key} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl">{icons[label] || '📈'}</div>
                        <h4 className="font-semibold text-white text-lg">{label}</h4>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          className="text-sm px-3 py-1"
                          style={{ 
                            backgroundColor: `${color}20`, 
                            color: color,
                            borderColor: `${color}40`
                          }}
                        >
                          {getScoreLabel(score)}
                        </Badge>
                        <span 
                          className="text-2xl font-bold"
                          style={{ color: color }}
                        >
                          {score}/100
                        </span>
                      </div>
                      
                      <Progress 
                        value={score} 
                        className="h-3"
                        style={{
                          '--progress-background': color
                        } as any}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {scoreResult.recommendations.length > 0 && (
            <Card className="glass-card border-white/10 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">Improvement Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {scoreResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg hover:border-blue-400/40 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-blue-200 flex-1 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Legend */}
          <Card className="glass-card border-white/10 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-xl text-center">Score Interpretation Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { emoji: '🔴', range: '0-40', label: 'Critical', color: 'bg-red-500', desc: 'Needs immediate attention' },
                  { emoji: '🟡', range: '41-70', label: 'Average', color: 'bg-yellow-500', desc: 'Room for improvement' },
                  { emoji: '🟢', range: '71-90', label: 'Good', color: 'bg-green-500', desc: 'Well optimized' },
                  { emoji: '⭐️', range: '91-100', label: 'Excellent', color: 'bg-violet-500', desc: 'Outstanding performance' }
                ].map((item, index) => (
                  <div key={index} className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-2xl mb-2">{item.emoji}</div>
                    <div className={`w-6 h-6 rounded-full ${item.color} mx-auto mb-2`}></div>
                    <div className="text-white font-semibold text-sm mb-1">{item.range}</div>
                    <div className="text-gray-400 text-xs">{item.label}</div>
                    <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
