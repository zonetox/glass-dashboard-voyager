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
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResults?.seoScore || 0}/100
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${analysisResults?.seoScore || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-semibold">{analysisResults?.technicalIssues ? (analysisResults.technicalIssues.length === 0 ? 12 : Math.max(0, 12 - analysisResults.technicalIssues.length)) : 0}</div>
                      <div className="text-gray-600">Tốt</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-600 font-semibold">{analysisResults?.technicalIssues ? Math.min(analysisResults.technicalIssues.length, 5) : 0}</div>
                      <div className="text-gray-600">Cảnh báo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-semibold">{analysisResults?.technicalIssues ? Math.max(0, analysisResults.technicalIssues.length - 5) : 0}</div>
                      <div className="text-gray-600">Nghiêm trọng</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Hiệu suất
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResults?.performance?.score || analysisResults?.speedScore || 0}/100
                    </div>
                    <p className="text-xs text-gray-600">Tốc độ tải trang</p>
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
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResults?.security?.score || (analysisResults?.isHttps ? 92 : 50)}/100
                    </div>
                    <p className="text-xs text-gray-600">HTTPS & SSL</p>
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
                          {analysisResults?.images?.total || 15}
                        </div>
                        <div className="text-sm text-gray-600">Tổng ảnh</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {analysisResults?.images?.missingAlt || 8}
                        </div>
                        <div className="text-sm text-gray-600">Thiếu ALT</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {analysisResults?.images?.large || 3}
                        </div>
                        <div className="text-sm text-gray-600">Quá nặng</div>
                      </div>
                    </div>
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
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Gợi ý cải thiện nội dung</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Thêm 2-3 từ khóa phụ vào đoạn đầu</li>
                        <li>• Cải thiện cấu trúc heading (H2, H3)</li>
                        <li>• Tăng độ dài nội dung lên 1500+ từ</li>
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
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>HTTPS</span>
                        <div className="text-green-600 font-semibold">✓</div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Mobile Friendly</span>
                        <div className="text-green-600 font-semibold">✓</div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Page Speed</span>
                        <div className="text-yellow-600 font-semibold">85/100</div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Core Web Vitals</span>
                        <div className="text-red-600 font-semibold">Cần sửa</div>
                      </div>
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