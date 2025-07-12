
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
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Calendar,
  Mail,
  Shield
} from 'lucide-react';

const navigationItems = [
  { title: 'Overview', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Analyzer', url: '/dashboard?tab=analyzer', icon: BarChart3 },
  { title: 'Writer', url: '/dashboard?tab=writer', icon: FileText },
  { title: 'Meta Tags', url: '/dashboard?tab=meta-optimizer', icon: Settings },
  { title: 'FAQ Schema', url: '/dashboard?tab=faq-generator', icon: Calendar },
  { title: 'Full Score', url: '/dashboard?tab=full-score', icon: Shield },
  { title: 'History', url: '/dashboard?tab=scan-history', icon: Mail },
  { title: 'Progress', url: '/dashboard?tab=progress', icon: Users },
  { title: 'Usage', url: '/dashboard?tab=usage', icon: BarChart3 },
  { title: 'Competitors', url: '/dashboard?tab=competitors', icon: Users },
  { title: 'Scheduled', url: '/dashboard?tab=scheduled', icon: Calendar },
  { title: 'Admin', url: '/dashboard?tab=admin', icon: Settings },
  { title: 'API', url: '/dashboard?tab=api', icon: Users },
];

export function DashboardSidebar() {
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
      ? "bg-blue-600/20 text-blue-300 border-r-2 border-blue-400" 
      : "hover:bg-white/5 text-gray-300 hover:text-white";

  const handleNavigate = (url: string) => {
    navigate(url);
  };

  return (
    <Sidebar className="glass-sidebar w-64 transition-all duration-300">
      <SidebarContent className="p-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => handleNavigate(item.url)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left
                        ${getNavClasses(isActive(item.url))}
                      `}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
