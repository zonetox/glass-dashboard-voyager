import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BarChart3, 
  Loader2, 
  Crown,
  Award,
  TrendingDown,
  Plus
} from "lucide-react";

interface TopicAuthority {
  topic: string;
  authority_score: number;
  article_count: number;
  keyword_coverage: number;
  intent_match: number;
  strengths: string[];
  weaknesses: string[];
  category: 'primary' | 'secondary' | 'emerging';
}

interface AuthorityAnalysis {
  overall_score: number;
  dominant_topics: TopicAuthority[];
  suggested_topics: string[];
  coverage_gaps: string[];
  recommendations: string[];
}

interface TopicalAuthorityHeatmapProps {
  className?: string;
}

export default function TopicalAuthorityHeatmap({ className }: TopicalAuthorityHeatmapProps) {
  const [analysis, setAnalysis] = useState<AuthorityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const analyzeTopicalAuthority = async () => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để sử dụng tính năng này",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-topical-authority', {
        body: {
          user_id: user.id
        }
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        setAnalysis(data.analysis);
        setAnalyzed(true);
        toast({
          title: "Phân tích hoàn thành",
          description: `Đã phân tích ${data.analysis.dominant_topics.length} chủ đề chính với điểm tổng: ${data.analysis.overall_score}/100`
        });
      } else {
        throw new Error(data?.error || 'Không thể phân tích topical authority');
      }
    } catch (error) {
      console.error('Error analyzing topical authority:', error);
      toast({
        title: "Lỗi phân tích",
        description: error.message || "Không thể phân tích topical authority",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'primary': return 'bg-green-500';
      case 'secondary': return 'bg-yellow-500';
      case 'emerging': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'primary': return 'Thống trị';
      case 'secondary': return 'Mạnh';
      case 'emerging': return 'Phát triển';
      default: return 'Khác';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAuthorityIcon = (category: string) => {
    switch (category) {
      case 'primary': return Crown;
      case 'secondary': return Award;
      case 'emerging': return TrendingUp;
      default: return BarChart3;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Topical Authority Analysis
          </div>
          <div className="flex items-center gap-3">
            {analysis && (
              <Badge variant="outline" className={getScoreColor(analysis.overall_score)}>
                Overall Score: {analysis.overall_score}/100
              </Badge>
            )}
            <Button 
              onClick={analyzeTopicalAuthority} 
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {analyzed ? 'Làm mới' : 'Phân tích Authority'}
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {analysis ? (
          <div className="space-y-6">
            {/* Heatmap Grid */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Chủ đề thống trị ({analysis.dominant_topics.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.dominant_topics.map((topic, index) => {
                  const AuthorityIcon = getAuthorityIcon(topic.category);
                  return (
                    <Card 
                      key={index} 
                      className={`relative border-l-4 hover:shadow-md transition-shadow ${
                        topic.category === 'primary' ? 'border-l-green-500' :
                        topic.category === 'secondary' ? 'border-l-yellow-500' : 'border-l-blue-500'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <AuthorityIcon className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium text-sm">{topic.topic}</h4>
                          </div>
                          <Badge variant="outline" className={getCategoryColor(topic.category) + ' text-white text-xs'}>
                            {getCategoryLabel(topic.category)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Authority Score</span>
                            <span className="font-medium">{topic.authority_score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                topic.authority_score >= 80 ? 'bg-green-500' :
                                topic.authority_score >= 60 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${topic.authority_score}%` }}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-3">
                            <div className="text-center">
                              <div className="font-medium">{topic.article_count}</div>
                              <div>Bài viết</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{topic.keyword_coverage}%</div>
                              <div>Keywords</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{topic.intent_match}%</div>
                              <div>Intent</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Suggested Topics - Gray Areas */}
            {analysis.suggested_topics.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Chủ đề cần tăng cường ({analysis.suggested_topics.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {analysis.suggested_topics.map((topic, index) => (
                    <Card key={index} className="border-dashed border-gray-300 bg-gray-50">
                      <CardContent className="p-3 text-center">
                        <Plus className="h-5 w-5 mx-auto text-gray-400 mb-2" />
                        <div className="text-sm font-medium text-gray-600">{topic}</div>
                        <div className="text-xs text-gray-500 mt-1">Chưa phủ</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Coverage Gaps */}
            {analysis.coverage_gaps.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Khoảng trống coverage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.coverage_gaps.map((gap, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <TrendingDown className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      <span className="text-sm text-orange-800">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Đề xuất cải thiện
                </h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm text-blue-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        ) : analyzed ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Không có dữ liệu phân tích</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Phân tích topical authority để hiểu những chủ đề bạn đang thống trị và cần cải thiện
            </p>
            <p className="text-sm text-muted-foreground">
              Nhấn "Phân tích Authority" để bắt đầu đánh giá sức mạnh chủ đề của website
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}