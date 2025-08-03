import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Settings, 
  Calendar,
  Mail,
  Shield,
  Users,
  X
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

const accountItems = [
  { title: 'Account', url: '/account', icon: Users },
  { title: 'Settings', url: '/dashboard?tab=account', icon: Settings },
  { title: 'Upgrade Plan', url: '/subscription-plans', icon: Shield },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const isActive = (url: string) => {
    if (url === '/dashboard') {
      return currentPath === '/dashboard' && !searchParams.get('tab');
    }
    // Handle direct routes like /account, /subscription-plans
    if (!url.includes('?')) {
      return currentPath === url;
    }
    // Handle dashboard tabs
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const tabParam = urlParams.get('tab');
    return currentPath === '/dashboard' && currentTab === tabParam;
  };

  const handleNavigate = (url: string) => {
    navigate(url);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-80 glass-card border-white/10 p-0"
      >
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-xs text-gray-400">Mobile Menu</p>
              </div>
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <Separator className="bg-white/10" />

        <div className="px-6 py-4">
          <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
            Navigation
          </Badge>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavigate(item.url)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 w-full text-left
                  ${isActive(item.url)
                    ? "bg-blue-600/20 text-blue-300 border-r-2 border-blue-400" 
                    : "hover:bg-white/5 text-gray-300 hover:text-white"
                  }
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.title}</span>
                {isActive(item.url) && (
                  <Badge variant="secondary" className="ml-auto text-xs bg-blue-500/20 text-blue-300">
                    Active
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          <Separator className="bg-white/10 my-4" />
          
          <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4">
            Account
          </Badge>
          
          <nav className="space-y-2">
            {accountItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavigate(item.url)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 w-full text-left
                  ${isActive(item.url)
                    ? "bg-purple-600/20 text-purple-300 border-r-2 border-purple-400" 
                    : "hover:bg-white/5 text-gray-300 hover:text-white"
                  }
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.title}</span>
                {isActive(item.url) && (
                  <Badge variant="secondary" className="ml-auto text-xs bg-purple-500/20 text-purple-300">
                    Active
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}