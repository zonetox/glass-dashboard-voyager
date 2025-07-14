import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Search, Brain, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Dán URL website để bắt đầu",
    description: "Chỉ cần nhập địa chỉ website của bạn vào ô tìm kiếm, hệ thống sẽ bắt đầu quá trình phân tích toàn diện.",
    icon: <Search className="h-12 w-12 text-primary" />
  },
  {
    title: "AI sẽ phân tích và đề xuất sửa lỗi",
    description: "Công nghệ AI tiên tiến sẽ quét toàn bộ website, phát hiện các vấn đề SEO và đưa ra gợi ý cải thiện chi tiết.",
    icon: <Brain className="h-12 w-12 text-primary" />
  },
  {
    title: "Bạn có thể xuất báo cáo PDF và tối ưu toàn bộ",
    description: "Nhận báo cáo chi tiết dạng PDF và sử dụng tính năng tối ưu tự động để cải thiện website ngay lập tức.",
    icon: <FileText className="h-12 w-12 text-primary" />
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding-completed-${user.id}`);
      if (!hasSeenOnboarding) {
        setIsVisible(true);
      }
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
    }
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) {
    return null;
  }

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Bước {currentStep + 1} / {onboardingSteps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {currentStepData.icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>

            <div className="flex gap-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {isLastStep ? 'Bắt đầu' : 'Tiếp theo'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Skip option */}
          {!isLastStep && (
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Bỏ qua hướng dẫn
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OnboardingTour;