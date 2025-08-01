import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Globe, 
  Search, 
  FileText, 
  Zap, 
  ArrowRight,
  Target,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: () => void;
}

interface ComprehensiveOnboardingProps {
  onComplete: () => void;
}

export function ComprehensiveOnboarding({ onComplete }: ComprehensiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập URL website",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url: websiteUrl.trim() }
      });

      if (error) throw error;

      setAnalysisResult(data);
      markStepComplete('analyze');
      setCurrentStep(2);

      toast({
        title: "Phân tích hoàn tất",
        description: `Website đã được phân tích. Điểm SEO: ${data.seo_score}/100`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Lỗi phân tích",
        description: "Không thể phân tích website. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!analysisResult || !user) return;

    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: {
          url: websiteUrl,
          user_id: user.id,
          include_ai: true
        }
      });

      if (error) throw error;

      if (data?.file_url) {
        window.open(data.file_url, '_blank');
        markStepComplete('report');
        setCurrentStep(3);
        
        toast({
          title: "Báo cáo đã tạo",
          description: "Báo cáo PDF đã được tạo và mở trong tab mới",
        });
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Lỗi tạo báo cáo",
        description: "Không thể tạo báo cáo PDF",
        variant: "destructive"
      });
    }
  };

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Chào mừng đến với SEO Auto Tool',
      description: 'Bắt đầu hành trình tối ưu SEO tự động cho website của bạn',
      icon: <Sparkles className="h-6 w-6" />,
      completed: false,
      action: () => setCurrentStep(1)
    },
    {
      id: 'analyze',
      title: 'Phân tích website đầu tiên',
      description: 'Nhập URL website để bắt đầu phân tích SEO toàn diện',
      icon: <Search className="h-6 w-6" />,
      completed: false,
      action: handleAnalyzeWebsite
    },
    {
      id: 'report',
      title: 'Tạo báo cáo PDF',
      description: 'Tạo báo cáo chuyên nghiệp từ kết quả phân tích',
      icon: <FileText className="h-6 w-6" />,
      completed: false,
      action: handleGeneratePDF
    },
    {
      id: 'complete',
      title: 'Hoàn tất setup',
      description: 'Bạn đã sẵn sàng sử dụng đầy đủ các tính năng SEO Auto Tool',
      icon: <CheckCircle className="h-6 w-6" />,
      completed: false,
      action: onComplete
    }
  ]);

  const markStepComplete = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Setup SEO Auto Tool</h1>
            <Badge>{currentStep + 1}/{steps.length}</Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedSteps}/{steps.length} bước hoàn thành
          </p>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {currentStepData.icon}
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{currentStepData.description}</p>

          {/* Step-specific content */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Search className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Phân tích tự động</h3>
                  <p className="text-sm text-muted-foreground">AI phân tích website toàn diện</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold">Tối ưu tức thì</h3>
                  <p className="text-sm text-muted-foreground">Sửa lỗi SEO chỉ trong vài click</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Báo cáo chuyên nghiệp</h3>
                  <p className="text-sm text-muted-foreground">PDF report đầy đủ insights</p>
                </div>
              </div>
              <Button onClick={currentStepData.action} className="w-full" size="lg">
                Bắt đầu
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAnalyzeWebsite}
                  disabled={analyzing || !websiteUrl.trim()}
                  size="lg"
                >
                  {analyzing ? 'Đang phân tích...' : 'Phân tích'}
                </Button>
              </div>
              
              {analysisResult && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Phân tích hoàn tất!</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-2xl text-green-600">
                        {analysisResult.seo_score || 0}/100
                      </div>
                      <div className="text-green-700">Điểm SEO</div>
                    </div>
                    <div>
                      <div className="font-semibold text-2xl text-blue-600">
                        {analysisResult.issues?.length || 0}
                      </div>
                      <div className="text-blue-700">Vấn đề phát hiện</div>
                    </div>
                    <div>
                      <div className="font-semibold text-2xl text-purple-600">
                        {analysisResult.suggestions?.length || 0}
                      </div>
                      <div className="text-purple-700">Gợi ý cải thiện</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && analysisResult && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Kết quả phân tích</h4>
                <p className="text-blue-700 text-sm mb-4">
                  Website đã được phân tích với điểm SEO {analysisResult.seo_score}/100. 
                  Tạo báo cáo PDF để xem chi tiết và chia sẻ với team.
                </p>
                <Button onClick={handleGeneratePDF} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Tạo báo cáo PDF
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Chúc mừng! 🎉</h3>
              <p className="text-muted-foreground">
                Bạn đã hoàn tất setup SEO Auto Tool. Giờ hãy khám phá các tính năng mạnh mẽ khác!
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="border rounded-lg p-4">
                  <Target className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold">AI Content Writer</h4>
                  <p className="text-sm text-muted-foreground">Tạo nội dung SEO-friendly với AI</p>
                </div>
                <div className="border rounded-lg p-4">
                  <Zap className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold">One-Click Fix</h4>
                  <p className="text-sm text-muted-foreground">Sửa lỗi SEO tự động</p>
                </div>
              </div>
              <Button onClick={onComplete} className="w-full" size="lg">
                Vào Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tiến trình setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  step.completed ? 'bg-green-50 border-green-200' : 
                  index === currentStep ? 'bg-blue-50 border-blue-200' : 
                  'bg-muted/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-600 text-white' : 
                  index === currentStep ? 'bg-blue-600 text-white' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    step.completed ? 'text-green-800' : 
                    index === currentStep ? 'text-blue-800' : 
                    'text-muted-foreground'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {step.completed && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}