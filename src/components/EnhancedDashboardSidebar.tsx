import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Globe,
  Brain,
  Wrench,
  Zap,
  FileText,
  User,
  Activity,
  Settings,
  Shield,
  TrendingUp,
  Target,
  Calendar,
  Users,
  Crown
} from 'lucide-react';

const navigationItems = [
  { 
    title: 'Tổng quan', 
    url: '/dashboard', 
    icon: BarChart3,
    description: 'SEO Score + lỗi/sửa',
    badge: null
  },
  { 
    title: 'Phân tích SEO', 
    url: '/dashboard?tab=analyzer', 
    icon: Globe,
    description: 'Quét và phân tích website',
    badge: null
  },
  { 
    title: 'AI Intelligence', 
    url: '/dashboard?tab=ai-analysis', 
    icon: Brain,
    description: 'Phân tích thông minh AI',
    badge: 'HOT'
  },
  { 
    title: 'Auto Fix', 
    url: '/dashboard?tab=auto-fix', 
    icon: Wrench,
    description: 'Sửa lỗi từng bước',
    badge: null
  },
  { 
    title: 'Tối ưu 1 lần', 
    url: '/dashboard?tab=one-click', 
    icon: Zap,
    description: 'Tối ưu tự động',
    badge: 'PRO'
  },
  { 
    title: 'Báo cáo PDF', 
    url: '/dashboard?tab=reports', 
    icon: FileText,
    description: 'Xuất báo cáo chi tiết',
    badge: null
  },
  { 
    title: 'Tài khoản', 
    url: '/dashboard?tab=account', 
    icon: User,
    description: 'Quản lý tài khoản',
    badge: null
  },
  { 
    title: 'API & Lỗi hệ thống', 
    url: '/dashboard?tab=api-logs', 
    icon: Activity,
    description: 'Nhật ký API & monitoring',
    badge: 'NEW'
  }
];

const advancedItems = [
  { 
    title: 'Writer AI', 
    url: '/dashboard?tab=writer', 
    icon: Brain,
    description: 'Viết nội dung AI'
  },
  { 
    title: 'Meta Tags', 
    url: '/dashboard?tab=meta-optimizer', 
    icon: Settings,
    description: 'Tối ưu meta tags'
  },
  { 
    title: 'FAQ Schema', 
    url: '/dashboard?tab=faq-generator', 
    icon: Shield,
    description: 'Tạo FAQ schema'
  },
  { 
    title: 'Full Score', 
    url: '/dashboard?tab=full-score', 
    icon: Target,
    description: 'Phân tích toàn diện'
  },
  { 
    title: 'Competitors', 
    url: '/dashboard?tab=competitors', 
    icon: TrendingUp,
    description: 'Phân tích đối thủ'
  },
  { 
    title: 'Scheduled', 
    url: '/dashboard?tab=scheduled', 
    icon: Calendar,
    description: 'Lên lịch phân tích'
  },
  { 
    title: 'History', 
    url: '/dashboard?tab=scan-history', 
    icon: BarChart3,
    description: 'Lịch sử phân tích'
  },
  { 
    title: 'Admin Panel', 
    url: '/dashboard?tab=admin', 
    icon: Crown,
    description: 'Quản trị hệ thống'
  }
];

export function EnhancedDashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const isActive = (url: string) => {
    if (url === '/dashboard') {
      return currentPath === '/dashboard' && !searchParams.get('tab');
    }
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const tabParam = urlParams.get('tab');
    return currentPath === '/dashboard' && currentTab === tabParam;
  };
  
  const getNavClasses = (isActive: boolean) =>
    isActive 
      ? "bg-blue-600/20 text-blue-300 border-r-2 border-blue-400 shadow-lg" 
      : "hover:bg-white/5 text-gray-300 hover:text-white hover:border-r-2 hover:border-gray-500/50";

  const handleNavigate = (url: string) => {
    navigate(url);
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'HOT': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'PRO': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'NEW': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Sidebar className="glass-sidebar w-72 transition-all duration-300">
      <SidebarContent className="p-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SEO AI Dashboard
              </h1>
              <p className="text-xs text-gray-400">Tối ưu website thông minh</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="h-3 w-3" />
            Chính
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => handleNavigate(item.url)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 w-full text-left
                        ${getNavClasses(isActive(item.url))}
                      `}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          {item.badge && (
                            <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getBadgeColor(item.badge)}`}>
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Advanced Tools */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Settings className="h-3 w-3" />
            Công cụ nâng cao
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {advancedItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => handleNavigate(item.url)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left
                        ${getNavClasses(isActive(item.url))}
                      `}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats */}
        <div className="mt-6 p-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-blue-500/20">
          <div className="text-xs text-gray-400 mb-2">Thống kê nhanh</div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Lượt phân tích:</span>
              <span className="text-white font-medium">15/50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Tối ưu:</span>
              <span className="text-white font-medium">3/10</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}