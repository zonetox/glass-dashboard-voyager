import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnboardingTour } from '@/components/OnboardingTour';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  HelpCircle,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { AutoPilotSettings } from '@/components/AutoPilotSettings';
import { useUsageTracking } from '@/hooks/useUsageTracking';

export function AccountPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeSection, setActiveSection] = useState('usage');
  const { usage, loading: usageLoading } = useUsageTracking();
  
  // Real profile data from user_profiles table
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        // Load user profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }

        // Load user reports
        const { data: reportsData } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (reportsData) {
          setReports(reportsData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user]);

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
      case 'enterprise': 
        return { 
          name: 'Enterprise Plan', 
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: <Crown className="h-3 w-3" />,
          price: '0₫/tháng'
        };
      default: 
        return { 
          name: 'Loading...', 
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          icon: <User className="h-3 w-3" />,
          price: '0₫/tháng'
        };
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const tierInfo = getTierInfo(profile?.tier || 'free');

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingEnd = () => {
    setShowOnboarding(false);
  };

  const menuItems = [
    {
      id: 'usage',
      title: 'Sử dụng dịch vụ',
      icon: BarChart3,
      description: 'Theo dõi usage và giới hạn'
    },
    {
      id: 'reports',
      title: 'Báo cáo PDF',
      icon: FileText,
      description: 'Quản lý các báo cáo đã tạo'
    },
    {
      id: 'billing',
      title: 'Thanh toán & Gói',
      icon: CreditCard,
      description: 'Thông tin thanh toán và nâng cấp'
    },
    {
      id: 'settings',
      title: 'Cài đặt tài khoản',
      icon: Settings,
      description: 'Cấu hình và bảo mật'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tài khoản của tôi</h1>
              <p className="text-muted-foreground mt-1">Quản lý thông tin tài khoản và gói dịch vụ</p>
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
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Crown className="h-4 w-4 mr-2" />
                Nâng cấp gói
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="p-6 border-b border-border">
          <Card>
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
                    <h2 className="text-2xl font-bold">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </h2>
                    {profile.email_verified && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-muted-foreground mb-3">
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
                    <span className="text-sm text-muted-foreground">{tierInfo.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex">
          {/* Vertical Sidebar Menu */}
          <div className="w-80 p-6 border-r border-border">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-200 group ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-muted/50 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <div className="flex-1">
                      <div className={`font-medium ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {item.title}
                      </div>
                      <div className={`text-sm ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      isActive ? 'rotate-90 text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* Usage Section */}
            {activeSection === 'usage' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Sử dụng dịch vụ</h2>
                  <p className="text-muted-foreground">Theo dõi việc sử dụng các tính năng trong tháng này</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Scans Usage */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                        Phân tích SEO
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Đã sử dụng</span>
                          <span className="font-medium">
                            {usage?.scans_used || 0} / {usage?.scans_limit || profile.scans_limit}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(usage?.scans_used || 0, usage?.scans_limit || profile.scans_limit)} 
                          className="h-2"
                        />
                        <div className="text-xs space-y-1">
                          <p className="text-muted-foreground">
                            Làm mới vào {new Date(usage?.reset_date || Date.now()).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-blue-500">
                            Tháng này: {usage?.current_month_scans || 0} lượt phân tích
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Optimizations Usage */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-purple-500" />
                        Tối ưu hóa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Đã sử dụng</span>
                          <span className="font-medium">
                            {usage?.optimizations_used || 0} / {usage?.optimizations_limit || profile.optimizations_limit}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(usage?.optimizations_used || 0, usage?.optimizations_limit || profile.optimizations_limit)} 
                          className="h-2"
                        />
                        <div className="text-xs space-y-1">
                          <p className="text-muted-foreground">
                            Làm mới vào {new Date(usage?.reset_date || Date.now()).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-purple-500">
                            Tháng này: {usage?.current_month_optimizations || 0} lần tối ưu
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Rewrites Usage */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Award className="w-5 h-5 mr-2 text-green-500" />
                        AI Rewrites
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Đã sử dụng</span>
                          <span className="font-medium">
                            {usage?.ai_rewrites_used || 0} / {usage?.ai_rewrites_limit || profile.ai_rewrites_limit}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(usage?.ai_rewrites_used || 0, usage?.ai_rewrites_limit || profile.ai_rewrites_limit)} 
                          className="h-2"
                        />
                        <div className="text-xs space-y-1">
                          <p className="text-muted-foreground">
                            Làm mới vào {new Date(usage?.reset_date || Date.now()).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-green-500">
                            Tháng này: {usage?.current_month_ai_rewrites || 0} lần AI rewrite
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Reports Section */}
            {activeSection === 'reports' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Báo cáo PDF</h2>
                  <p className="text-muted-foreground">Quản lý và tải xuống các báo cáo SEO đã tạo</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Báo cáo đã tạo ({reports.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.length > 0 ? (
                        reports.map((report) => (
                          <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                              </div>
                              <div>
                                <h3 className="font-medium">{report.website_url}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{new Date(report.created_at).toLocaleDateString('vi-VN')}</span>
                                  <span className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      report.seo_score >= 80 ? 'bg-green-500' : 
                                      report.seo_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></div>
                                    SEO: {report.seo_score}/100
                                  </span>
                                  <span>{report.file_size}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                Xem
                              </Button>
                              <Button variant="outline" size="sm">
                                Tải xuống
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h4 className="font-medium mb-2">Chưa có báo cáo nào</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Thực hiện phân tích SEO để tạo báo cáo PDF
                          </p>
                          <Button variant="outline">
                            Bắt đầu phân tích
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Billing Section */}
            {activeSection === 'billing' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Thanh toán & Gói dịch vụ</h2>
                  <p className="text-muted-foreground">Quản lý gói dịch vụ và phương thức thanh toán</p>
                </div>

                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Crown className="w-5 h-5 mr-2" />
                      Gói hiện tại: {tierInfo.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{tierInfo.name}</h4>
                            <p className="text-sm text-muted-foreground">{tierInfo.price}</p>
                          </div>
                          <Badge className={tierInfo.color}>
                            {tierInfo.icon}
                            <span className="ml-1">Đang sử dụng</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Phân tích SEO</span>
                            <span className="font-medium">{usage?.scans_used || 0} / {usage?.scans_limit || profile.scans_limit}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tối ưu hóa</span>
                            <span className="font-medium">{usage?.optimizations_used || 0} / {usage?.optimizations_limit || profile.optimizations_limit}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>AI Rewrites</span>
                            <span className="font-medium">{usage?.ai_rewrites_used || 0} / {usage?.ai_rewrites_limit || profile.ai_rewrites_limit}</span>
                          </div>
                        </div>
                      </div>

                      {profile.tier === 'free' && (
                        <div className="text-center py-6 border-t">
                          <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                          <h3 className="text-xl font-bold mb-2">Nâng cấp gói Pro</h3>
                          <p className="text-muted-foreground mb-6">
                            Mở khóa tất cả tính năng và tăng giới hạn sử dụng
                          </p>
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            Nâng cấp ngay - 99,000₫/tháng
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Phương thức thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-6">
                        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h4 className="font-medium mb-2">Chưa có phương thức thanh toán</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Thêm phương thức thanh toán để nâng cấp gói dịch vụ
                        </p>
                        <Button variant="outline">
                          Thêm phương thức thanh toán
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="w-5 h-5 mr-2" />
                      Lịch sử thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium mb-2">Chưa có lịch sử thanh toán</h4>
                      <p className="text-sm text-muted-foreground">
                        Lịch sử giao dịch sẽ xuất hiện ở đây
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Cài đặt tài khoản</h2>
                  <p className="text-muted-foreground">Quản lý cài đặt bảo mật và tài khoản</p>
                </div>

                {/* Auto-Pilot SEO Mode */}
                <AutoPilotSettings />

                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Thông tin cá nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Tên hiển thị</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background"
                          defaultValue={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                          placeholder="Nhập tên hiển thị"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground"
                          value={user?.email || ''}
                          disabled
                        />
                      </div>
                    </div>
                    <Button variant="outline">
                      Cập nhật thông tin
                    </Button>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Bảo mật
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Đổi mật khẩu</h4>
                        <p className="text-sm text-muted-foreground">Cập nhật mật khẩu tài khoản</p>
                      </div>
                      <Button variant="outline">
                        Đổi mật khẩu
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Xác thực 2 bước</h4>
                        <p className="text-sm text-muted-foreground">Tăng cường bảo mật tài khoản</p>
                      </div>
                      <Button variant="outline">
                        Thiết lập
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Thông báo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email thông báo</h4>
                          <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                        </div>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Cảnh báo hạn mức</h4>
                          <p className="text-sm text-muted-foreground">Thông báo khi sắp hết hạn mức</p>
                        </div>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Báo cáo hàng tuần</h4>
                          <p className="text-sm text-muted-foreground">Tóm tắt hoạt động hàng tuần</p>
                        </div>
                        <input type="checkbox" className="toggle" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-500">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Vùng nguy hiểm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-500/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-500">Đăng xuất tất cả thiết bị</h4>
                        <p className="text-sm text-muted-foreground">Đăng xuất khỏi tất cả thiết bị khác</p>
                      </div>
                      <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                        Đăng xuất
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-red-500/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-500">Xóa tài khoản</h4>
                        <p className="text-sm text-muted-foreground">Xóa vĩnh viễn tài khoản và tất cả dữ liệu</p>
                      </div>
                      <Button variant="destructive">
                        Xóa tài khoản
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <OnboardingTour 
        runTour={showOnboarding}
        onTourEnd={handleOnboardingEnd}
      />
    </div>
  );
}