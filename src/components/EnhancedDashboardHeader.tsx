import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { MobileNavigation } from '@/components/ui/mobile-navigation';
import { Search, User, Settings, LogOut, Crown, Zap, Globe, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardHeaderProps {
  onAnalyze?: (url: string) => void;
}

export function EnhancedDashboardHeader({ onAnalyze }: DashboardHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  const [remainingScans, setRemainingScanns] = useState(0);
  
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!user) return;
      
      try {
        const { data: usageData } = await supabase.functions.invoke('get-user-current-plan', {
          body: { user_id: user.id }
        });
        
        if (usageData) {
          setRemainingScanns(usageData.remaining_count || 0);
        }
      } catch (error) {
        console.error('Error fetching usage data:', error);
        setRemainingScanns(10); // Fallback
      }
    };
    
    fetchUsageData();
  }, [user]);
  const userPlan = 'Pro Plan';

  const handleAnalyze = () => {
    if (!url.trim()) return;
    
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    onAnalyze?.(formattedUrl);
    setUrl('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAccount = () => {
    navigate('/dashboard?tab=account');
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'Free Plan': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'Pro Plan': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Agency Plan': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Free Plan': return <User className="h-3 w-3" />;
      case 'Pro Plan': return <Crown className="h-3 w-3" />;
      case 'Agency Plan': return <Zap className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  return (
    <header className="glass-nav h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 border-b border-white/10">
      {/* Left Section */}
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger className="hidden md:flex text-white hover:bg-white/10" />
        <MobileNavigation />
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Globe className="h-3 w-3 md:h-5 md:w-5 text-white" />
          </div>
          <span className="font-bold text-white text-base md:text-lg">SEO AI</span>
        </div>
      </div>

      {/* Center Section - Domain Input */}
      <div className="hidden sm:flex flex-1 max-w-md mx-2 md:mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập domain cần phân tích..."
            className="pl-10 pr-16 md:pr-20 bg-white/5 border-white/20 focus:border-blue-400 text-white placeholder:text-gray-400 text-sm"
          />
          <Button
            onClick={handleAnalyze}
            disabled={!url.trim()}
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white h-7 px-2 md:px-3 text-xs md:text-sm"
          >
            <span className="hidden md:inline">Phân tích</span>
            <span className="md:hidden">Go</span>
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Remaining Scans */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/20">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-white font-medium">{remainingScans}</span>
          <span className="text-xs text-gray-400">lượt còn lại</span>
        </div>
        
        {/* Mobile Scan Counter */}
        <div className="lg:hidden flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full border border-white/20">
          <Zap className="h-3 w-3 text-yellow-400" />
          <span className="text-xs text-white font-medium">{remainingScans}</span>
        </div>

        {/* User Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 md:gap-3 hover:bg-white/10 text-white px-2 md:px-3 py-2 h-8 md:h-10">
              <Avatar className="h-6 w-6 md:h-8 md:w-8 border-2 border-blue-400/50">
                <AvatarFallback className="bg-blue-600 text-white text-xs md:text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPlanBadgeColor(userPlan)}>
                    {getPlanIcon(userPlan)}
                    <span className="ml-1">{userPlan}</span>
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 truncate max-w-32">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            align="end" 
            className="w-64 bg-gray-900/95 backdrop-blur-sm border-gray-700 z-50 mr-2"
          >
            {/* User Info Header */}
            <div className="px-3 py-2 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email}
                  </p>
                  <Badge variant="outline" className={getPlanBadgeColor(userPlan)}>
                    {getPlanIcon(userPlan)}
                    <span className="ml-1">{userPlan}</span>
                  </Badge>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span>{remainingScans} lượt phân tích còn lại</span>
              </div>
            </div>

            {/* Menu Items */}
            <DropdownMenuItem onClick={handleAccount} className="text-gray-300 hover:text-white hover:bg-gray-700">
              <User className="h-4 w-4 mr-2" />
              Tài khoản của tôi
            </DropdownMenuItem>
            
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt
            </DropdownMenuItem>

            <DropdownMenuItem className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10">
              <Crown className="h-4 w-4 mr-2" />
              Nâng cấp gói
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-700" />
            
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}