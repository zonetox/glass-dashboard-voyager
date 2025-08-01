import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ComprehensiveOnboarding } from '@/components/dashboard/ComprehensiveOnboarding';
import { 
  CheckCircle, 
  Globe, 
  Search, 
  FileText, 
  Zap, 
  ArrowRight,
  Target,
  BarChart3,
  Sparkles,
  Users,
  Crown,
  Settings,
  TrendingUp
} from 'lucide-react';

interface WelcomeFlowProps {
  onComplete: () => void;
}

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
  const [step, setStep] = useState<'welcome' | 'plan' | 'onboarding'>('welcome');
  const { user } = useAuth();
  const { toast } = useToast();

  const features = [
    {
      icon: <Search className="h-6 w-6 text-primary" />,
      title: "Phân tích SEO toàn diện",
      description: "AI phân tích website với 100+ yếu tố SEO"
    },
    {
      icon: <Zap className="h-6 w-6 text-accent" />,
      title: "Tối ưu tự động",
      description: "1-click fix các vấn đề SEO quan trọng"
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Báo cáo PDF chuyên nghiệp",
      description: "White-label reports cho clients"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-accent" />,
      title: "Tracking & Analytics",
      description: "Theo dõi thứ hạng và hiệu suất"
    },
    {
      icon: <Crown className="h-6 w-6 text-primary" />,
      title: "AI Content Writer",
      description: "Tạo nội dung SEO-friendly với AI"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-accent" />,
      title: "Competitor Analysis",
      description: "Phân tích đối thủ và cơ hội vượt qua"
    }
  ];

  if (step === 'onboarding') {
    return <ComprehensiveOnboarding onComplete={onComplete} />;
  }

  if (step === 'plan') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Chọn gói phù hợp với bạn</CardTitle>
            <p className="text-muted-foreground">Bắt đầu với gói miễn phí, nâng cấp khi cần</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <Card className="border-2 border-muted">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle>Miễn phí</CardTitle>
                  <div className="text-3xl font-bold">0₫<span className="text-sm text-muted-foreground">/tháng</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      5 lần phân tích/tháng
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Báo cáo SEO cơ bản
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      1 từ khóa tracking
                    </li>
                  </ul>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setStep('onboarding')}
                  >
                    Bắt đầu miễn phí
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-2 border-primary shadow-lg scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-6 py-2">
                    Phổ biến nhất
                  </Badge>
                </div>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Professional</CardTitle>
                  <div className="text-3xl font-bold">299,000₫<span className="text-sm text-muted-foreground">/tháng</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      100 lần phân tích/tháng
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      AI SEO Suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      PDF Reports chuyên nghiệp
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      AI Content Writer
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      10 từ khóa tracking
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90" 
                    onClick={() => setStep('onboarding')}
                  >
                    Chọn gói Pro
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-2 border-accent">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Enterprise</CardTitle>
                  <div className="text-3xl font-bold">999,000₫<span className="text-sm text-muted-foreground">/tháng</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Unlimited phân tích
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      White-label Reports
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      API Access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Multi-user Management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Unlimited tracking
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90" 
                    onClick={() => setStep('onboarding')}
                  >
                    Chọn Enterprise
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button 
                variant="ghost" 
                onClick={() => setStep('onboarding')}
                className="text-muted-foreground"
              >
                Bỏ qua, tôi sẽ chọn sau
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold">
          Chào mừng đến với 
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {" "}SEO Auto Tool
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Công cụ SEO AI tiên tiến giúp website của bạn đạt thứ hạng cao nhất trên Google
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-border hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold">Sẵn sàng tối ưu website của bạn?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Chỉ cần 2 phút để setup và bạn sẽ có được insights chi tiết về SEO website của mình
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setStep('onboarding')}
              className="bg-primary hover:bg-primary/90 px-8"
            >
              <Search className="h-5 w-5 mr-2" />
              Phân tích website ngay
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setStep('plan')}
              className="px-8"
            >
              <Settings className="h-5 w-5 mr-2" />
              Xem bảng giá
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            ✓ Không cần thẻ tín dụng &nbsp;&nbsp; ✓ Setup trong 2 phút &nbsp;&nbsp; ✓ Kết quả tức thì
          </p>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-primary">50K+</div>
          <div className="text-sm text-muted-foreground">Websites được phân tích</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-accent">95%</div>
          <div className="text-sm text-muted-foreground">Cải thiện thứ hạng</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-primary">24/7</div>
          <div className="text-sm text-muted-foreground">Giám sát tự động</div>
        </div>
      </div>
    </div>
  );
}