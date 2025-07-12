import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Brain, 
  Archive, 
  Wrench, 
  CheckCircle2,
  Clock,
  AlertCircle,
  X
} from "lucide-react";

interface AutoFixStepperProps {
  open: boolean;
  onClose: () => void;
  websiteUrl?: string;
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
}

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case "running":
      return <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
};

const getStatusBadge = (status: StepStatus) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="text-muted-foreground">Chờ xử lý</Badge>;
    case "running":
      return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">Đang xử lý</Badge>;
    case "success":
      return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Hoàn thành</Badge>;
    case "failed":
      return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">Thất bại</Badge>;
  }
};

export default function AutoFixStepper({ 
  open, 
  onClose, 
  websiteUrl, 
  onComplete 
}: AutoFixStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<FixStep[]>([
    {
      id: 1,
      title: "Phân tích lỗi",
      description: "Quét và phân tích các vấn đề SEO trên website",
      icon: <Search className="h-5 w-5" />,
      status: "pending"
    },
    {
      id: 2,
      title: "Tạo nội dung sửa bằng AI",
      description: "AI tạo ra các giải pháp tối ưu cho từng vấn đề",
      icon: <Brain className="h-5 w-5" />,
      status: "pending"
    },
    {
      id: 3,
      title: "Lưu bản backup",
      description: "Sao lưu trạng thái hiện tại để có thể khôi phục",
      icon: <Archive className="h-5 w-5" />,
      status: "pending"
    },
    {
      id: 4,
      title: "Áp dụng sửa",
      description: "Triển khai các cải thiện lên website",
      icon: <Wrench className="h-5 w-5" />,
      status: "pending"
    },
    {
      id: 5,
      title: "Kiểm tra lại",
      description: "Xác minh các cải thiện đã được áp dụng thành công",
      icon: <CheckCircle2 className="h-5 w-5" />,
      status: "pending"
    }
  ]);

  const updateStepStatus = (stepId: number, status: StepStatus, result?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result }
        : step
    ));
  };

  const simulateStep = async (stepId: number): Promise<boolean> => {
    updateStepStatus(stepId, "running");
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      const results = [
        "Phát hiện 12 vấn đề SEO cần khắc phục",
        "Tạo thành công 15 gợi ý cải thiện từ AI",
        "Backup được tạo tại: backup_2024_01_15.zip",
        "Áp dụng thành công 12/12 cải thiện",
        "Kiểm tra hoàn tất - SEO score tăng từ 65 → 89"
      ];
      updateStepStatus(stepId, "success", results[stepId - 1]);
    } else {
      updateStepStatus(stepId, "failed", "Có lỗi xảy ra trong quá trình xử lý");
    }
    
    return success;
  };

  const startAutoFix = async () => {
    if (!websiteUrl) return;
    
    setIsProcessing(true);
    setCurrentStep(0);
    
    // Reset all steps to pending
    setSteps(prev => prev.map(step => ({ ...step, status: "pending" as StepStatus })));
    
    let allSuccess = true;
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const success = await simulateStep(i + 1);
      
      if (!success) {
        allSuccess = false;
        break;
      }
    }
    
    setIsProcessing(false);
    
    if (allSuccess) {
      onComplete?.({
        success: true,
        improvements: steps.length,
        message: "Tất cả cải thiện đã được áp dụng thành công!"
      });
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      // Reset state when closing
      setTimeout(() => {
        setCurrentStep(0);
        setSteps(prev => prev.map(step => ({ ...step, status: "pending" as StepStatus })));
      }, 300);
    }
  };

  const completedSteps = steps.filter(step => step.status === "success").length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔧 Sửa lỗi SEO tự động
            {websiteUrl && (
              <span className="text-sm font-normal text-muted-foreground">
                - {websiteUrl}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiến độ</span>
              <span className="font-medium">{completedSteps}/{steps.length} bước</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card 
                key={step.id} 
                className={`
                  transition-all duration-300 animate-fade-in
                  ${currentStep === index && isProcessing ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${step.status === 'success' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''}
                  ${step.status === 'failed' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' : ''}
                `}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${step.status === 'success' ? 'bg-green-500 text-white' : ''}
                        ${step.status === 'failed' ? 'bg-red-500 text-white' : ''}
                        ${step.status === 'running' ? 'bg-primary text-primary-foreground' : ''}
                        ${step.status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                      `}>
                        {step.status === 'pending' || step.status === 'running' ? step.icon : getStatusIcon(step.status)}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                        {getStatusBadge(step.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      {step.result && (
                        <p className="text-xs bg-muted p-2 rounded border-l-2 border-primary">
                          {step.result}
                        </p>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(step.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              {isProcessing ? "Đang xử lý..." : "Đóng"}
            </Button>
            
            {!isProcessing && completedSteps === 0 && (
              <Button 
                onClick={startAutoFix}
                disabled={!websiteUrl}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Bắt đầu sửa tự động
              </Button>
            )}

            {!isProcessing && completedSteps === steps.length && (
              <Button 
                onClick={handleClose}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Hoàn thành
              </Button>
            )}

            {!isProcessing && completedSteps > 0 && completedSteps < steps.length && (
              <Button 
                onClick={startAutoFix}
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}