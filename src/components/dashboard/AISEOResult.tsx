import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Search,
  Lightbulb,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  PenTool,
  Loader2
} from "lucide-react";

interface KeywordTrend {
  keyword: string;
  trend_score: number;
  reason: string;
  difficulty: number;
}

interface AISEOResultProps {
  aiAnalysis: any;
  scanUrl?: string;
  scanId?: string;
}

export default function AISEOResult({ aiAnalysis, scanUrl, scanId }: AISEOResultProps) {
  const [keywordTrends, setKeywordTrends] = useState<KeywordTrend[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [trendsLoaded, setTrendsLoaded] = useState(false);
  const { toast } = useToast();

  if (!aiAnalysis || typeof aiAnalysis !== 'object') {
    return (
      <Card className="border">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No AI analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const analysis = aiAnalysis as Record<string, any>;

  const fetchKeywordTrends = async () => {
    if (!scanUrl && !analysis?.content) {
      toast({
        title: "Lỗi",
        description: "Không có nội dung để phân tích xu hướng từ khóa",
        variant: "destructive"
      });
      return;
    }

    setLoadingTrends(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-keyword-trends', {
        body: {
          topic: scanUrl,
          content: analysis?.content || analysis?.description || analysis?.summary || ''
        }
      });

      if (error) throw error;

      if (data?.success && data?.trends) {
        setKeywordTrends(data.trends);
        setTrendsLoaded(true);
        toast({
          title: "Thành công",
          description: `Đã phân tích ${data.trends.length} từ khóa xu hướng`
        });
      } else {
        throw new Error(data?.error || 'Không thể lấy dữ liệu xu hướng từ khóa');
      }
    } catch (error) {
      console.error('Error fetching keyword trends:', error);
      toast({
        title: "Lỗi phân tích",
        description: error.message || "Không thể phân tích xu hướng từ khóa",
        variant: "destructive"
      });
    } finally {
      setLoadingTrends(false);
    }
  };

  const getTrendIcon = (score: number) => {
    if (score >= 70) return ArrowUp;
    if (score >= 40) return Minus;
    return ArrowDown;
  };

  const getTrendColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'bg-green-100 text-green-700 border-green-200';
    if (difficulty <= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 30) return 'Dễ';
    if (difficulty <= 60) return 'Trung bình';
    return 'Khó';
  };

  return (
    <Card className="border animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          🤖 AI SEO Analysis Results
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-1">
              <BarChart3 className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="intent" className="gap-1">
              <Target className="h-3 w-3" />
              Intent
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending Keywords
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-1">
              <Lightbulb className="h-3 w-3" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.searchIntent && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Search Intent</h4>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {analysis.searchIntent}
                  </Badge>
                </div>
              )}

              {analysis.overallScore && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Overall Score</h4>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {analysis.overallScore}/100
                  </Badge>
                </div>
              )}

              {analysis.contentQuality && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Content Quality</h4>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {analysis.contentQuality}
                  </Badge>
                </div>
              )}

              {analysis.technicalSEO && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Technical SEO</h4>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {analysis.technicalSEO}
                  </Badge>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="intent" className="space-y-4">
            {analysis.searchIntent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Search Intent Analysis</h3>
                </div>
                <Card className="bg-muted/50 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-lg">{analysis.searchIntent}</p>
                  </CardContent>
                </Card>
                
                {analysis.intentDescription && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Description</h4>
                    <p className="text-muted-foreground">{analysis.intentDescription}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No search intent analysis available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Trending Keywords</h3>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={fetchKeywordTrends} 
                    disabled={loadingTrends}
                    variant="outline"
                    size="sm"
                  >
                    {loadingTrends ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        {trendsLoaded ? 'Làm mới' : 'Phân tích xu hướng'}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {keywordTrends.length > 0 ? (
                <div className="space-y-3">
                  {keywordTrends.map((trend, index) => {
                    const TrendIcon = getTrendIcon(trend.trend_score);
                    return (
                      <Card key={index} className="border-l-4 border-l-primary/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="font-medium text-lg">{trend.keyword}</h5>
                                <div className="flex items-center gap-2">
                                  <TrendIcon className={`h-4 w-4 ${getTrendColor(trend.trend_score)}`} />
                                  <span className={`text-sm font-medium ${getTrendColor(trend.trend_score)}`}>
                                    {trend.trend_score}%
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {trend.reason}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getDifficultyColor(trend.difficulty)}>
                                  Độ khó: {getDifficultyLabel(trend.difficulty)} ({trend.difficulty}%)
                                </Badge>
                                <Badge variant="secondary">
                                  Cơ hội: {Math.max(0, 100 - trend.difficulty)}%
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => {
                                toast({
                                  title: "Gợi ý nội dung",
                                  description: `Hãy viết thêm nội dung về "${trend.keyword}" để tối ưu hóa xu hướng tìm kiếm này`,
                                });
                              }}
                            >
                              <PenTool className="h-4 w-4" />
                              Viết mở rộng
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  <Card className="bg-muted/50 border-dashed">
                    <CardContent className="p-4 text-center">
                      <PenTool className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <h4 className="font-medium mb-1">Gợi ý viết thêm nội dung mở rộng</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Tận dụng các từ khóa xu hướng trên để tạo nội dung mới hoặc mở rộng bài viết hiện tại
                      </p>
                      <Button size="sm" className="gap-2">
                        <PenTool className="h-4 w-4" />
                        Tạo kế hoạch nội dung
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : trendsLoaded ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không tìm thấy từ khóa xu hướng</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nhấn "Phân tích xu hướng" để khám phá các từ khóa đang trending liên quan đến nội dung này
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {analysis.issues && Array.isArray(analysis.issues) && analysis.issues.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h3 className="text-lg font-semibold">Identified Issues</h3>
                </div>
                {analysis.issues.map((issue: any, index: number) => (
                  <Card key={index} className="border-destructive/20 bg-destructive/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="destructive" className="mt-0.5">
                          {issue.severity || 'Medium'}
                        </Badge>
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">
                            {issue.title || issue.type || `Issue ${index + 1}`}
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {issue.description || issue.message || issue}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">No issues identified</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {analysis.recommendations && Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">AI Recommendations</h3>
                </div>
                {analysis.recommendations.map((rec: any, index: number) => (
                  <Card key={index} className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">
                            {rec.title || `Recommendation ${index + 1}`}
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {rec.description || rec.content || rec}
                          </p>
                          {rec.priority && (
                            <Badge variant="outline" className="mt-2">
                              Priority: {rec.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recommendations available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Raw data section for debugging */}
        <Separator className="my-6" />
        <details className="space-y-2">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            View Raw AI Analysis Data
          </summary>
          <ScrollArea className="h-48 w-full">
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </ScrollArea>
        </details>
      </CardContent>
    </Card>
  );
}