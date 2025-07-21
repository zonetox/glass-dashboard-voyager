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
import { SimplifiedDashboard } from '@/components/SimplifiedDashboard';
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
  Calendar,
  Settings2
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
  const [useSimplifiedView, setUseSimplifiedView] = useState(true);
  
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
          const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
          
          if (diffMinutes < 5 && !profile.last_login_at) {
            setIsNewUser(true);
            setTimeout(() => {
              setShowOnboarding(true);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  // Website analysis
  const handleAnalyze = async (url: string) => {
    if (!url || !user) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ website và đảm bảo bạn đã đăng nhập",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    setSelectedWebsite(url);
    
    try {
      console.log('Starting analysis for:', url);
      
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      console.log('Analysis result:', data);
      setAnalysisResult(data);
      notifications.showSEOAnalysisComplete(url, data?.seo_score);
      
      // Store in database
      const { error: insertError } = await supabase
        .from('scans')
        .insert({
          url: url,
          user_id: user.id,
          seo: data
        });

      if (insertError) {
        console.error('Error storing scan:', insertError);
      }

    } catch (error) {
      console.error('Error analyzing website:', error);
      notifications.showError('Lỗi phân tích', 'Không thể phân tích website. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // PDF generation
  const handleGeneratePDF = async () => {
    if (!analysisResult || !user || !selectedWebsite) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thực hiện phân tích website trước khi tạo báo cáo PDF",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      console.log('Generating PDF for:', selectedWebsite);
      
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: {
          url: selectedWebsite,
          user_id: user.id,
          include_ai: true
        }
      });

      if (error) {
        console.error('PDF generation error:', error);
        throw error;
      }

      console.log('PDF generated:', data);
      
      if (data?.file_url) {
        // Open PDF in new tab
        window.open(data.file_url, '_blank');
        notifications.showPDFGenerationComplete(data.file_url);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      notifications.showError('Lỗi tạo PDF', 'Không thể tạo báo cáo PDF. Vui lòng thử lại.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleOnboardingEnd = () => {
    setShowOnboarding(false);
    if (user) {
      // Just mark onboarding as complete locally
      console.log('Onboarding completed for user:', user.id);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* View Toggle */}
        <div className="flex justify-end p-4">
          <Button
            variant={useSimplifiedView ? "default" : "outline"}
            onClick={() => setUseSimplifiedView(!useSimplifiedView)}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            {useSimplifiedView ? "Chế độ nâng cao" : "Chế độ đơn giản"}
          </Button>
        </div>

        {useSimplifiedView ? (
          <SimplifiedDashboard 
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            analysisResult={analysisResult}
            onGeneratePDF={handleGeneratePDF}
            isGeneratingPDF={isGeneratingPDF}
          />
        ) : (
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">SEO Dashboard</h1>
              <p className="text-muted-foreground">
                Quản lý và tối ưu hóa SEO cho website của bạn
              </p>
            </div>

            {/* Quick Domain Input */}
            <div className="mb-6">
              <QuickDomainInput 
                onAnalyze={handleAnalyze}
                size="lg"
              />
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-11">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value="analyzer" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  SEO Analyzer
                </TabsTrigger>
                <TabsTrigger value="ai-intelligence" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Intelligence
                </TabsTrigger>
                <TabsTrigger value="auto-fix" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Auto Fix
                </TabsTrigger>
                <TabsTrigger value="one-click" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  One-Click SEO
                </TabsTrigger>
                <TabsTrigger value="keywords" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Keywords
                </TabsTrigger>
                <TabsTrigger value="ai-search" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Search
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <PenLine className="h-4 w-4" />
                  Content Studio
                </TabsTrigger>
                <TabsTrigger value="content-planner" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Content Planner
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="predictive" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  Predictive SEO
                </TabsTrigger>
                <TabsTrigger value="api-health" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  API Status
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analysisResult?.seo_score || 0}/100</div>
                      <Progress value={analysisResult?.seo_score || 0} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tổng số lỗi</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analysisResult?.issues?.length || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Đã sửa</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Nghiêm trọng</CardTitle>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analysisResult?.critical_issues || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analysis Results */}
                {analysisResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Kết quả phân tích SEO</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Website: {selectedWebsite}</span>
                          <Badge variant={analysisResult.seo_score >= 80 ? "default" : "destructive"}>
                            {analysisResult.seo_score}/100
                          </Badge>
                        </div>
                        
                        {analysisResult.issues && analysisResult.issues.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Vấn đề cần khắc phục:</h4>
                            <ul className="space-y-1">
                              {analysisResult.issues.slice(0, 5).map((issue: any, index: number) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  {issue.message || issue.description || 'Vấn đề SEO'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF}>
                            {isGeneratingPDF ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Đang tạo PDF...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                Tạo báo cáo PDF
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* AI Intelligence Tab */}
              <TabsContent value="ai-intelligence" className="space-y-6">
                <AIIntelligence />
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

              {/* API Health Tab */}
              <TabsContent value="api-health" className="space-y-6">
                <APIHealthPanel />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <OnboardingTour 
          runTour={showOnboarding}
          onTourEnd={handleOnboardingEnd}
        />
      </div>
    </TooltipProvider>
  );
}