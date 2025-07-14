import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
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
  X
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

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
    }
  ];

  const steps = [
    {
      step: "01",
      icon: <Link className="w-12 h-12 text-primary" />,
      title: "Dán link website",
      description: "Chỉ cần nhập URL website cần phân tích vào hệ thống"
    },
    {
      step: "02", 
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      title: "Phân tích toàn diện",
      description: "AI quét toàn bộ website, phân tích SEO technical, content và user experience"
    },
    {
      step: "03",
      icon: <CheckCircle className="w-12 h-12 text-primary" />,
      title: "Nhận bản sửa lỗi AI",
      description: "Nhận ngay các đề xuất cải thiện và có thể áp dụng tự động với 1 click"
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
    },
    {
      label: "Liên kết nội bộ",
      icon: <Link className="w-5 h-5" />,
      classic: "Thường bị bỏ sót",
      ai: "AI đề xuất thêm link nội bộ thông minh"
    },
    {
      label: "Tốc độ tải trang",
      icon: <Clock className="w-5 h-5" />,
      classic: "Báo lỗi nhưng không biết sửa",
      ai: "Gợi ý chi tiết từng lỗi + hướng xử lý"
    },
    {
      label: "Schema Markup",
      icon: <Code className="w-5 h-5" />,
      classic: "Rất ít ai cài đặt hoặc sai",
      ai: "AI sinh schema tự động: Article, FAQ..."
    },
    {
      label: "Ý định tìm kiếm (Search Intent)",
      icon: <Target className="w-5 h-5" />,
      classic: "Không phân tích",
      ai: "AI đoán mục đích người dùng và gợi ý nội dung"
    },
    {
      label: "Điểm SEO tổng thể",
      icon: <TrendingUp className="w-5 h-5" />,
      classic: "Đánh giá cơ bản, máy móc",
      ai: "Chấm lại điểm SEO sau khi AI fix lỗi giả lập"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto text-center">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered SEO Tool</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Công cụ SEO AI
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Tự Động Hóa
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground">
                1 Click Là Tối Ưu
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Tự động phân tích, đề xuất và tối ưu website của bạn với công nghệ AI tiên tiến. 
              Từ phân tích kỹ thuật đến viết lại nội dung, mọi thứ được xử lý tự động.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                onClick={() => navigate('/dashboard')}
              >
                Bắt đầu ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 text-lg backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20"
              >
                Xem demo
              </Button>
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
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20" />
                <CardContent className="relative z-10 p-8 text-center space-y-4">
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

      {/* SEO Comparison Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              SEO AI mạnh hơn SEO thường như thế nào?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Chúng tôi không chỉ phân tích – mà còn đề xuất, viết lại, và sửa lỗi giúp bạn!
            </p>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm" />
              <CardContent className="relative z-10 p-0">
                {/* Header */}
                <div className="grid grid-cols-3 border-b border-border/30">
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Tiêu chí đánh giá</span>
                    </div>
                  </div>
                  <div className="p-6 border-l border-border/30">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-medium">SEO Thường</span>
                    </div>
                  </div>
                  <div className="p-6 border-l border-border/30">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">SEO AI của chúng tôi</span>
                    </div>
                  </div>
                </div>

                {/* Rows */}
                {comparisonData.map((row, index) => (
                  <div key={index} className="grid grid-cols-3 border-b border-border/20 last:border-b-0 hover:bg-white/5 transition-colors">
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          {row.icon}
                        </div>
                        <span className="font-medium">{row.label}</span>
                      </div>
                    </div>
                    <div className="p-6 border-l border-border/20">
                      <p className="text-muted-foreground">{row.classic}</p>
                    </div>
                    <div className="p-6 border-l border-border/20">
                      <p className="text-foreground">{row.ai}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {comparisonData.map((row, index) => (
              <Card key={index} className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20" />
                <CardContent className="relative z-10 p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/30">
                    <div className="text-primary">
                      {row.icon}
                    </div>
                    <span className="font-semibold">{row.label}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="w-3 h-3 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">SEO Thường</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-8">{row.classic}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-primary">SEO AI</span>
                      </div>
                      <p className="text-sm pl-8">{row.ai}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cách hoạt động
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chỉ cần 3 bước đơn giản để có website SEO hoàn hão
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 -translate-y-1/2" />
            
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20" />
                  <CardContent className="relative z-10 p-8 text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4 relative">
                      {step.icon}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-lg border border-primary/20" />
            <CardContent className="relative z-10 p-12 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Sẵn sàng tối ưu website của bạn?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tham gia hàng ngàn website đã cải thiện thứ hạng SEO với công cụ AI của chúng tôi
              </p>
              <Button 
                size="lg" 
                className="h-16 px-12 text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                onClick={() => navigate('/dashboard')}
              >
                Bắt đầu miễn phí ngay
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Không cần thẻ tín dụng • Miễn phí 14 ngày • Hủy bất cứ lúc nào
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/70 rounded-lg" />
                <span className="text-xl font-bold">SEO AI Tool</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                Công cụ SEO AI tiên tiến giúp tối ưu website tự động, 
                nâng cao thứ hạng tìm kiếm và tăng traffic organics.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Liên hệ</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" />
                  <span>support@seoai.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" />
                  <span>+84 123 456 789</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <span>TP. Hồ Chí Minh, Việt Nam</span>
                </div>
              </div>
            </div>
            
            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Pháp lý</h3>
              <div className="space-y-3">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Điều khoản sử dụng
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Chính sách bảo mật
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Chính sách hoàn tiền
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 SEO AI Tool. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}