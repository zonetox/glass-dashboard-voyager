
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  BarChart3, 
  Search, 
  Sparkles, 
  Wrench,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  TrendingUp,
  Globe,
  Zap,
  Shield,
  Info
} from 'lucide-react';
import AutoFixStepper from '@/components/dashboard/AutoFixStepper';
import { Website, SEOIssue, mockSEOIssues } from '@/lib/types';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [autoFixOpen, setAutoFixOpen] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'overview';
    setActiveTab(tabFromUrl);
  }, [location.search]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard?tab=${tabId}`);
    }
  };

  // Mock data
  const mockWebsite: Website = {
    id: 'demo-1',
    url: 'https://example.com',
    name: 'Example Website',
    description: 'Demo website for SEO analysis',
    category: 'Business',
    lastScanDate: new Date().toISOString(),
    lastAnalyzed: new Date().toISOString(),
    seoScore: 75,
    pageSpeedScore: 85,
    mobileFriendlinessScore: 90,
    securityScore: 95,
    technologies: ['React', 'Tailwind CSS'],
    status: 'completed'
  };

  const seoMetrics = {
    overview: {
      totalScore: 75,
      totalIssues: 12,
      fixedIssues: 8,
      criticalIssues: 3,
      warningIssues: 6,
      goodItems: 18
    },
    technical: [
      { name: 'Meta Description', status: 'error', score: 45, description: 'Thiếu hoặc quá ngắn' },
      { name: 'Title Tags', status: 'warning', score: 78, description: 'Một số trang bị trùng lặp' },
      { name: 'Heading Structure', status: 'success', score: 95, description: 'Cấu trúc tốt' },
      { name: 'Alt Text', status: 'error', score: 35, description: '8 hình ảnh thiếu alt text' },
      { name: 'Schema Markup', status: 'warning', score: 65, description: 'Thiếu structured data' },
      { name: 'Page Speed', status: 'success', score: 85, description: 'Tốc độ tải nhanh' },
    ],
    fixableIssues: [
      { id: '1', title: 'Thiếu meta description', description: '5 trang thiếu meta description', canAutoFix: true },
      { id: '2', title: 'Alt text cho hình ảnh', description: '8 hình ảnh không có alt text', canAutoFix: true },
      { id: '3', title: 'Heading structure', description: '3 trang có h1 trùng lặp', canAutoFix: true },
      { id: '4', title: 'Internal linking', description: 'Thiếu liên kết nội bộ', canAutoFix: false },
      { id: '5', title: 'Schema markup', description: 'Thiếu structured data cho sản phẩm', canAutoFix: true },
    ]
  };

  const aiComparison = {
    traditional: {
      score: 65,
      eeat: 45,
      searchIntent: 60,
      contentGap: 'Thiếu 12 chủ đề chính'
    },
    ai: {
      score: 89,
      eeat: 85,
      searchIntent: 92,
      contentGap: 'Đầy đủ với 24 chủ đề mở rộng'
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleIssueToggle = (issueId: string) => {
    setSelectedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleAutoFix = () => {
    if (selectedIssues.length > 0) {
      setAutoFixOpen(true);
    }
  };

  const handleAutoFixComplete = (success: boolean) => {
    console.log('Auto fix completed:', success);
    setSelectedIssues([]);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">SEO Dashboard</h1>
            <p className="text-muted-foreground">Quản lý và tối ưu SEO cho website của bạn</p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Tổng quan</span>
              </TabsTrigger>
              <TabsTrigger value="analyzer" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Phân tích SEO</span>
              </TabsTrigger>
              <TabsTrigger value="ai-seo" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Intelligence</span>
              </TabsTrigger>
              <TabsTrigger value="auto-fix" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Auto Fix</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="mt-8">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{seoMetrics.overview.totalScore}/100</div>
                      <Progress value={seoMetrics.overview.totalScore} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tổng số lỗi</CardTitle>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{seoMetrics.overview.totalIssues}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {seoMetrics.overview.criticalIssues} nghiêm trọng
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Đã sửa</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{seoMetrics.overview.fixedIssues}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {seoMetrics.overview.goodItems} mục tốt
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Website</CardTitle>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium truncate">{mockWebsite.url}</div>
                      <Badge variant="outline" className="mt-2">
                        {mockWebsite.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Bắt đầu phân tích mới</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Button onClick={() => handleTabChange('analyzer')} size="lg">
                        <Play className="h-4 w-4 mr-2" />
                        Bắt đầu phân tích
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Quét toàn bộ website để phát hiện lỗi SEO mới nhất
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO Analyzer Tab */}
              <TabsContent value="analyzer" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chỉ số kỹ thuật SEO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {seoMetrics.technical.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(metric.status)}
                            <div>
                              <div className="font-medium">{metric.name}</div>
                              <div className="text-sm text-muted-foreground">{metric.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={metric.status === 'success' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                              {metric.score}/100
                            </Badge>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Điểm số dựa trên tiêu chuẩn SEO</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Intelligence Tab */}
              <TabsContent value="ai-seo" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>So sánh SEO thường vs AI SEO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-muted-foreground">SEO Thường</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Điểm tổng thể:</span>
                            <Badge variant="secondary">{aiComparison.traditional.score}/100</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>E-E-A-T Score:</span>
                            <Badge variant="secondary">{aiComparison.traditional.eeat}/100</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Search Intent:</span>
                            <Badge variant="secondary">{aiComparison.traditional.searchIntent}/100</Badge>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Content Gap:</span>
                            <p className="text-sm text-muted-foreground mt-1">{aiComparison.traditional.contentGap}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-primary">AI SEO</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Điểm tổng thể:</span>
                            <Badge>{aiComparison.ai.score}/100</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>E-E-A-T Score:</span>
                            <Badge>{aiComparison.ai.eeat}/100</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Search Intent:</span>
                            <Badge>{aiComparison.ai.searchIntent}/100</Badge>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Content Gap:</span>
                            <p className="text-sm text-muted-foreground mt-1">{aiComparison.ai.contentGap}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <Button>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Tạo gợi ý viết lại
                      </Button>
                      <Button variant="outline">
                        <Zap className="h-4 w-4 mr-2" />
                        Sinh Schema
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Auto Fix Tab */}
              <TabsContent value="auto-fix" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Lỗi có thể sửa tự động</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAutoFix}
                        disabled={selectedIssues.length === 0}
                        className="bg-primary"
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Fix tự động ({selectedIssues.length})
                      </Button>
                      <Button variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Khôi phục bản cũ
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {seoMetrics.fixableIssues.map((issue) => (
                        <div key={issue.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedIssues.includes(issue.id)}
                              onCheckedChange={() => handleIssueToggle(issue.id)}
                              disabled={!issue.canAutoFix}
                            />
                            <div>
                              <div className="font-medium">{issue.title}</div>
                              <div className="text-sm text-muted-foreground">{issue.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {issue.canAutoFix ? (
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Có thể fix
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Cần thủ công
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Auto Fix Stepper Modal */}
          <AutoFixStepper
            open={autoFixOpen}
            onClose={() => setAutoFixOpen(false)}
            websiteUrl={mockWebsite.url}
            onComplete={handleAutoFixComplete}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
