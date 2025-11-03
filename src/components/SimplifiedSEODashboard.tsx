import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  BarChart3, 
  FileText, 
  Brain, 
  Code, 
  ImageIcon, 
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  TrendingUp,
  Shield,
  Wrench,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [aiFixing, setAiFixing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'seo' | 'ai-fix' | 'content'>('seo');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const { user } = useAuth();

  const analyzeWebsite = async () => {
    if (!url.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập URL cần phân tích",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('live-website-analyzer', {
        body: { 
          url: url.trim(),
          user_id: user?.id 
        }
      });

      if (error) throw new Error(error.message);

      console.log('Analysis results:', data);
      setAnalysisResults(data);
      // Removed auto-scroll as requested

      toast({
        title: "Phân tích thành công",
        description: `Website đã được phân tích. Điểm SEO: ${data.seoScore}/100`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Lỗi phân tích",
        description: "Không thể phân tích website. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIFix = async () => {
    if (!analysisResults) return;
    
    setAiFixing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-rewriter', {
        body: {
          url: analysisResults.url,
          contentType: 'full',
          user_id: user?.id
        }
      });

      if (error) throw new Error(error.message);

      toast({
        title: "AI Fix hoàn tất",
        description: "Đã tạo gợi ý tối ưu cho website",
      });
    } catch (error) {
      console.error('AI fix error:', error);
      toast({
        title: "Lỗi AI Fix",
        description: "Không thể tạo gợi ý tối ưu",
        variant: "destructive",
      });
    } finally {
      setAiFixing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!analysisResults || !onGeneratePDF) return;
    onGeneratePDF();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* [1] Nhập URL + nút "Phân tích" */}
      <Card>
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
              disabled={loading}
            />
            <Button
              onClick={analyzeWebsite}
              disabled={!url.trim() || loading}
              className="px-8"
            >
              {loading ? (
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

      {/* [2] Category Selection */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setActiveCategory('seo')}
          className={`p-4 rounded-lg border transition-all ${
            activeCategory === 'seo' 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="h-6 w-6 mx-auto mb-2" />
          <h3 className="font-semibold">Phân tích SEO</h3>
          <p className="text-sm text-gray-600">Tổng quan, Hình ảnh, Nội dung, Kỹ thuật</p>
        </button>
        
        <button
          onClick={() => setActiveCategory('ai-fix')}
          className={`p-4 rounded-lg border transition-all ${
            activeCategory === 'ai-fix' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Wrench className="h-6 w-6 mx-auto mb-2" />
          <h3 className="font-semibold">Công cụ AI Fix</h3>
          <p className="text-sm text-gray-600">Rewrite, Fix ALT, Fix Heading, Fix Meta</p>
        </button>
        
        <button
          onClick={() => setActiveCategory('content')}
          className={`p-4 rounded-lg border transition-all ${
            activeCategory === 'content' 
              ? 'bg-purple-50 border-purple-200 text-purple-700' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <FileText className="h-6 w-6 mx-auto mb-2" />
          <h3 className="font-semibold">Tạo nội dung</h3>
          <p className="text-sm text-gray-600">Blog từ keyword, Schema AI, Landing Page AI</p>
        </button>
      </div>

      {/* [3] Content based on active category */}
      {analysisResults && activeCategory === 'seo' && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysisResults.seoScore || 0)}`}>
                      {analysisResults.seoScore || 0}
                    </div>
                    <div className="text-sm text-gray-600">/ 100</div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Điểm SEO Tổng Quan</h2>
                    <p className="text-gray-600">{analysisResults.url}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Hình ảnh
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Nội dung
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Kỹ thuật
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Điểm SEO Tổng Quan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${getScoreColor(analysisResults?.seoScore || 0)}`}>
                      {analysisResults?.seoScore || 0}/100
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            (analysisResults?.seoScore || 0) >= 80 ? 'bg-green-600' :
                            (analysisResults?.seoScore || 0) >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${analysisResults?.seoScore || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-semibold">
                        {analysisResults?.technicalIssues 
                          ? Math.max(0, 10 - analysisResults.technicalIssues.length) 
                          : 0}
                      </div>
                      <div className="text-gray-600">Tốt</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-600 font-semibold">
                        {analysisResults?.technicalIssues 
                          ? analysisResults.technicalIssues.filter((issue: string) => 
                              issue.includes('không đúng độ dài') || issue.includes('Có nhiều hơn')
                            ).length
                          : 0}
                      </div>
                      <div className="text-gray-600">Cảnh báo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-semibold">
                        {analysisResults?.technicalIssues 
                          ? analysisResults.technicalIssues.filter((issue: string) => 
                              issue.includes('Thiếu')
                            ).length
                          : 0}
                      </div>
                      <div className="text-gray-600">Nghiêm trọng</div>
                    </div>
                  </div>
                  
                  {/* Technical Issues List */}
                  {analysisResults?.technicalIssues && analysisResults.technicalIssues.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Vấn đề cần khắc phục
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {analysisResults.technicalIssues.map((issue: string, idx: number) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Nội dung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Số từ:</span>
                        <span className="font-semibold">{analysisResults?.contentAnalysis?.wordCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Thời gian đọc:</span>
                        <span className="font-semibold">{analysisResults?.contentAnalysis?.readingTime || 0} phút</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      Bảo mật
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {analysisResults?.url?.startsWith('https://') ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="text-lg font-bold text-green-600">HTTPS</div>
                            <p className="text-xs text-gray-600">Bảo mật tốt</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <div className="text-lg font-bold text-red-600">HTTP</div>
                            <p className="text-xs text-gray-600">Không bảo mật</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Phân tích hình ảnh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisResults?.images?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Tổng ảnh</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {analysisResults?.images?.filter((img: any) => !img.hasAlt).length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Thiếu ALT</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analysisResults?.images?.filter((img: any) => img.hasAlt).length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Có ALT</div>
                      </div>
                    </div>
                    
                    {/* Images List */}
                    {analysisResults?.images && analysisResults.images.length > 0 && (
                      <div className="mt-4 max-h-60 overflow-y-auto">
                        <h4 className="font-semibold mb-2">Danh sách hình ảnh:</h4>
                        <div className="space-y-2">
                          {analysisResults.images.map((img: any, idx: number) => (
                            <div key={idx} className="p-2 border rounded text-sm">
                              <div className="flex items-start gap-2">
                                {img.hasAlt ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-mono text-xs text-gray-600 truncate">
                                    {img.src}
                                  </div>
                                  {img.hasAlt ? (
                                    <div className="text-green-700 mt-1">ALT: {img.alt}</div>
                                  ) : (
                                    <div className="text-red-700 mt-1">⚠ Thiếu alt text</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Phân tích nội dung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Content Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">Số từ</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisResults?.contentAnalysis?.wordCount || 0}
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600">Thời gian đọc</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisResults?.contentAnalysis?.readingTime || 0} phút
                        </div>
                      </div>
                    </div>

                    {/* Headings Structure */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Cấu trúc Heading</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">H1:</span>
                          <Badge variant={analysisResults?.headings?.h1?.length === 1 ? "default" : "destructive"}>
                            {analysisResults?.headings?.h1?.length || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">H2:</span>
                          <Badge variant="secondary">
                            {analysisResults?.headings?.h2?.length || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">H3:</span>
                          <Badge variant="secondary">
                            {analysisResults?.headings?.h3?.length || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Top Keywords */}
                    {analysisResults?.contentAnalysis?.keywordDensity && (
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">Từ khóa phổ biến</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(analysisResults.contentAnalysis.keywordDensity)
                            .slice(0, 10)
                            .map(([keyword, count]: [string, any]) => (
                              <Badge key={keyword} variant="outline">
                                {keyword} ({count})
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Content Suggestions */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Gợi ý cải thiện</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {(analysisResults?.contentAnalysis?.wordCount || 0) < 1500 && (
                          <li>• Tăng độ dài nội dung lên tối thiểu 1500 từ</li>
                        )}
                        {(analysisResults?.headings?.h1?.length || 0) !== 1 && (
                          <li>• Đảm bảo chỉ có 1 thẻ H1 duy nhất</li>
                        )}
                        {(analysisResults?.headings?.h2?.length || 0) < 3 && (
                          <li>• Thêm nhiều thẻ H2 để cải thiện cấu trúc nội dung</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Phân tích kỹ thuật
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* HTTPS Check */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>HTTPS</span>
                        {analysisResults?.url?.startsWith('https://') ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>

                      {/* Title Check */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Title Tag</span>
                        {analysisResults?.title ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>

                      {/* Meta Description Check */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Meta Description</span>
                        {analysisResults?.metaDescription ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>

                      {/* Schema Check */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Schema Markup</span>
                        {analysisResults?.existingSchema ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>

                    {/* Meta Tags Details */}
                    <div className="space-y-3">
                      {analysisResults?.title && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Title:</div>
                          <div className="text-sm font-medium">{analysisResults.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Độ dài: {analysisResults.title.length} ký tự
                            {analysisResults.title.length < 30 || analysisResults.title.length > 60 ? (
                              <span className="text-yellow-600 ml-2">⚠ Nên từ 30-60 ký tự</span>
                            ) : (
                              <span className="text-green-600 ml-2">✓ Độ dài tốt</span>
                            )}
                          </div>
                        </div>
                      )}

                      {analysisResults?.metaDescription && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Meta Description:</div>
                          <div className="text-sm">{analysisResults.metaDescription}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Độ dài: {analysisResults.metaDescription.length} ký tự
                            {analysisResults.metaDescription.length < 120 || analysisResults.metaDescription.length > 160 ? (
                              <span className="text-yellow-600 ml-2">⚠ Nên từ 120-160 ký tự</span>
                            ) : (
                              <span className="text-green-600 ml-2">✓ Độ dài tốt</span>
                            )}
                          </div>
                        </div>
                      )}

                      {analysisResults?.existingSchema && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm text-green-800 font-medium mb-1">
                            ✓ Đã có Schema Markup
                          </div>
                          <div className="text-xs text-green-700">
                            Website đã implement structured data
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* AI Fix Tools Category */}
      {activeCategory === 'ai-fix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Content Rewrite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Viết lại nội dung tự động với AI</p>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Bắt đầu rewrite
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Fix ALT Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Tự động tạo ALT text cho hình ảnh</p>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Fix ALT tags
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Fix Heading Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Tối ưu cấu trúc heading H1-H6</p>
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  Fix Headings
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Fix Meta Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Tối ưu title và meta description</p>
                <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                  Fix Meta
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Content Creator Category */}
      {activeCategory === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Blog từ Keyword
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Tạo bài blog hoàn chỉnh từ keyword</p>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Nhập keyword chính..." 
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Tạo blog AI
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Schema AI Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Tạo schema markup tự động</p>
                <div className="space-y-3">
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Organization Schema</option>
                    <option>Article Schema</option>
                    <option>Product Schema</option>
                    <option>FAQ Schema</option>
                  </select>
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                    Tạo Schema
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Landing Page AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Tạo nội dung landing page chuyển đổi cao</p>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Mô tả sản phẩm/dịch vụ..." 
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Tạo Landing Page
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* [4] Action nhanh - chỉ hiện khi có kết quả phân tích */}
      {analysisResults && (
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={handleAIFix}
            disabled={aiFixing}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            {aiFixing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang sửa...
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4" />
                Fix ngay
              </>
            )}
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            {generatingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Tải báo cáo
              </>
            )}
          </button>

          <button
            onClick={() => toast({
              title: "Thông báo",
              description: "Tính năng đang phát triển",
            })}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Gửi yêu cầu
          </button>
        </div>
      )}
    </div>
  );
}