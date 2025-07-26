import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  BarChart3, 
  FileText, 
  Bot, 
  Code2, 
  Image, 
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  Eye,
  Link,
  Zap,
  Download,
  Send,
  Loader2
} from 'lucide-react';

interface SimplifiedSEODashboardProps {
  onGeneratePDF?: () => void;
  isGeneratingPDF?: boolean;
}

export function SimplifiedSEODashboard({ 
  onGeneratePDF, 
  isGeneratingPDF 
}: SimplifiedSEODashboardProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [schemaResult, setSchemaResult] = useState<any>(null);
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const analyzeWebsite = async () => {
    if (!url.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập URL cần phân tích",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAiSuggestions(null);
    setSchemaResult(null);
    setImageAnalysis(null);
    
    try {
      console.log('Starting LIVE website analysis for:', url.trim());
      
      // Call the live website analyzer function
      const { data, error } = await supabase.functions.invoke('live-website-analyzer', {
        body: { 
          url: url.trim(),
          user_id: user?.id 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('Live analysis completed:', data);
      setAnalysisResult(data);
      
      toast({
        title: "Phân tích thành công",
        description: `Website đã được phân tích chi tiết. Điểm SEO: ${data.seoScore}/100`,
      });
    } catch (error) {
      console.error('Live analysis error:', error);
      toast({
        title: "Lỗi phân tích",
        description: "Không thể phân tích website. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickFix = async () => {
    if (!analysisResult) return;
    
    try {
      console.log('Starting AI content fixes for:', analysisResult.url);
      
      // Get AI content suggestions for title
      const { data: titleSuggestion, error: titleError } = await supabase.functions.invoke('ai-content-rewriter', {
        body: {
          url: analysisResult.url,
          contentType: 'title',
          originalContent: analysisResult.title || 'Untitled Page',
          user_id: user?.id
        }
      });

      if (titleError) {
        throw new Error(titleError.message);
      }

      setAiSuggestions(titleSuggestion);
      
      toast({
        title: "Gợi ý AI đã sẵn sàng",
        description: "Kiểm tra tab Content AI để xem các gợi ý cải thiện",
      });
      
      setActiveTab('content-ai');
    } catch (error) {
      console.error('AI fix error:', error);
      toast({
        title: "Lỗi tạo gợi ý",
        description: "Không thể tạo gợi ý AI. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const generateSchemaMarkup = async () => {
    if (!analysisResult) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('smart-schema-generator', {
        body: {
          url: analysisResult.url,
          existing_schema: analysisResult.existingSchema,
          page_content: {
            title: analysisResult.title,
            description: analysisResult.metaDescription,
            headings: [...analysisResult.headings.h1, ...analysisResult.headings.h2],
            content: analysisResult.htmlContent
          },
          user_id: user?.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setSchemaResult(data);
      setActiveTab('schema');
      
      toast({
        title: "Schema markup đã tạo",
        description: "Kiểm tra tab Schema để xem kết quả",
      });
    } catch (error) {
      console.error('Schema generation error:', error);
      toast({
        title: "Lỗi tạo schema",
        description: "Không thể tạo schema markup. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const analyzeImages = async () => {
    if (!analysisResult) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('image-optimizer', {
        body: {
          url: analysisResult.url,
          user_id: user?.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setImageAnalysis(data);
      setActiveTab('images');
      
      toast({
        title: "Phân tích hình ảnh hoàn tất",
        description: `Phân tích ${data.summary.total_images} hình ảnh với ${data.summary.optimization_opportunities} cơ hội tối ưu`,
      });
    } catch (error) {
      console.error('Image analysis error:', error);
      toast({
        title: "Lỗi phân tích hình ảnh",
        description: "Không thể phân tích hình ảnh. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* [1] URL Input Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Phân tích SEO Website
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Nhập URL website (ví dụ: https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={isAnalyzing}
            />
            <Button
              onClick={analyzeWebsite}
              disabled={!url.trim() || isAnalyzing}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Phân tích
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* [2] Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overall Score Header */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-lg ${getScoreColor(analysisResult.seoScore || 0)}`}>
                    <div className="text-3xl font-bold">{analysisResult.seoScore || 0}</div>
                    <div className="text-sm">/ 100</div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Điểm SEO tổng thể</h2>
                    <p className="text-gray-600">{analysisResult.url}</p>
                    <p className="text-sm text-gray-500">Phân tích lúc: {new Date(analysisResult.timestamp).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                
                {/* [3] Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={handleQuickFix} variant="outline" className="gap-2">
                    <Zap className="h-4 w-4" />
                    Fix ngay
                  </Button>
                  <Button onClick={onGeneratePDF} disabled={isGeneratingPDF} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    {isGeneratingPDF ? 'Đang tạo...' : 'Tải về báo cáo'}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Send className="h-4 w-4" />
                    Gửi yêu cầu tối ưu
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="onpage" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                SEO Onpage
              </TabsTrigger>
              <TabsTrigger value="content-ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Content AI
              </TabsTrigger>
              <TabsTrigger value="schema" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Schema
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Hình ảnh
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Kỹ thuật
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Điểm mạnh
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResult.title && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">Có title tag</span>
                        </div>
                      )}
                      {analysisResult.metaDescription && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">Có meta description</span>
                        </div>
                      )}
                      {analysisResult.headings?.h1?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">Có thẻ H1</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Cần cải thiện
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResult.technicalIssues?.map((issue: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span className="text-sm">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Thống kê nhanh
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Số từ:</span>
                        <span className="font-medium">{analysisResult.contentAnalysis?.wordCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Thời gian đọc:</span>
                        <span className="font-medium">{analysisResult.contentAnalysis?.readingTime || 0} phút</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Hình ảnh:</span>
                        <span className="font-medium">{analysisResult.images?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* SEO Onpage Tab */}
            <TabsContent value="onpage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Title Tag</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Nội dung:</span>
                        <Badge variant={analysisResult.title ? "default" : "destructive"}>
                          {analysisResult.title ? "Có" : "Thiếu"}
                        </Badge>
                      </div>
                      {analysisResult.title && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">{analysisResult.title}</p>
                          <p className="text-xs text-gray-500 mt-1">Độ dài: {analysisResult.title.length} ký tự</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Meta Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Nội dung:</span>
                        <Badge variant={analysisResult.metaDescription ? "default" : "destructive"}>
                          {analysisResult.metaDescription ? "Có" : "Thiếu"}
                        </Badge>
                      </div>
                      {analysisResult.metaDescription && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">{analysisResult.metaDescription}</p>
                          <p className="text-xs text-gray-500 mt-1">Độ dài: {analysisResult.metaDescription.length} ký tự</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cấu trúc Heading</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['h1', 'h2', 'h3'].map((level) => (
                      <div key={level}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm uppercase">{level}</span>
                          <Badge variant="outline">
                            {analysisResult.headings?.[level]?.length || 0}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {analysisResult.headings?.[level]?.map((heading: string, index: number) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              {heading}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content AI Tab */}
            <TabsContent value="content-ai" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gợi ý AI Content</h3>
                <Button onClick={handleQuickFix} variant="outline" size="sm">
                  <Bot className="h-4 w-4 mr-2" />
                  Tạo gợi ý mới
                </Button>
              </div>

              {aiSuggestions ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Nội dung được viết lại</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <h4 className="font-medium text-green-800">Nội dung mới:</h4>
                          <p className="text-green-700 mt-1">{aiSuggestions.rewritten_content}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Cải thiện:</h4>
                            <ul className="space-y-1">
                              {aiSuggestions.improvements?.map((improvement: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Thông tin:</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Điểm SEO:</span>
                                <span className="font-medium">{aiSuggestions.seo_score}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Độ dài:</span>
                                <span className="font-medium">{aiSuggestions.character_count} ký tự</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Từ khóa:</span>
                                <span className="font-medium">{aiSuggestions.keywords_used?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có gợi ý AI</h3>
                      <p className="text-gray-600 mb-4">Nhấn "Fix ngay" để tạo gợi ý cải thiện nội dung</p>
                      <Button onClick={handleQuickFix}>
                        <Bot className="h-4 w-4 mr-2" />
                        Tạo gợi ý AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Schema Tab */}
            <TabsContent value="schema" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Schema Markup</h3>
                <Button onClick={generateSchemaMarkup} variant="outline" size="sm">
                  <Code2 className="h-4 w-4 mr-2" />
                  Tạo Schema
                </Button>
              </div>

              {analysisResult.existingSchema ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Schema hiện tại
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(analysisResult.existingSchema, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Code2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có Schema Markup</h3>
                      <p className="text-gray-600 mb-4">Trang web chưa có schema markup. Tạo ngay để cải thiện SEO.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {schemaResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Schema được đề xuất</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Phân tích:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Loại schema:</span>
                              <Badge>{schemaResult.analysis?.recommended_schema_type}</Badge>
                            </div>
                            <div>
                              <span className="font-medium">Lợi ích SEO:</span>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                {schemaResult.analysis?.seo_benefits?.map((benefit: string, index: number) => (
                                  <li key={index}>{benefit}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Hướng dẫn:</h4>
                          <div className="text-sm space-y-2">
                            <p>{schemaResult.implementation?.how_to_add}</p>
                            <a 
                              href={schemaResult.implementation?.validation_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Kiểm tra schema →
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">JSON-LD Schema (copy để sử dụng):</h4>
                        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm border">
                          {JSON.stringify(schemaResult.schema_json, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Phân tích hình ảnh</h3>
                <Button onClick={analyzeImages} variant="outline" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Phân tích lại
                </Button>
              </div>

              {imageAnalysis ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{imageAnalysis.summary.total_images}</div>
                          <div className="text-sm text-gray-600">Tổng hình ảnh</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{imageAnalysis.summary.missing_alt}</div>
                          <div className="text-sm text-gray-600">Thiếu alt text</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{imageAnalysis.summary.oversized_images}</div>
                          <div className="text-sm text-gray-600">Hình quá nặng</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(imageAnalysis.summary.overall_score).replace('bg-', 'text-').replace('-100', '-600')}`}>
                            {imageAnalysis.summary.overall_score}
                          </div>
                          <div className="text-sm text-gray-600">Điểm tổng thể</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Image List */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Chi tiết hình ảnh</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {imageAnalysis.images.map((img: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                              <div>
                                <div className="text-sm font-medium mb-1">Hình ảnh #{img.index}</div>
                                <div className="text-xs text-gray-500 break-all">{img.src}</div>
                                {img.size_kb && (
                                  <Badge variant="outline" className="mt-1">
                                    {img.size_kb}KB
                                  </Badge>
                                )}
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium mb-1">Alt Text</div>
                                <div className="text-sm">
                                  {img.alt ? (
                                    <span className="text-green-700">{img.alt}</span>
                                  ) : (
                                    <span className="text-red-600">Thiếu alt text</span>
                                  )}
                                </div>
                                {img.alt_suggestion && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                    <div className="font-medium text-blue-800">Gợi ý:</div>
                                    <div className="text-blue-700">{img.alt_suggestion}</div>
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium mb-1">Vấn đề</div>
                                <div className="space-y-1">
                                  {img.issues.map((issue: string, issueIndex: number) => (
                                    <div key={issueIndex} className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                                      <span className="text-xs">{issue}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium mb-1">Điểm SEO</div>
                                <div className={`text-lg font-bold ${getScoreColor(img.seo_score).replace('bg-', 'text-').replace('-100', '-600')}`}>
                                  {img.seo_score}/100
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa phân tích hình ảnh</h3>
                      <p className="text-gray-600 mb-4">Nhấn "Phân tích lại" để kiểm tra tất cả hình ảnh trên trang</p>
                      <Button onClick={analyzeImages}>
                        <Image className="h-4 w-4 mr-2" />
                        Bắt đầu phân tích
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vấn đề kỹ thuật</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResult.technicalIssues?.length > 0 ? (
                        analysisResult.technicalIssues.map((issue: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{issue}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Không phát hiện vấn đề kỹ thuật nghiêm trọng</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thông tin kỹ thuật</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Có schema:</span>
                        <Badge variant={analysisResult.existingSchema ? "default" : "destructive"}>
                          {analysisResult.existingSchema ? "Có" : "Không"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Số từ khóa phổ biến:</span>
                        <span className="font-medium">
                          {Object.keys(analysisResult.contentAnalysis?.keywordDensity || {}).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thời gian phân tích:</span>
                        <span className="font-medium">
                          {new Date(analysisResult.timestamp).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Keywords */}
              {analysisResult.contentAnalysis?.keywordDensity && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Từ khóa phổ biến</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(analysisResult.contentAnalysis.keywordDensity)
                        .slice(0, 8)
                        .map(([keyword, count]: [string, any], index: number) => (
                        <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-sm">{keyword}</div>
                          <div className="text-xs text-gray-600">{count} lần</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}