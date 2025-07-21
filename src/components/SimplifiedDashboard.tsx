import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles,
  FileText,
  Settings,
  HelpCircle,
  Zap,
  Target,
  TrendingUp,
  Globe,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SimplifiedDashboardProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  analysisResult: any;
  onGeneratePDF: () => void;
  isGeneratingPDF: boolean;
}

export function SimplifiedDashboard({ 
  onAnalyze, 
  isAnalyzing, 
  analysisResult, 
  onGeneratePDF, 
  isGeneratingPDF 
}: SimplifiedDashboardProps) {
  const [url, setUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(true); // Always show advanced features - competitive advantage

  const handleAnalyze = () => {
    if (url.trim()) {
      console.log('SimplifiedDashboard: Starting analysis for', url);
      onAnalyze(url);
      setCurrentStep(2);
    } else {
      alert('Vui lòng nhập địa chỉ website');
    }
  };

  const steps = [
    { id: 1, title: 'Nhập website', description: 'Nhập địa chỉ website cần kiểm tra', completed: !!url },
    { id: 2, title: 'Phân tích SEO', description: 'Hệ thống sẽ kiểm tra toàn bộ website', completed: !!analysisResult },
    { id: 3, title: 'Xem kết quả', description: 'Nhận báo cáo chi tiết và đề xuất', completed: !!analysisResult },
    { id: 4, title: 'Tải báo cáo', description: 'Tải file PDF để lưu trữ', completed: false }
  ];

  const quickActions = [
    {
      title: 'Phân tích nhanh',
      description: 'Kiểm tra SEO cơ bản trong 30 giây',
      icon: Search,
      color: 'bg-blue-500',
      action: () => handleAnalyze()
    },
    {
      title: 'Tối ưu tự động',
      description: 'AI sửa lỗi SEO tự động',
      icon: Zap,
      color: 'bg-purple-500',
      action: () => setShowAdvanced(true)
    },
    {
      title: 'Báo cáo PDF',
      description: 'Tải báo cáo chi tiết',
      icon: FileText,
      color: 'bg-green-500',
      action: onGeneratePDF
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            SEO Checker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Kiểm tra và tối ưu SEO website của bạn một cách đơn giản
          </p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quy trình kiểm tra SEO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-gray-400 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Action Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: URL Input & Analysis */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Bước 1: Nhập website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Địa chỉ website</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ví dụ: example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAnalyze}
                    disabled={!url.trim() || isAnalyzing}
                    className="whitespace-nowrap"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Kiểm tra ngay
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {analysisResult && (
                <div className="pt-4 border-t space-y-4">
                  <h3 className="font-medium">Kết quả phân tích:</h3>
                  
                  {/* SEO Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Điểm SEO</span>
                      <span className="font-bold">{analysisResult.seo_score || 0}/100</span>
                    </div>
                    <Progress value={analysisResult.seo_score || 0} className="h-2" />
                  </div>

                  {/* Issues Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {analysisResult.issues?.length || 0}
                      </div>
                      <div className="text-xs text-red-600">Lỗi cần sửa</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.good_items || 0}
                      </div>
                      <div className="text-xs text-green-600">Mục tốt</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Hành động nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={action.action}
                  disabled={action.title === 'Báo cáo PDF' && !analysisResult}
                >
                  <div className={`p-2 rounded-lg ${action.color} mr-4`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Issues List (if analysis is done) */}
        {analysisResult && analysisResult.issues?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Lỗi cần khắc phục ({analysisResult.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.issues.slice(0, 5).map((issue: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`p-1 rounded ${
                      issue.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{issue.message}</div>
                      <Badge variant={issue.type === 'critical' ? 'destructive' : 'secondary'} className="mt-1">
                        {issue.priority === 'high' ? 'Ưu tiên cao' : 'Ưu tiên trung bình'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {analysisResult.issues.length > 5 && (
                  <Button variant="outline" className="w-full">
                    Xem thêm {analysisResult.issues.length - 5} lỗi khác
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Features - Always Visible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tính năng nâng cao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>Phân tích đối thủ</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Sparkles className="h-6 w-6 mb-2" />
                <span>AI Content</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Target className="h-6 w-6 mb-2" />
                <span>Từ khóa AI</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-medium">Cần hỗ trợ?</h3>
                  <p className="text-sm text-gray-500">Xem hướng dẫn sử dụng hoặc liên hệ support</p>
                </div>
              </div>
              <Button variant="outline">
                Xem hướng dẫn
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}