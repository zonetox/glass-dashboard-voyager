
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function DashboardHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="glass-nav h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-white hover:bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64 bg-white/5 border-white/20 focus:border-blue-400 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"></span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Settings className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-blue-400/50">
            <AvatarFallback className="bg-blue-600 text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{user?.email}</p>
          </div>
        </div>
        
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
