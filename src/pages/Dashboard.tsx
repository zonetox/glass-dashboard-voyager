
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
  Info,
  FileText
} from 'lucide-react';
import EnhancedAutoFixStepper from '@/components/dashboard/EnhancedAutoFixStepper';
import { OneClickFix } from '@/components/dashboard/OneClickFix';
import AIIntelligence from '@/components/dashboard/AIIntelligence';
import { ReportViewer } from '@/components/dashboard/ReportViewer';
import { AccountPage } from '@/pages/AccountPage';
import { APIHealthPanel } from '@/components/dashboard/api-health-panel';
import { QuickDomainInput } from '@/components/QuickDomainInput';
import { Website, SEOIssue, mockSEOIssues } from '@/lib/types';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [autoFixOpen, setAutoFixOpen] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [oneClickFixOpen, setOneClickFixOpen] = useState(false);

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
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-flex">
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
              <TabsTrigger value="one-click" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Tối ưu 1 lần</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Báo cáo PDF</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Tài khoản</span>
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
                <AIIntelligence />
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

              {/* One-Click SEO Tab */}
              <TabsContent value="one-click" className="space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Hero Section */}
                  <Card className="text-center">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl">Tối ưu SEO một lần</CardTitle>
                      <p className="text-muted-foreground">
                        Hệ thống sẽ tự động phân tích, đề xuất, viết lại và tối ưu mọi lỗi SEO hiện tại bằng AI Semantic
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="lg"
                            className="h-16 text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                            onClick={() => setOneClickFixOpen(true)}
                          >
                            <Wrench className="h-6 w-6 mr-3" />
                            🔧 Tối ưu toàn bộ bằng AI
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Hệ thống sẽ tự động phân tích, đề xuất, viết lại và tối ưu mọi lỗi SEO hiện tại bằng AI Semantic</p>
                        </TooltipContent>
                      </Tooltip>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>✅ Phân tích semantic và search intent</p>
                        <p>✅ Tối ưu meta title, description, headings</p>
                        <p>✅ Viết lại nội dung theo AI suggestions</p>
                        <p>✅ Tự động backup trước khi thay đổi</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Optimization History */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Lịch sử tối ưu</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Xem lại các lần tối ưu trước đây và khôi phục nếu cần
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Sample history items */}
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">Tối ưu hoàn tất - 15/01/2024</div>
                              <div className="text-sm text-muted-foreground">
                                Sửa 8 lỗi • SEO Score: 65 → 89 • Meta tags, Alt text, H1 structure
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Xem chi tiết
                            </Button>
                            <Button variant="outline" size="sm">
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Khôi phục
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">Tối ưu hoàn tất - 10/01/2024</div>
                              <div className="text-sm text-muted-foreground">
                                Sửa 12 lỗi • SEO Score: 45 → 78 • Schema markup, Internal links
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Xem chi tiết
                            </Button>
                            <Button variant="outline" size="sm">
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Khôi phục
                            </Button>
                          </div>
                        </div>

                        <div className="text-center py-8 text-muted-foreground">
                          <p>Chưa có lịch sử tối ưu nào khác</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* PDF Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <ReportViewer />
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6">
                <AccountPage />
              </TabsContent>

              {/* API Logs Tab */}
              <TabsContent value="api-logs" className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-foreground">API & Lỗi hệ thống</h2>
                    <QuickDomainInput 
                      size="sm" 
                      placeholder="Test domain"
                      onAnalyze={(url) => console.log('Testing:', url)}
                    />
                  </div>
                  <APIHealthPanel />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Auto Fix Modal */}
        <EnhancedAutoFixStepper
          open={autoFixOpen}
          onClose={() => setAutoFixOpen(false)}
          websiteUrl={mockWebsite.url}
          aiAnalysis={mockWebsite}
          onComplete={handleAutoFixComplete}
        />

        {/* One-Click Fix Modal */}
        {oneClickFixOpen && (
          <OneClickFix
            url={mockWebsite.url}
            onBackupCreated={() => {
              console.log('Backup created');
              setOneClickFixOpen(false);
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
