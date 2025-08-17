import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Download,
  Target,
  Lightbulb,
  MessageSquare,
  FileText,
  Eye,
  TrendingUp,
  Bot,
  Zap,
  Search,
  Globe,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComprehensiveAISEOReportProps {
  scanData: any;
  aiAnalysis: any;
  className?: string;
}

export function ComprehensiveAISEOReport({ 
  scanData, 
  aiAnalysis, 
  className 
}: ComprehensiveAISEOReportProps) {
  const { toast } = useToast();
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleGenerateAIPDF = async () => {
    setGeneratingPDF(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-pdf-report', {
        body: {
          url: scanData.url,
          scan_id: scanData.id,
          include_ai: true,
          user_id: scanData.user_id
        }
      });

      if (error) throw error;

      toast({
        title: "Báo cáo AI SEO PDF đã tạo thành công",
        description: "Báo cáo AI SEO chi tiết đã được tạo và lưu trữ."
      });

      // Open PDF in new tab
      if (data.file_url) {
        window.open(data.file_url, '_blank');
      }
    } catch (error) {
      console.error('Error generating AI PDF:', error);
      toast({
        title: "Lỗi tạo báo cáo AI",
        description: "Không thể tạo báo cáo AI PDF. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIntentBadgeVariant = (intent: string) => {
    const intentLower = intent?.toLowerCase() || '';
    if (intentLower.includes('commercial') || intentLower.includes('transactional')) {
      return 'bg-green-100 text-green-800';
    }
    if (intentLower.includes('informational')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (intentLower.includes('navigational')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Extract citation score from text
  const extractCitationScore = (citationText: string): number => {
    if (!citationText) return 0;
    const match = citationText.match(/(\d+)\/10/);
    return match ? parseInt(match[1]) * 10 : 50;
  };

  const citationScore = extractCitationScore(aiAnalysis?.citationPotential || '');
  const overallAIScore = aiAnalysis?.overallScore || 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">Báo Cáo AI SEO Toàn Diện</h2>
            <p className="text-muted-foreground">{scanData?.url}</p>
          </div>
        </div>
        <Button 
          onClick={handleGenerateAIPDF}
          disabled={generatingPDF}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
        >
          {generatingPDF ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Tải AI PDF
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng Quan AI</TabsTrigger>
          <TabsTrigger value="intent">Ý Định Tìm Kiếm</TabsTrigger>
          <TabsTrigger value="content">Nội Dung AI</TabsTrigger>
          <TabsTrigger value="optimization">Tối Ưu AI</TabsTrigger>
        </TabsList>

        {/* AI Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* AI Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-purple-200">
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className={`text-3xl font-bold ${getScoreColor(overallAIScore)}`}>
                  {overallAIScore}/100
                </div>
                <div className="text-sm text-muted-foreground">Điểm AI SEO Tổng Thể</div>
                <Progress value={overallAIScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className={`text-3xl font-bold ${getScoreColor(citationScore)}`}>
                  {citationScore}/100
                </div>
                <div className="text-sm text-muted-foreground">Tiềm Năng Trích Dẫn AI</div>
                <Progress value={citationScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">
                  {aiAnalysis?.semanticGaps?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Cơ Hội Tối Ưu</div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Summary */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                Tóm Tắt Phân Tích AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiAnalysis?.citationPotential && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">Tiềm Năng Trích Dẫn AI</h4>
                  <p className="text-sm text-purple-700">{aiAnalysis.citationPotential}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {aiAnalysis?.semanticGaps?.length || 0}
                  </div>
                  <div className="text-sm text-blue-700">Khoảng Trống Ngữ Nghĩa</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {aiAnalysis?.faqSuggestions?.length || 0}
                  </div>
                  <div className="text-sm text-green-700">Gợi Ý FAQ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin AI Nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Ngày Phân Tích AI:</span>
                  <div className="text-muted-foreground">
                    {new Date(scanData?.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Ý Định Tìm Kiếm:</span>
                  <div className="text-muted-foreground">
                    {aiAnalysis?.searchIntent || 'Chưa phân tích'}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Chủ Đề Ngữ Nghĩa:</span>
                  <div className="text-muted-foreground">
                    {aiAnalysis?.semanticTopics?.length || 0} chủ đề
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Đề Xuất Cải Thiện:</span>
                  <div className="text-muted-foreground">
                    {aiAnalysis?.improvementSuggestions?.length || 0} đề xuất
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Intent Tab */}
        <TabsContent value="intent" className="space-y-6">
          {/* Search Intent Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Phân Tích Ý Định Tìm Kiếm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiAnalysis?.searchIntent && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <span className="font-medium">Ý Định Chính:</span>
                    <Badge className={`ml-2 ${getIntentBadgeVariant(aiAnalysis.searchIntent)}`}>
                      {aiAnalysis.searchIntent}
                    </Badge>
                  </div>
                </div>
              )}

              {aiAnalysis?.semanticTopics && aiAnalysis.semanticTopics.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Chủ Đề Ngữ Nghĩa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiAnalysis.semanticTopics.map((topic: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Gaps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Phân Tích Khoảng Trống Nội Dung
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiAnalysis?.contentGaps && aiAnalysis.contentGaps.length > 0 ? (
                <div className="space-y-3">
                  {aiAnalysis.contentGaps.map((gap: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-orange-600 mt-1" />
                        <div>
                          <h5 className="font-medium">{gap.topic || gap}</h5>
                          {gap.description && (
                            <p className="text-sm text-muted-foreground mt-1">{gap.description}</p>
                          )}
                          {gap.priority && (
                            <Badge className="mt-2" variant={
                              gap.priority === 'high' ? 'destructive' :
                              gap.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {gap.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Không phát hiện khoảng trống nội dung đáng kể.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Semantic Gaps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Khoảng Trống Ngữ Nghĩa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiAnalysis?.semanticGaps && aiAnalysis.semanticGaps.length > 0 ? (
                <div className="space-y-2">
                  {aiAnalysis.semanticGaps.map((gap: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span className="text-sm">{gap.replace(/^[-•]\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Không phát hiện khoảng trống ngữ nghĩa.
                </p>
              )}
            </CardContent>
          </Card>

          {/* FAQ Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Gợi Ý Câu Hỏi Thường Gặp (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiAnalysis?.faqSuggestions && aiAnalysis.faqSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {aiAnalysis.faqSuggestions.map((faq: string, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-sm font-medium">{faq.replace(/^[-•]\s*/, '')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Chưa có gợi ý FAQ nào.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Keyword Density */}
          {aiAnalysis?.keywordDensity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Mật Độ Từ Khóa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(aiAnalysis.keywordDensity).map(([keyword, data]: [string, any]) => (
                    <div key={keyword} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{keyword}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{data.count} lần</span>
                        <Badge variant={data.density > 3 ? 'destructive' : data.density > 1 ? 'default' : 'secondary'}>
                          {data.density}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          {/* AI Improvement Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Đề Xuất Cải Thiện AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiAnalysis?.improvementSuggestions && aiAnalysis.improvementSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {aiAnalysis.improvementSuggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{suggestion.replace(/^[-•]\s*/, '')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Chưa có đề xuất cải thiện nào.
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Priority Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hành Động Ưu Tiên AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Tối Ưu Cho AI Search</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Cải thiện cấu trúc nội dung</li>
                      <li>• Thêm schema markup</li>
                      <li>• Tối ưu featured snippets</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Nâng Cao Trích Dẫn</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Thêm nguồn tham khảo</li>
                      <li>• Cải thiện E-A-T</li>
                      <li>• Tối ưu entity recognition</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical SEO for AI */}
          {aiAnalysis?.technicalSEO && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  SEO Kỹ Thuật Cho AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(aiAnalysis.technicalSEO).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <Badge variant={value?.status === 'good' ? 'default' : value?.status === 'warning' ? 'destructive' : 'secondary'}>
                        {value?.status || 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}