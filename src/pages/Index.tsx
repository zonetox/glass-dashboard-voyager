import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingSection } from "@/components/PricingSection";
import { useAuth } from '@/hooks/useAuth';
import { Search, Zap, BarChart3, Globe, CheckCircle, Star, Users, TrendingUp, Shield, LogIn, Settings, ArrowRight } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();
  const [showPricing, setShowPricing] = useState(false);

  // Redirect based on user role
  useEffect(() => {
    if (!loading && user) {
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'member' && !showPricing) {
        // For members, show dashboard directly or pricing if needed
        navigate('/dashboard');
      }
    }
  }, [user, userRole, loading, navigate, showPricing]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading SEO Auto Tool...</p>
        </div>
      </div>
    );
  }

  if (showPricing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Button 
              onClick={() => setShowPricing(false)}
              variant="outline"
              className="mb-4"
            >
              ← Quay lại trang chủ
            </Button>
            <h2 className="text-3xl font-bold text-white mb-4">Chọn gói phù hợp với bạn</h2>
            <p className="text-gray-300">Nâng cấp tài khoản để sử dụng đầy đủ tính năng</p>
          </div>
          <PricingSection />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  SEO Auto Tool
                </h1>
              </div>
            </div>
            
            {!user && (
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => navigate('/auth')} 
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  Đăng nhập
                </Button>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
            <Star className="mr-1 h-3 w-3" />
            Công cụ SEO tự động hàng đầu
          </Badge>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Tự động hóa 
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}thành công SEO
            </span>
            {" "}của bạn
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            Phân tích, tối ưu hóa và theo dõi hiệu suất SEO của website với công cụ tự động hóa toàn diện. 
            Nhận insights có thể thực hiện và tăng thứ hạng tìm kiếm.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Button 
                  onClick={() => navigate('/auth')} 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Bắt đầu miễn phí
                </Button>
                <Button 
                  onClick={() => setShowPricing(true)} 
                  variant="outline" 
                  size="lg"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 text-lg"
                >
                  Xem bảng giá
                </Button>
              </>
            ) : userRole === 'admin' ? (
              <Button 
                onClick={() => navigate('/admin')} 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
              >
                <Settings className="mr-2 h-5 w-5" />
                Quản trị hệ thống
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/dashboard')} 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Vào Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">
            Tính năng mạnh mẽ cho SEO
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Bộ công cụ toàn diện để phân tích, tối ưu hóa và theo dõi hiệu suất SEO
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Phân tích Website</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-center">
                Kiểm tra SEO toàn diện với báo cáo chi tiết và insights có thể thực hiện
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-white">Tối ưu tự động</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-center">
                Tự động phát hiện và sửa các vấn đề SEO quan trọng
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Theo dõi tiến độ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-center">
                Giám sát cải thiện SEO với tracking điểm số thời gian thực
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-yellow-400" />
              </div>
              <CardTitle className="text-white">Phân tích đối thủ</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-center">
                So sánh và học hỏi từ các đối thủ cạnh tranh hàng đầu
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="glass-card border-white/10 p-8 rounded-2xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-gray-300">Websites được phân tích</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">95%</div>
              <div className="text-gray-300">Cải thiện thứ hạng</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300">Giám sát tự động</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-12 rounded-2xl border border-blue-500/30">
          <h3 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng tăng thứ hạng website?
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn website đã tin tượng và sử dụng SEO Auto Tool để đạt được kết quả tuyệt vời
          </p>
          
          {!user && (
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Bắt đầu miễn phí ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 SEO Auto Tool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}