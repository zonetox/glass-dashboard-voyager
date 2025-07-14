import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnboardingTour } from '@/components/OnboardingTour';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BarChart3, 
  Settings, 
  Crown,
  Zap,
  FileText,
  History,
  CreditCard,
  Shield,
  Bell,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export function AccountPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Mock data - trong thực tế sẽ lấy từ API
  const [profile] = useState({
    tier: 'pro',
    scans_limit: 50,
    optimizations_limit: 10,
    ai_rewrites_limit: 20,
    email_verified: true,
    created_at: user?.created_at || new Date().toISOString()
  });

  const [usage] = useState({
    scans_used: 15,
    optimizations_used: 3,
    ai_rewrites_used: 8,
    reset_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
  });

  const [reports] = useState([
    {
      id: '1',
      website_url: 'example.com',
      created_at: '2024-01-15T10:30:00Z',
      seo_score: 85,
      file_size: '2.4 MB'
    },
    {
      id: '2', 
      website_url: 'demo-site.org',
      created_at: '2024-01-14T15:45:00Z',
      seo_score: 72,
      file_size: '1.8 MB'
    }
  ]);

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'free': 
        return { 
          name: 'Free Plan', 
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          icon: <User className="h-3 w-3" />,
          price: '0₫/tháng'
        };
      case 'pro': 
        return { 
          name: 'Pro Plan', 
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          icon: <Crown className="h-3 w-3" />,
          price: '99,000₫/tháng'
        };
      case 'agency': 
        return { 
          name: 'Agency Plan', 
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <Zap className="h-3 w-3" />,
          price: '299,000₫/tháng'
        };
      default: 
        return { 
          name: 'Unknown', 
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          icon: <User className="h-3 w-3" />,
          price: '0₫/tháng'
        };
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const tierInfo = getTierInfo(profile.tier);

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingEnd = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tài khoản của tôi</h1>
          <p className="text-gray-400 mt-1">Quản lý thông tin tài khoản và gói dịch vụ</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleStartOnboarding}
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Xem hướng dẫn
          </Button>
          <Button 
            variant="outline" 
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Crown className="h-4 w-4 mr-2" />
            Nâng cấp gói
          </Button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="glass-card border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-2 border-blue-400/50">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </h2>
                {profile.email_verified && (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-gray-400 mb-3">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Tham gia {new Date(profile.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className={tierInfo.color}>
                  {tierInfo.icon}
                  <span className="ml-1">{tierInfo.name}</span>
                </Badge>
                <span className="text-sm text-gray-400">{tierInfo.price}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="usage" className="data-[state=active]:bg-blue-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Sử dụng
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600">
            <FileText className="w-4 h-4 mr-2" />
            Báo cáo
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-blue-600">
            <CreditCard className="w-4 h-4 mr-2" />
            Thanh toán
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scans Usage */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                  Phân tích SEO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Đã sử dụng</span>
                    <span className="text-white font-medium">
                      {usage.scans_used} / {profile.scans_limit}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.scans_used, profile.scans_limit)} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-400">
                    Làm mới vào {new Date(usage.reset_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Optimizations Usage */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-400" />
                  Tối ưu hóa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Đã sử dụng</span>
                    <span className="text-white font-medium">
                      {usage.optimizations_used} / {profile.optimizations_limit}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.optimizations_used, profile.optimizations_limit)} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-400">
                    Làm mới vào {new Date(usage.reset_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Rewrites Usage */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-400" />
                  AI Rewrites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Đã sử dụng</span>
                    <span className="text-white font-medium">
                      {usage.ai_rewrites_used} / {profile.ai_rewrites_limit}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.ai_rewrites_used, profile.ai_rewrites_limit)} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-400">
                    Làm mới vào {new Date(usage.reset_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Báo cáo PDF đã tạo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{report.website_url}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{new Date(report.created_at).toLocaleDateString('vi-VN')}</span>
                          <span>SEO Score: {report.seo_score}/100</span>
                          <span>{report.file_size}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Tải xuống
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Thông tin thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Nâng cấp gói Pro</h3>
                <p className="text-gray-400 mb-6">
                  Mở khóa tất cả tính năng và tăng giới hạn sử dụng
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Nâng cấp ngay - 99,000₫/tháng
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Cài đặt tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">Thông báo email</h3>
                    <p className="text-sm text-gray-400">Nhận thông báo về kết quả phân tích</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Bật
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <h3 className="text-white font-medium">Xác thực 2 lớp</h3>
                    <p className="text-sm text-gray-400">Tăng cường bảo mật tài khoản</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Cài đặt
                </Button>
              </div>

              <Separator className="my-6 bg-gray-700" />

              <div className="space-y-3">
                <Button variant="outline" className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                  Đổi mật khẩu
                </Button>
                <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Xóa tài khoản
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <OnboardingTour 
        runTour={showOnboarding}
        onTourEnd={handleOnboardingEnd}
      />
    </div>
  );
}