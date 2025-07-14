import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Lightbulb,
  Clock,
  BarChart3,
  Loader2,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrendData {
  keyword: string;
  currentInterest: number;
  trend: 'rising' | 'falling';
  growthRate: number;
  relatedQueries: string[];
  seasonality: string;
  peakMonths: string[];
  competitionLevel: string;
  searchVolume: number;
}

interface ContentOpportunity {
  contentType: string;
  title: string;
  keywords: string[];
  urgency: string;
  difficulty: string;
  estimatedTraffic: string;
}

interface PredictionResult {
  trendsData: TrendData[];
  predictions: {
    emergingTopics: any[];
    contentOpportunities: ContentOpportunity[];
    existingContentUpdates: any[];
    seasonalStrategy: any;
    competitorGaps: any[];
  };
}

export default function ContentTrendsPredictor() {
  const [keywords, setKeywords] = useState(['']);
  const [industry, setIndustry] = useState('');
  const [timeframe, setTimeframe] = useState('3m');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const addKeywordField = () => {
    if (keywords.length < 5) {
      setKeywords([...keywords, '']);
    }
  };

  const removeKeywordField = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords.length === 0 ? [''] : newKeywords);
  };

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const analyzeTrends = async () => {
    const validKeywords = keywords.filter(k => k.trim());
    if (validKeywords.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập ít nhất 1 từ khóa",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-trends-predictor', {
        body: {
          keywords: validKeywords,
          industry,
          timeframe
        }
      });

      if (error) throw error;
      setResult(data);
      
      toast({
        title: "Thành công",
        description: "Đã phân tích xu hướng content!"
      });
    } catch (error) {
      console.error('Trends analysis error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể phân tích xu hướng. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'rising' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-500/20';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-500/20';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Dự báo xu hướng Content
        </h1>
        <p className="text-muted-foreground">
          Sử dụng AI để dự đoán content trends và gợi ý strategy tương lai
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Thiết lập phân tích
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Ngành nghề</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Chọn ngành nghề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Công nghệ</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="ecommerce">Thương mại điện tử</SelectItem>
                  <SelectItem value="education">Giáo dục</SelectItem>
                  <SelectItem value="healthcare">Sức khỏe</SelectItem>
                  <SelectItem value="finance">Tài chính</SelectItem>
                  <SelectItem value="real-estate">Bất động sản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Khung thời gian</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 tháng</SelectItem>
                  <SelectItem value="3m">3 tháng</SelectItem>
                  <SelectItem value="6m">6 tháng</SelectItem>
                  <SelectItem value="1y">1 năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Từ khóa quan tâm (1-5 từ khóa)</Label>
              {keywords.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addKeywordField}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm
                </Button>
              )}
            </div>
            
            {keywords.map((keyword, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Từ khóa ${index + 1}`}
                  value={keyword}
                  onChange={(e) => updateKeyword(index, e.target.value)}
                  className="glass-input flex-1"
                />
                {keywords.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKeywordField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button 
            onClick={analyzeTrends}
            disabled={isAnalyzing}
            className="w-full gradient-primary"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang phân tích xu hướng...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Dự báo xu hướng
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Xu hướng</TabsTrigger>
            <TabsTrigger value="opportunities">Cơ hội</TabsTrigger>
            <TabsTrigger value="strategy">Chiến lược</TabsTrigger>
            <TabsTrigger value="updates">Cập nhật</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4">
              {result.trendsData.map((trend, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{trend.keyword}</h3>
                        {getTrendIcon(trend.trend)}
                        <Badge className={trend.trend === 'rising' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}>
                          {trend.growthRate > 0 ? '+' : ''}{trend.growthRate}%
                        </Badge>
                      </div>
                      <Badge variant="outline">{trend.competitionLevel}</Badge>
                    </div>
                    
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Mức độ quan tâm</p>
                        <Progress value={trend.currentInterest} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{trend.currentInterest}/100</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tìm kiếm hàng tháng</p>
                        <p className="font-medium">{trend.searchVolume.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">Truy vấn liên quan:</p>
                      <div className="flex flex-wrap gap-1">
                        {trend.relatedQueries.slice(0, 3).map((query, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {query}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <div className="grid gap-4">
              {result.predictions.contentOpportunities.map((opportunity, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{opportunity.title}</h3>
                        <p className="text-sm text-muted-foreground">{opportunity.contentType}</p>
                      </div>
                      <Badge className={getUrgencyColor(opportunity.urgency)}>
                        {opportunity.urgency}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Độ khó:</span>
                        <Badge variant="outline">{opportunity.difficulty}</Badge>
                        <span className="text-muted-foreground">Traffic dự kiến:</span>
                        <span className="font-medium">{opportunity.estimatedTraffic}</span>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Từ khóa target:</p>
                        <div className="flex flex-wrap gap-1">
                          {opportunity.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Chiến lược theo mùa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Peak sắp tới:</p>
                  <div className="flex gap-2">
                    {result.predictions.seasonalStrategy.upcomingPeaks.map((peak: string, index: number) => (
                      <Badge key={index} className="bg-blue-500/20 text-blue-700">
                        {peak}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Chuẩn bị trước:</p>
                  <p className="font-medium">{result.predictions.seasonalStrategy.prepareBy}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Loại content khuyến nghị:</p>
                  <div className="flex gap-2">
                    {result.predictions.seasonalStrategy.contentTypes.map((type: string, index: number) => (
                      <Badge key={index} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Khoảng trống đối thủ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.predictions.competitorGaps.map((gap, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium">{gap.opportunity}</h4>
                      <p className="text-sm text-muted-foreground">Độ khó: {gap.difficulty}</p>
                      <div className="flex gap-1 mt-2">
                        {gap.keywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
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

          <TabsContent value="updates" className="space-y-4">
            <div className="grid gap-4">
              {result.predictions.existingContentUpdates.map((update, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-orange-500/20 text-orange-700">
                            {update.action}
                          </Badge>
                        </div>
                        <p className="font-medium mb-1">{update.reason}</p>
                        <p className="text-sm text-muted-foreground mb-3">{update.newAngle}</p>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Từ khóa target mới:</p>
                          <div className="flex flex-wrap gap-1">
                            {update.targetKeywords.map((keyword: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}