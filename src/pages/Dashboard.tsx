import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { OnboardingTour } from '@/components/OnboardingTour';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import StatusIndicator from '@/components/ui/status-indicator';
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
  FileText,
  Loader2,
  Hash,
  Bot,
  PenLine,
  LineChart,
  Calendar
} from 'lucide-react';
import EnhancedAutoFixStepper from '@/components/dashboard/EnhancedAutoFixStepper';
import { OneClickFix } from '@/components/dashboard/OneClickFix';
import AIIntelligence from '@/components/dashboard/AIIntelligence';
import { ReportViewer } from '@/components/dashboard/ReportViewer';
import { AccountPage } from '@/pages/AccountPage';
import { APIHealthPanel } from '@/components/dashboard/api-health-panel';
import { AISEOAnalysis } from '@/components/dashboard/AISEOAnalysis';
import { AIContentStudio } from '@/components/dashboard/AIContentStudio';
import { ContentPlanner } from '@/components/dashboard/ContentPlanner';
import { PredictiveDashboard } from '@/components/dashboard/PredictiveDashboard';
import { QuickDomainInput } from '@/components/QuickDomainInput';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Website, SEOIssue } from '@/lib/types';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [autoFixOpen, setAutoFixOpen] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [oneClickFixOpen, setOneClickFixOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');
  
  const { toast } = useToast();
  const notifications = useNotifications();

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'overview';
    setActiveTab(tabFromUrl);
  }, [location.search]);

  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('last_login_at, created_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
          return;
        }

        // Check if this is a new user (created within last 5 minutes and no previous login)
        if (profile) {
          const createdAt = new Date(profile.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - createdAt.getTime();
          const minutesDiff = timeDiff / (1000 * 60);

          const isRecentSignup = minutesDiff < 5;
          const hasNeverLoggedIn = !profile.last_login_at;

          if (isRecentSignup && hasNeverLoggedIn) {
            setIsNewUser(true);
            // Small delay to ensure page is rendered
            setTimeout(() => {
              setShowOnboarding(true);
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard?tab=${tabId}`);
    }
  };

  const handleOnboardingEnd = () => {
    setShowOnboarding(false);
  };

  const restartOnboarding = () => {
    setShowOnboarding(true);
  };

  // Get real website data from latest scan
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  
  useEffect(() => {
    const loadLatestScan = async () => {
      const { data: latestScan } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestScan) {
        const seoData = latestScan.seo as any;
        setCurrentWebsite({
          id: latestScan.id,
          url: latestScan.url,
          name: new URL(latestScan.url).hostname,
          description: `SEO analysis for ${latestScan.url}`,
          category: 'Website',
          lastScanDate: latestScan.created_at,
          lastAnalyzed: latestScan.created_at,
          seoScore: seoData?.score || 0,
          pageSpeedScore: seoData?.pageSpeed || 0,
          mobileFriendlinessScore: seoData?.mobile || 0,
          securityScore: seoData?.security || 0,
          technologies: seoData?.technologies || [],
          status: 'completed',
          content: seoData?.content || ''
        });
      }
    };
    
    if (user?.id) {
      loadLatestScan();
    }
  }, [user?.id]);

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

  const handleAutoFixComplete = (result: any) => {
    setAutoFixOpen(false);
    setIsProcessingAI(false);
    setSelectedIssues([]);
    
    if (result?.success) {
      const changesCount = result.changes?.length || 0;
      notifications.showAIFixComplete(changesCount);
    }
  };

  const handleAnalyze = async () => {
    const targetUrl = selectedWebsite || currentWebsite?.url || 'https://example.com';
    if (!targetUrl) return;
    
    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        notifications.showError("Authentication required", "Please sign in to analyze websites");
        return;
      }

      const response = await supabase.functions.invoke('analyze-website', {
        body: { url: targetUrl }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setAnalysisResult(response.data);
      notifications.showSEOAnalysisComplete(targetUrl, response.data?.seo_score);
    } catch (error) {
      console.error('Analysis failed:', error);
      notifications.showError("Analysis Failed", error instanceof Error ? error.message : "Failed to analyze website");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!analysisResult) return;
    
    const targetUrl = selectedWebsite || currentWebsite?.url || 'https://example.com';
    setIsGeneratingPDF(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        notifications.showError("Authentication required", "Please sign in to generate PDF reports");
        return;
      }

      const response = await supabase.functions.invoke('generate-pdf-report', {
        body: { 
          url: targetUrl,
          analysisData: analysisResult,
          includeAI: true
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      notifications.showPDFGenerationComplete(response.data?.downloadUrl);
    } catch (error) {
      console.error('PDF generation failed:', error);
      notifications.showError("PDF Generation Failed", error instanceof Error ? error.message : "Failed to generate PDF report");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">SEO Dashboard</h1>
            <p className="text-muted-foreground">Quản lý và tối ưu SEO cho website của bạn</p>
            {isNewUser && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-md mt-4">
                <p className="text-blue-300 text-sm">
                  🎉 Chào mừng bạn đến với SEO AI Tool! 
                  Hướng dẫn sẽ bắt đầu trong giây lát...
                </p>
              </div>
            )}
          </div>

          {/* Quick Domain Input */}
          <div className="mb-6">
            <QuickDomainInput 
              onAnalyze={(url) => {
                setSelectedWebsite(url);
                handleAnalyze();
              }}
              size="lg"
            />
          </div>

          {/* Quick Actions Panel */}
          <div className="mb-8">
            <QuickActions
              currentDomain={selectedWebsite || currentWebsite?.url || 'https://example.com'}
              seoScore={seoMetrics.overview.totalScore}
              totalIssues={seoMetrics.overview.totalIssues}
              criticalIssues={seoMetrics.overview.criticalIssues}
              fixedIssues={seoMetrics.overview.fixedIssues}
              onQuickScan={handleAnalyze}
              onGeneratePDF={handleGeneratePDF}
              onQuickOptimize={() => {
                setAutoFixOpen(true);
                setIsProcessingAI(true);
              }}
              isAnalyzing={isAnalyzing}
              isGeneratingPDF={isGeneratingPDF}
              isOptimizing={isProcessingAI}
            />
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-12 lg:w-auto lg:inline-flex">{/* Changed from grid-cols-11 to grid-cols-12 */}
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Tổng quan</span>
              </TabsTrigger>
              <TabsTrigger value="analyzer" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Phân tích SEO</span>
              </TabsTrigger>
              <TabsTrigger value="ai-seo" className="flex items-center gap-2 seo-comparison">
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
              <TabsTrigger value="keywords" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span className="hidden sm:inline">AI Keywords</span>
              </TabsTrigger>
              <TabsTrigger value="ai-search" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">SEO for AI Search</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                <span className="hidden sm:inline">AI Content Studio</span>
              </TabsTrigger>
              <TabsTrigger value="content-planner" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Kế hoạch nội dung</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 pdf-report-button">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Báo cáo PDF</span>
              </TabsTrigger>
              <TabsTrigger value="predictive" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span className="hidden sm:inline">Predictive SEO</span>
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
                      <div className="text-sm font-medium truncate">{selectedWebsite || currentWebsite?.url || 'Chưa có website'}</div>
                      <Badge variant="outline" className="mt-2">
                        {currentWebsite?.status || 'Pending'}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Bắt đầu phân tích mới</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <Button 
                          onClick={handleAnalyze} 
                          disabled={isAnalyzing}
                          size="lg" 
                          className="analyze-button"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Bắt đầu phân tích
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Quét toàn bộ website để phát hiện lỗi SEO mới nhất
                        </p>
                      </div>
                      
                      {isAnalyzing && (
                        <StatusIndicator 
                          status="loading" 
                          message="Analyzing website SEO..." 
                          size="sm"
                        />
                      )}

                      {analysisResult && (
                        <div className="flex gap-3">
                          <Button
                            onClick={handleGeneratePDF}
                            disabled={isGeneratingPDF}
                            variant="outline"
                            className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                          >
                            {isGeneratingPDF ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating PDF...
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" />
                                Generate PDF Report
                              </>
                            )}
                          </Button>
                          
                          {isGeneratingPDF && (
                            <StatusIndicator 
                              status="loading" 
                              message="Generating PDF report..." 
                              size="sm"
                            />
                          )}
                        </div>
                      )}
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
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            handleAutoFix();
                            setIsProcessingAI(true);
                          }}
                          disabled={selectedIssues.length === 0 || isProcessingAI}
                          className="bg-primary ai-optimize-button"
                        >
                          {isProcessingAI ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Wrench className="h-4 w-4 mr-2" />
                              Fix tự động ({selectedIssues.length})
                            </>
                          )}
                        </Button>
                        <Button variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Khôi phục bản cũ
                        </Button>
                      </div>
                      
                      {isProcessingAI && (
                        <StatusIndicator 
                          status="loading" 
                          message="AI is processing optimizations..." 
                          size="sm"
                        />
                      )}
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
                            className="h-16 text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 ai-optimize-button"
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

                  <OneClickFix
                    url={currentWebsite?.url || 'https://example.com'}
                    content={currentWebsite?.content || ''}
                    onBackupCreated={() => {
                      notifications.showBackupCreated(currentWebsite?.url || 'website');
                    }}
                  />
                </div>
              </TabsContent>

              {/* Keywords Tab */}
              <TabsContent value="keywords" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5 text-purple-500" />
                        AI Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm">
                        Phân tích từ khóa thông minh với AI
                      </p>
                      <Button
                        onClick={() => navigate('/ai-keywords')}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        <Hash className="h-4 w-4 mr-2" />
                        AI Keywords
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        So sánh đối thủ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm">
                        Phân tích đối thủ cạnh tranh
                      </p>
                      <Button
                        onClick={() => navigate('/competitor-analysis')}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        So sánh
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        Dự báo trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm">
                        AI dự đoán xu hướng content
                      </p>
                      <Button
                        onClick={() => navigate('/content-trends')}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Trends
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-orange-500" />
                        Local Business
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm">
                        Tối ưu doanh nghiệp địa phương
                      </p>
                      <Button
                        onClick={() => navigate('/local-business')}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Local SEO
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Search Tab */}
              <TabsContent value="ai-search" className="space-y-6">
                <AISEOAnalysis />
              </TabsContent>

              {/* AI Content Studio Tab */}
              <TabsContent value="content" className="space-y-6">
                <AIContentStudio />
              </TabsContent>

              {/* Content Planner Tab */}
              <TabsContent value="content-planner" className="space-y-6">
                <ContentPlanner />
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <ReportViewer />
              </TabsContent>

              {/* Predictive SEO Tab */}
              <TabsContent value="predictive" className="space-y-6">
                <PredictiveDashboard />
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6">
                <AccountPage />
              </TabsContent>
            </div>
          </Tabs>

          {/* Auto Fix Dialog */}
          <EnhancedAutoFixStepper
            open={autoFixOpen}
            onClose={() => setAutoFixOpen(false)}
            websiteUrl={currentWebsite?.url || 'https://example.com'}
            aiAnalysis={analysisResult}
            onComplete={handleAutoFixComplete}
          />
        </div>
      </div>
      
      <OnboardingTour 
        runTour={showOnboarding}
        onTourEnd={handleOnboardingEnd}
      />
    </TooltipProvider>
  );
}