import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { 
  Sparkles, 
  Zap, 
  FileText, 
  Link, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Search,
  Bot,
  Brain,
  Image,
  Target,
  Clock,
  Code,
  Users,
  TrendingUp,
  X,
  Play,
  SearchCheck,
  Settings,
  CheckCircle2,
  LogIn,
  UserPlus,
  Star,
  Globe,
  Shield,
  Rocket,
  Crown
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();
  const [showPricing, setShowPricing] = useState(false);

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Tự động phân tích – gợi ý – sửa lỗi",
      description: "AI phân tích website toàn diện, đưa ra gợi ý cụ thể và tự động sửa lỗi SEO chỉ trong vài phút"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "So sánh SEO truyền thống & SEO AI",
      description: "Xem sự khác biệt rõ ràng giữa phương pháp SEO cũ và AI SEO với điểm số cụ thể"
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: "Báo cáo PDF chuyên nghiệp",
      description: "Tạo báo cáo SEO đầy đủ, tối ưu toàn trang với format chuyên nghiệp cho khách hàng"
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Phân tích đối thủ cạnh tranh",
      description: "So sánh website với đối thủ và nhận insights để vượt qua họ"
    },
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: "AI Content Writer", 
      description: "Tạo nội dung SEO-friendly với AI, tối ưu cho từ khóa và intent"
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Theo dõi real-time",
      description: "Giám sát thay đổi thứ hạng và hiệu suất website 24/7"
    }
  ];

  const pricingPlans = [
    {
      id: 'free',
      name: 'Miễn Phí',
      price: '0',
      period: 'tháng',
      description: 'Dành cho cá nhân mới bắt đầu',
      icon: <Star className="w-6 h-6" />,
      color: 'text-muted-foreground',
      features: [
        '5 lần phân tích/tháng',
        'Báo cáo SEO cơ bản',
        'Phân tích on-page',
        'Theo dõi 1 từ khóa',
        'Hỗ trợ email'
      ],
      limitations: [
        'Không có AI suggestions',
        'Không có PDF report',
        'Không có competitor analysis'
      ]
    },
    {
      id: 'pro', 
      name: 'Professional',
      price: '299,000',
      period: 'tháng',
      description: 'Cho freelancer & agency nhỏ',
      icon: <Rocket className="w-6 h-6" />,
      color: 'text-primary',
      popular: true,
      features: [
        '100 lần phân tích/tháng',
        'AI SEO Suggestions',
        'PDF Reports chuyên nghiệp',
        'Competitor Analysis',
        'AI Content Writer',
        'Theo dõi 10 từ khóa',
        '1-Click Fix',
        'WordPress Integration',
        'Backup & Rollback',
        'Priority Support'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '999,000',
      period: 'tháng', 
      description: 'Cho agency & doanh nghiệp',
      icon: <Crown className="w-6 h-6" />,
      color: 'text-accent',
      features: [
        'Unlimited phân tích',
        'Tất cả tính năng Pro',
        'White-label Reports',
        'API Access',
        'Multi-user Management',
        'Advanced Analytics',
        'Custom Integrations',
        'Dedicated Support',
        'Theo dõi unlimited từ khóa',
        'Advanced AI Models'
      ],
      limitations: []
    }
  ];

  const comparisonData = [
    {
      label: "Tiêu đề trang (Meta Title)",
      icon: <FileText className="w-5 h-5" />,
      classic: "Có hoặc không, nhiều khi quá dài",
      ai: "AI tự rút gọn, chèn từ khóa và CTA hiệu quả"
    },
    {
      label: "Thẻ mô tả (Meta Description)",
      icon: <Search className="w-5 h-5" />,
      classic: "Không có mô tả hoặc không hấp dẫn",
      ai: "AI viết lại để tăng tỷ lệ click"
    },
    {
      label: "Thẻ H1 - H3",
      icon: <BarChart3 className="w-5 h-5" />,
      classic: "Sai cấu trúc, không rõ nội dung",
      ai: "AI đề xuất cấu trúc heading chuẩn SEO"
    },
    {
      label: "Ảnh không có alt text",
      icon: <Image className="w-5 h-5" />,
      classic: "Không hỗ trợ gì",
      ai: "AI tự viết lại alt chứa từ khóa phù hợp"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải SEO Auto Tool...</p>
        </div>
      </div>
    );
  }

  if (showPricing) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">SEO Auto Tool</h1>
              </div>
              <Button 
                onClick={() => setShowPricing(false)}
                variant="ghost"
              >
                ← Quay lại
              </Button>
            </div>
          </div>
        </header>

        {/* Pricing Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Chọn gói phù hợp với bạn</h2>
            <p className="text-xl text-muted-foreground">
              Nâng cấp để sử dụng đầy đủ sức mạnh AI SEO
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-6 py-2">
                      Phổ biến nhất
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    plan.id === 'free' ? 'bg-muted' : 
                    plan.id === 'pro' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    <div className={plan.color}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">₫/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tính năng
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                        <X className="w-4 h-4" />
                        Giới hạn
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'}`}
                    onClick={() => {
                      if (!user) {
                        navigate('/auth');
                      } else {
                        navigate('/dashboard');
                      }
                    }}
                  >
                    {plan.id === 'free' ? 'Bắt đầu miễn phí' : 'Chọn gói này'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto border-accent">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Cần giải pháp tùy chỉnh?</h3>
                <p className="text-muted-foreground mb-6">
                  Liên hệ với chúng tôi để được tư vấn gói Enterprise với tính năng đặc biệt
                </p>
                <Button variant="outline" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Liên hệ Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SEO Auto Tool
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <Button 
                    onClick={() => navigate('/auth')} 
                    variant="ghost"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Đăng nhập
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')} 
                    className="bg-primary hover:bg-primary/90"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Đăng ký
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate(userRole === 'admin' ? '/admin' : '/dashboard')} 
                  variant="outline"
                >
                  {userRole === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="space-y-8">
            <Badge className="inline-flex items-center gap-2 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Sparkles className="w-4 h-4" />
              AI-Powered SEO Tool
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="block mb-2">
                Công cụ SEO AI
              </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block mb-2">
                Tự Động Hóa
              </span>
              <span className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground block">
                1 Click Là Tối Ưu
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Tự động phân tích, đề xuất và tối ưu website của bạn với công nghệ AI tiên tiến. 
              Từ phân tích kỹ thuật đến viết lại nội dung, mọi thứ được xử lý tự động.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user ? (
                <>
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={() => navigate('/auth')}
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Bắt đầu miễn phí
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-14 px-8 text-lg"
                    onClick={() => setShowPricing(true)}
                  >
                    Xem bảng giá
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg font-semibold"
                  onClick={() => navigate(userRole === 'admin' ? '/admin' : '/dashboard')}
                >
                  {userRole === 'admin' ? (
                    <>
                      <Settings className="w-5 h-5 mr-2" />
                      Admin Panel
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Vào Dashboard
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tại sao chọn SEO AI của chúng tôi?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Các tính năng độc quyền giúp website của bạn đạt thứ hạng cao nhất
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              SEO AI mạnh hơn SEO thường như thế nào?
            </h2>
            <p className="text-xl text-muted-foreground">
              Chúng tôi không chỉ phân tích – mà còn đề xuất, viết lại, và sửa lỗi giúp bạn!
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="grid grid-cols-3 border-b bg-muted/50">
                <div className="p-6 font-semibold">Tiêu chí đánh giá</div>
                <div className="p-6 border-l font-semibold text-muted-foreground">SEO Thường</div>
                <div className="p-6 border-l font-semibold text-primary">SEO AI của chúng tôi</div>
              </div>

              {/* Rows */}
              {comparisonData.map((row, index) => (
                <div key={index} className="grid grid-cols-3 border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{row.icon}</div>
                      <span className="font-medium">{row.label}</span>
                    </div>
                  </div>
                  <div className="p-6 border-l text-muted-foreground">{row.classic}</div>
                  <div className="p-6 border-l">{row.ai}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">
                Sẵn sàng tăng thứ hạng website?
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Tham gia cùng hàng nghìn website đã tin tưởng và sử dụng SEO Auto Tool
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user ? (
                  <>
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/auth')}
                      className="px-8"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Bắt đầu miễn phí ngay
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setShowPricing(true)}
                      className="px-8"
                    >
                      Xem bảng giá
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    className="px-8"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Vào Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg">SEO Auto Tool</h3>
              </div>
              <p className="text-muted-foreground">
                Công cụ SEO AI tự động hóa hàng đầu Việt Nam
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Phân tích SEO</li>
                <li>AI Content Writer</li>
                <li>Competitor Analysis</li>
                <li>WordPress Integration</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Tài liệu</li>
                <li>API Documentation</li>
                <li>Hỗ trợ kỹ thuật</li>
                <li>Liên hệ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@seoautotool.com
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  1900 xxxx
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 SEO Auto Tool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}