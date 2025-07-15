import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, AlertTriangle, Target, LineChart, Sparkles, Shield, Plus, X, Loader2, Search } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KeywordPrediction {
  keyword: string;
  currentPosition: number;
  predictions: {
    "7d": number;
    "14d": number;
    "30d": number;
  };
  confidenceLevel: number;
  trend: 'up' | 'down' | 'stable';
}

interface TrendAnalysis {
  topic: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  trendData: Array<{
    month: string;
    searchVolume: number;
    contentMentions: number;
    competitionLevel: number;
  }>;
  suggestedClusters: string[];
  contentRecommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
  insights: string;
}

export function PredictiveDashboard() {
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<KeywordPrediction[]>([]);
  const [insights, setInsights] = useState<string>('');
  
  // Trend momentum state
  const [trendTopic, setTrendTopic] = useState<string>('');
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  
  const { toast } = useToast();

  const addKeyword = () => {
    if (keywords.length < 10) {
      setKeywords([...keywords, '']);
    }
  };

  const removeKeyword = (index: number) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index));
    }
  };

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const handlePredict = async () => {
    const validKeywords = keywords.filter(k => k.trim() !== '');
    if (validKeywords.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập ít nhất 1 từ khóa",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-ranking', {
        body: { keywords: validKeywords }
      });

      if (error) throw error;

      setPredictions(data.predictions);
      setInsights(data.insights);
      
      toast({
        title: "Thành công",
        description: `Dự đoán ranking cho ${validKeywords.length} từ khóa thành công!`
      });
    } catch (error) {
      console.error('Error predicting rankings:', error);
      toast({
        title: "Lỗi",
        description: "Không thể dự đoán ranking. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrendAnalysis = async () => {
    if (!trendTopic.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập chủ đề cần phân tích",
        variant: "destructive"
      });
      return;
    }

    setIsTrendLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('trend-momentum', {
        body: { topic: trendTopic.trim() }
      });

      if (error) throw error;

      setTrendAnalysis(data);
      
      toast({
        title: "Thành công",
        description: `Phân tích xu hướng cho "${trendTopic}" thành công!`
      });
    } catch (error) {
      console.error('Error analyzing trend:', error);
      toast({
        title: "Lỗi",
        description: "Không thể phân tích xu hướng. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsTrendLoading(false);
    }
  };

  const getTrendBadge = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">🔺 Tăng</Badge>;
      case 'decreasing':
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">🔻 Giảm</Badge>;
      case 'stable':
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">➖ Ổn định</Badge>;
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Cao</Badge>;
      case 'medium':
        return <Badge variant="secondary">Trung bình</Badge>;
      case 'low':
        return <Badge variant="outline">Thấp</Badge>;
    }
  };

  // Prepare chart data
  const chartData = predictions.length > 0 ? [
    {
      period: 'Hiện tại',
      ...predictions.reduce((acc, pred) => {
        acc[pred.keyword] = pred.currentPosition;
        return acc;
      }, {} as any)
    },
    {
      period: '7 ngày',
      ...predictions.reduce((acc, pred) => {
        acc[pred.keyword] = pred.predictions['7d'];
        return acc;
      }, {} as any)
    },
    {
      period: '14 ngày',
      ...predictions.reduce((acc, pred) => {
        acc[pred.keyword] = pred.predictions['14d'];
        return acc;
      }, {} as any)
    },
    {
      period: '30 ngày',
      ...predictions.reduce((acc, pred) => {
        acc[pred.keyword] = pred.predictions['30d'];
        return acc;
      }, {} as any)
    }
  ] : [];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#0000ff'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          AI Predictive SEO – Dự đoán biến động thứ hạng & xu hướng
        </h2>
        <p className="text-muted-foreground">
          Công cụ AI dự đoán thứ hạng từ khóa, search trend và rủi ro SEO
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keyword Ranking Forecast - Enhanced */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Keyword Ranking Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Nhập tối đa 10 từ khóa để dự đoán thứ hạng
            </div>
            
            {/* Keyword Input Section */}
            <div className="space-y-3">
              {keywords.map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Từ khóa ${index + 1}`}
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    className="flex-1"
                  />
                  {keywords.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeKeyword(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {keywords.length < 10 && (
                <Button
                  variant="outline"
                  onClick={addKeyword}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm từ khóa
                </Button>
              )}
            </div>

            {/* Predict Button */}
            <Button 
              onClick={handlePredict}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang dự đoán...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Dự đoán
                </>
              )}
            </Button>

            {/* Results */}
            {predictions.length > 0 && (
              <div className="space-y-4 mt-6">
                {/* Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis reversed domain={[100, 1]} />
                      <Tooltip />
                      <Legend />
                      {predictions.map((pred, index) => (
                        <Line
                          key={pred.keyword}
                          type="monotone"
                          dataKey={pred.keyword}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                        />
                      ))}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>

                {/* Prediction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {predictions.map((pred) => (
                    <div key={pred.keyword} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{pred.keyword}</span>
                        <Badge variant={pred.trend === 'up' ? 'default' : pred.trend === 'down' ? 'destructive' : 'secondary'}>
                          {pred.trend === 'up' ? '↗️' : pred.trend === 'down' ? '↘️' : '➡️'}
                        </Badge>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>Hiện tại: #{pred.currentPosition}</div>
                        <div>30 ngày: #{pred.predictions['30d']}</div>
                        <div>Độ tin cậy: {pred.confidenceLevel}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Insights */}
                {insights && (
                  <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Insights
                    </h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {insights}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trend Momentum Detector - Enhanced */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Trend Momentum Detector
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Phát hiện xu hướng tìm kiếm và cơ hội từ khóa mới
            </div>
            
            {/* Input Section */}
            <div className="flex gap-2">
              <Input
                placeholder="Nhập chủ đề hoặc keyword..."
                value={trendTopic}
                onChange={(e) => setTrendTopic(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleTrendAnalysis()}
              />
              <Button 
                onClick={handleTrendAnalysis}
                disabled={isTrendLoading}
                size="icon"
              >
                {isTrendLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Results */}
            {trendAnalysis && (
              <div className="space-y-4 animate-fade-in">
                {/* Trend Status */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">{trendAnalysis.topic}</div>
                    <div className="text-xs text-muted-foreground">Độ tin cậy: {trendAnalysis.confidence}%</div>
                  </div>
                  {getTrendBadge(trendAnalysis.trend)}
                </div>

                {/* Timeline Chart */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendAnalysis.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="searchVolume"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="Search Volume"
                      />
                      <Area
                        type="monotone"
                        dataKey="contentMentions"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                        name="Content Mentions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Suggested Clusters */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Topic Clusters</div>
                  <div className="flex flex-wrap gap-1">
                    {trendAnalysis.suggestedClusters.slice(0, 3).map((cluster, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cluster}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Content Recommendations */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Khuyến nghị nội dung</div>
                  <div className="space-y-2">
                    {trendAnalysis.contentRecommendations.slice(0, 2).map((rec, index) => (
                      <div key={index} className="flex items-center justify-between text-xs p-2 bg-secondary/20 rounded">
                        <span className="flex-1">{rec.action}</span>
                        {getPriorityBadge(rec.priority)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                {trendAnalysis.insights && (
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="text-sm font-medium mb-1 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      AI Insights
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-3">
                      {trendAnalysis.insights}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!trendAnalysis && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">Nhập chủ đề để bắt đầu phân tích xu hướng</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Warning System */}
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-red-500" />
              Risk Warning System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Cảnh báo sớm về rủi ro SEO và biến động thuật toán
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-red-700 dark:text-red-400">High Risk</div>
                  <div className="text-xs text-muted-foreground">2 từ khóa có nguy cơ giảm rank</div>
                </div>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-orange-700 dark:text-orange-400">Medium Risk</div>
                  <div className="text-xs text-muted-foreground">6 từ khóa cần theo dõi</div>
                </div>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-green-700 dark:text-green-400">Safe Zone</div>
                  <div className="text-xs text-muted-foreground">16 từ khóa an toàn</div>
                </div>
                <Shield className="h-4 w-4 text-green-600" />
              </div>
            </div>
            
            <div className="pt-2">
              <Button className="w-full text-sm bg-red-500 text-white hover:bg-red-600">
                Xem cảnh báo chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}