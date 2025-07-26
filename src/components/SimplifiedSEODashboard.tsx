
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  analysisResult: any;
  onGeneratePDF: () => void;
  isGeneratingPDF: boolean;
}

export function SimplifiedSEODashboard({ 
  onAnalyze, 
  isAnalyzing, 
  analysisResult, 
  onGeneratePDF, 
  isGeneratingPDF 
}: SimplifiedSEODashboardProps) {
  const [url, setUrl] = useState('');

  const handleAnalyze = () => {
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* [1] URL Input Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-6 w-6 text-blue-600" />
              Phân Tích SEO Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 max-w-2xl">
              <Input
                placeholder="Nhập URL website (ví dụ: example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isAnalyzing}
              />
              <Button
                onClick={handleAnalyze}
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
                    <div className={`p-4 rounded-lg ${getScoreColor(analysisResult.seo_score || 0)}`}>
                      <div className="text-3xl font-bold">{analysisResult.seo_score || 0}</div>
                      <div className="text-sm">/ 100</div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Điểm SEO tổng thể</h2>
                      <p className="text-gray-600">{url}</p>
                    </div>
                  </div>
                  
                  {/* [3] Action Buttons */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                      <Zap className="h-4 w-4" />
                      Fix ngay
                    </Button>
                    <Button 
                      onClick={onGeneratePDF} 
                      disabled={isGeneratingPDF}
                      variant="outline" 
                      className="gap-2"
                    >
                      {isGeneratingPDF ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Tải báo cáo
                    </Button>
                    <Button className="gap-2 bg-green-600 hover:bg-green-700">
                      <Send className="h-4 w-4" />
                      Yêu cầu tối ưu
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm rounded-lg p-2">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value="onpage" className="gap-2">
                  <Eye className="h-4 w-4" />
                  SEO Onpage
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-2">
                  <Bot className="h-4 w-4" />
                  Content AI
                </TabsTrigger>
                <TabsTrigger value="schema" className="gap-2">
                  <Code2 className="h-4 w-4" />
                  Schema
                </TabsTrigger>
                <TabsTrigger value="images" className="gap-2">
                  <Image className="h-4 w-4" />
                  Hình ảnh
                </TabsTrigger>
                <TabsTrigger value="technical" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Kỹ thuật
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ScoreCard
                    title="SEO Score"
                    score={analysisResult.seo_score || 0}
                    icon={BarChart3}
                    description="Điểm SEO tổng thể"
                  />
                  <ScoreCard
                    title="Lỗi nghiêm trọng"
                    score={analysisResult.critical_issues || 0}
                    icon={XCircle}
                    description="Cần sửa ngay lập tức"
                    isCount
                  />
                  <ScoreCard
                    title="Cảnh báo"
                    score={analysisResult.warnings || 0}
                    icon={AlertTriangle}
                    description="Cần cải thiện"
                    isCount
                  />
                  <ScoreCard
                    title="Đã tối ưu"
                    score={analysisResult.good_items || 0}
                    icon={CheckCircle}
                    description="Đang hoạt động tốt"
                    isCount
                  />
                </div>

                {/* Issues List */}
                {analysisResult.issues && analysisResult.issues.length > 0 && (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        Vấn đề cần khắc phục ({analysisResult.issues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResult.issues.slice(0, 5).map((issue: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="p-1 bg-red-100 rounded">
                              <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {issue.message || issue.title || 'Vấn đề SEO'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {issue.description || 'Cần khắc phục để cải thiện SEO'}
                              </p>
                            </div>
                            <Badge className={getScoreBadge(issue.priority === 'high' ? 20 : 60)}>
                              {issue.priority === 'high' ? 'Cao' : 'Trung bình'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* SEO Onpage Tab */}
              <TabsContent value="onpage" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MetaTagsCard analysisResult={analysisResult} />
                  <HeadingsCard analysisResult={analysisResult} />
                </div>
              </TabsContent>

              {/* Content AI Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-600" />
                      AI Content Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Phân tích nội dung bằng AI đang được phát triển...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schema Tab */}
              <TabsContent value="schema" className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-indigo-600" />
                      Schema Markup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Phân tích Schema Markup...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-green-600" />
                      Tối ưu hình ảnh
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Phân tích tối ưu hình ảnh...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Technical Tab */}
              <TabsContent value="technical" className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-600" />
                      Kỹ thuật
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Phân tích kỹ thuật...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

// Score Card Component
function ScoreCard({ 
  title, 
  score, 
  icon: Icon, 
  description, 
  isCount = false 
}: { 
  title: string; 
  score: number; 
  icon: any; 
  description: string; 
  isCount?: boolean;
}) {
  const getScoreColor = (score: number) => {
    if (isCount) {
      if (score === 0) return 'text-green-600 bg-green-50 border-green-200';
      if (score <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Card className={`shadow-sm border-2 ${getScoreColor(score)}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-6 w-6" />
          <div className="text-2xl font-bold">{score}{!isCount && '/100'}</div>
        </div>
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm opacity-80">{description}</p>
        </div>
        {!isCount && (
          <Progress value={score} className="mt-3 h-2" />
        )}
      </CardContent>
    </Card>
  );
}

// Meta Tags Card
function MetaTagsCard({ analysisResult }: { analysisResult: any }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Meta Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Title Tag</span>
            <Badge className="bg-green-100 text-green-800">Tốt</Badge>
          </div>
          <p className="text-sm text-gray-600">Độ dài và nội dung phù hợp</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Meta Description</span>
            <Badge className="bg-yellow-100 text-yellow-800">Cần cải thiện</Badge>
          </div>
          <p className="text-sm text-gray-600">Nên bổ sung call-to-action</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Headings Card
function HeadingsCard({ analysisResult }: { analysisResult: any }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Cấu trúc Heading
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">1</div>
            <div className="text-xs text-gray-600">H1</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">3</div>
            <div className="text-xs text-gray-600">H2</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">5</div>
            <div className="text-xs text-gray-600">H3</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-600">2</div>
            <div className="text-xs text-gray-600">H4+</div>
          </div>
        </div>
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Cấu trúc</span>
            <Badge className="bg-green-100 text-green-800">85/100</Badge>
          </div>
          <Progress value={85} className="mt-2 h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
