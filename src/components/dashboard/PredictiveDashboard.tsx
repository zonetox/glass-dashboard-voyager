import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, AlertTriangle, Target, LineChart, Sparkles, Shield, Plus, X, Loader2 } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

export function PredictiveDashboard() {
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<KeywordPrediction[]>([]);
  const [insights, setInsights] = useState<string>('');
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

        {/* Trend Momentum Detector */}
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
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-blue-700 dark:text-blue-400">Hot Trends</div>
                  <div className="text-xs text-muted-foreground">5 xu hướng đang nóng</div>
                </div>
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-purple-700 dark:text-purple-400">Emerging Keywords</div>
                  <div className="text-xs text-muted-foreground">18 từ khóa tiềm năng mới</div>
                </div>
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-indigo-500/10 rounded-lg">
                <div>
                  <div className="font-medium text-indigo-700 dark:text-indigo-400">Seasonal Patterns</div>
                  <div className="text-xs text-muted-foreground">3 mùa vụ được phát hiện</div>
                </div>
                <LineChart className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            
            <div className="pt-2">
              <Button className="w-full text-sm bg-blue-500 text-white hover:bg-blue-600">
                Khám phá xu hướng
              </Button>
            </div>
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