
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Target, Loader2, TrendingUp } from 'lucide-react';
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
      // Simulate API call - in real implementation this would call the fullscore API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: FullScoreResult = {
        overall_score: Math.floor(Math.random() * 100),
        grade: (['Critical', 'Average', 'Good', 'Excellent'] as const)[Math.floor(Math.random() * 4)],
        color: '#22C55E',
        emoji: '🟢',
        breakdown: {
          seo_traditional: Math.floor(Math.random() * 100),
          ai_readability: Math.floor(Math.random() * 100),
          semantic_depth: Math.floor(Math.random() * 100),
          technical_performance: Math.floor(Math.random() * 100),
          schema_structured_data: Math.floor(Math.random() * 100)
        },
        recommendations: [
          'Optimize page loading speed for better user experience',
          'Add more structured data markup for rich snippets',
          'Improve content depth with more comprehensive coverage',
          'Enhance mobile responsiveness and Core Web Vitals',
          'Add FAQ schema to improve AI citation potential'
        ],
        analysis_date: new Date().toISOString()
      };

      // Adjust color and emoji based on score
      if (mockResult.overall_score <= 40) {
        mockResult.color = '#EF4444';
        mockResult.emoji = '🔴';
        mockResult.grade = 'Critical';
      } else if (mockResult.overall_score <= 70) {
        mockResult.color = '#EAB308';
        mockResult.emoji = '🟡';
        mockResult.grade = 'Average';
      } else if (mockResult.overall_score <= 90) {
        mockResult.color = '#22C55E';
        mockResult.emoji = '🟢';
        mockResult.grade = 'Good';
      } else {
        mockResult.color = '#8B5CF6';
        mockResult.emoji = '⭐️';
        mockResult.grade = 'Excellent';
      }

      setScoreResult(mockResult);
      toast({
        title: "Analysis Complete",
        description: `Overall score: ${mockResult.overall_score}/100 (${mockResult.grade})`
      });

    } catch (error) {
      console.error('Error analyzing full score:', error);
      toast({
        title: "Error",
        description: "Failed to analyze website score",
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
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-purple-400" />
            Full Score Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Website URL</Label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <Button 
              onClick={analyzeFullScore}
              disabled={isAnalyzing}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Full Score...
                </>
              ) : (
                <>
                  <BarChart className="h-4 w-4 mr-2" />
                  Analyze Full Score
                </>
              )}
            </Button>

            <div className="text-sm text-gray-400 space-y-1">
              <p>Comprehensive scoring system:</p>
              <div className="grid grid-cols-1 gap-1 ml-4">
                <span>• SEO Traditional (20%)</span>
                <span>• AI Readability (20%)</span>
                <span>• Semantic Depth (20%)</span>
                <span>• Technical Performance (20%)</span>
                <span>• Schema & Structured Data (20%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {scoreResult && (
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <TrendingUp className={`h-5 w-5`} style={{ color: scoreResult.color }} />
                Full Score Results
              </span>
              <Badge 
                className="text-lg px-4 py-2" 
                style={{ 
                  backgroundColor: `${scoreResult.color}20`, 
                  color: scoreResult.color,
                  borderColor: `${scoreResult.color}40`
                }}
              >
                {scoreResult.emoji} {scoreResult.overall_score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score Display */}
            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <div 
                className="text-6xl font-bold mb-2" 
                style={{ color: scoreResult.color }}
              >
                {scoreResult.overall_score}
              </div>
              <div className="text-2xl text-white mb-2">{scoreResult.grade}</div>
              <div className="text-4xl mb-4">{scoreResult.emoji}</div>
              <Progress 
                value={scoreResult.overall_score} 
                className="w-full h-3"
                style={{
                  '--progress-background': scoreResult.color
                } as any}
              />
            </div>

            {/* Score Breakdown */}
            <div>
              <h4 className="font-semibold text-white mb-4">Score Breakdown</h4>
              <div className="space-y-4">
                {Object.entries(scoreResult.breakdown).map(([key, score]) => {
                  const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  const color = getScoreColor(score);
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">{label}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${color}20`, 
                              color: color,
                              borderColor: `${color}40`
                            }}
                          >
                            {getScoreLabel(score)}
                          </Badge>
                          <span className="text-white font-semibold">{score}/100</span>
                        </div>
                      </div>
                      <Progress 
                        value={score} 
                        className="h-2"
                        style={{
                          '--progress-background': color
                        } as any}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-white mb-4">Recommendations for Improvement</h4>
              <div className="space-y-3">
                {scoreResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    <div className="text-blue-400 font-semibold text-sm mt-0.5">
                      {index + 1}.
                    </div>
                    <p className="text-blue-300 text-sm flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Legend */}
            <div className="p-4 bg-white/5 rounded border border-white/10">
              <h5 className="font-semibold text-white mb-3">Score Ranges</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm text-gray-300">🔴 0-40 Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-sm text-gray-300">🟡 41-70 Average</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm text-gray-300">🟢 71-90 Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-violet-500"></div>
                  <span className="text-sm text-gray-300">⭐️ 91-100 Excellent</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
