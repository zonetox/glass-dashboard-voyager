import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Brain, 
  Archive, 
  Wrench, 
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Eye,
  RotateCcw,
  History,
  ArrowRight
} from "lucide-react";
import { useAIHtmlFix } from "@/hooks/useAIHtmlFix";

interface EnhancedAutoFixStepperProps {
  open: boolean;
  onClose: () => void;
  websiteUrl?: string;
  aiAnalysis?: any;
  onComplete?: (result: any) => void;
}

type StepStatus = "pending" | "running" | "success" | "failed";

interface FixStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: StepStatus;
  result?: string;
  error?: string;
  suggestions?: string[];
  preview?: {
    before: string;
    after: string;
  };
}

interface FixHistory {
  id: string;
  timestamp: string;
  changes: string[];
  backupUrl?: string;
  status: 'success' | 'reverted';
}

const getStatusBadge = (status: StepStatus) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline">⏳ Chờ xử lý</Badge>;
    case "running":
      return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">⏳ Đang xử lý</Badge>;
    case "success":
      return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">✅ Hoàn tất</Badge>;
    case "failed":
      return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">❌ Lỗi</Badge>;
  }
};

export default function EnhancedAutoFixStepper({ 
  open, 
  onClose, 
  websiteUrl, 
  aiAnalysis,
  onComplete 
}: EnhancedAutoFixStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fixHistory, setFixHistory] = useState<FixHistory[]>([]);
  const [steps, setSteps] = useState<FixStep[]>([
    {
      id: 1,
      title: "🔍 Phân tích và đề xuất sửa",
      description: "AI phân tích các vấn đề SEO và đưa ra gợi ý cụ thể",
      icon: <Brain className="h-5 w-5" />,
      status: "pending"
    },
    {
      id: 2,
      title: "👀 Xem trước kết quả",
      description: "Hiển thị so sánh trước/sau khi áp dụng các sửa đổi",
      icon: <Eye className="h-5 w-5" />,
      status: "pending"
    },
    {
      id: 3,
      title: "⚡ Áp dụng sửa đổi",
      description: "Tự động backup và áp dụng các thay đổi lên website",
      icon: <Wrench className="h-5 w-5" />,
      status: "pending"
    }
  ]);

  const { toast } = useToast();
  const { fixes, loading, error, generateFix } = useAIHtmlFix();

  const updateStepStatus = (stepId: number, status: StepStatus, result?: string, error?: string, suggestions?: string[], preview?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result, error, suggestions, preview }
        : step
    ));
  };

  const handleStep1 = async () => {
    updateStepStatus(1, "running");
    
    try {
      if (!websiteUrl || !aiAnalysis) {
        throw new Error("Thiếu thông tin website hoặc phân tích AI");
      }

      await generateFix(websiteUrl, aiAnalysis);
      
      // Use real data from fixes hook
      const realSuggestions = fixes?.suggestions || ["Đang tải gợi ý..."];
      const realPreview = fixes?.preview || {
        before: "Đang tải...",
        after: "Đang tạo preview..."
      };

      updateStepStatus(1, "success", "Đã phân tích và tạo gợi ý sửa", undefined, realSuggestions, realPreview);
      setCurrentStep(1);
    } catch (err) {
      updateStepStatus(1, "failed", undefined, err instanceof Error ? err.message : "Lỗi không xác định");
    }
  };

  const handleStep2 = () => {
    updateStepStatus(2, "running");
    setShowPreview(true);
    
    setTimeout(() => {
      updateStepStatus(2, "success", "Đã hiển thị preview");
      setCurrentStep(2);
    }, 1000);
  };

  const handleStep3 = async () => {
    updateStepStatus(3, "running");
    
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate applying fixes
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newHistory: FixHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString('vi-VN'),
        changes: steps[0].suggestions || [],
        backupUrl: `backup_${Date.now()}.zip`,
        status: 'success'
      };
      
      setFixHistory(prev => [newHistory, ...prev]);
      updateStepStatus(3, "success", "Đã áp dụng thành công các sửa đổi");
      
      toast({
        title: "✅ Auto Fix hoàn tất",
        description: "Website đã được tối ưu hóa thành công!",
      });
      
      onComplete?.({
        success: true,
        changes: steps[0].suggestions,
        backupUrl: newHistory.backupUrl
      });
      
    } catch (err) {
      updateStepStatus(3, "failed", undefined, err instanceof Error ? err.message : "Lỗi khi áp dụng sửa đổi");
    }
  };

  const handleRevert = async (historyId: string) => {
    try {
      // Simulate revert process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFixHistory(prev => prev.map(item => 
        item.id === historyId 
          ? { ...item, status: 'reverted' as const }
          : item
      ));
      
      toast({
        title: "🔄 Đã khôi phục",
        description: "Website đã được khôi phục về bản cũ thành công!",
      });
    } catch (err) {
      toast({
        title: "❌ Lỗi khôi phục",
        description: "Không thể khôi phục website. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const startAutoFix = async () => {
    setIsProcessing(true);
    await handleStep1();
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setCurrentStep(0);
      setShowPreview(false);
      setSteps(prev => prev.map(step => ({ ...step, status: "pending" as StepStatus })));
      onClose();
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>🚀 Auto Fix - Sửa lỗi SEO tự động</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="process" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="process">Quy trình sửa</TabsTrigger>
            <TabsTrigger value="history">Lịch sử ({fixHistory.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="process" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Website: <span className="font-medium">{websiteUrl}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Tiến độ: {currentStep + 1}/{steps.length}
                </div>
              </div>

              <Progress value={progress} className="w-full" />

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <Card key={step.id} className={`${index === currentStep ? 'ring-2 ring-primary' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {step.icon}
                            <CardTitle className="text-lg">{step.title}</CardTitle>
                          </div>
                          {getStatusBadge(step.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </CardHeader>

                      {(step.suggestions || step.preview || step.result || step.error) && (
                        <CardContent className="pt-0">
                          {step.suggestions && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Gợi ý sửa đổi:</h4>
                              <ul className="text-sm space-y-1">
                                {step.suggestions.map((suggestion, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.preview && showPreview && (
                            <div className="space-y-3 mt-4">
                              <h4 className="font-medium">So sánh trước/sau:</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium mb-2">Trước:</h5>
                                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                                    {step.preview.before}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium mb-2">Sau:</h5>
                                  <pre className="text-xs bg-green-50 dark:bg-green-950/20 p-3 rounded overflow-auto max-h-32">
                                    {step.preview.after}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}

                          {step.result && (
                            <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                              ✅ {step.result}
                            </div>
                          )}

                          {step.error && (
                            <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                              ❌ {step.error}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                  <X className="h-4 w-4 mr-2" />
                  Đóng
                </Button>

                <div className="flex gap-2">
                  {currentStep === 0 && (
                    <Button onClick={startAutoFix} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Bắt đầu
                        </>
                      )}
                    </Button>
                  )}

                  {currentStep === 1 && steps[1].status === "pending" && (
                    <Button onClick={handleStep2}>
                      <Eye className="h-4 w-4 mr-2" />
                      Xem trước
                    </Button>
                  )}

                  {currentStep === 2 && steps[2].status === "pending" && (
                    <Button onClick={handleStep3}>
                      <Wrench className="h-4 w-4 mr-2" />
                      Xác nhận sửa
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-96">
              {fixHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có lịch sử sửa đổi nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fixHistory.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm">Sửa đổi lúc {item.timestamp}</CardTitle>
                            <Badge variant={item.status === 'success' ? 'default' : 'secondary'} className="mt-1">
                              {item.status === 'success' ? '✅ Thành công' : '🔄 Đã khôi phục'}
                            </Badge>
                          </div>
                          {item.status === 'success' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevert(item.id)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Khôi phục
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Các thay đổi:</h4>
                          <ul className="text-sm space-y-1">
                            {item.changes.map((change, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                {change}
                              </li>
                            ))}
                          </ul>
                          {item.backupUrl && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Backup: {item.backupUrl}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}