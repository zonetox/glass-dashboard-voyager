
import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { EnhancedDashboardSidebar } from './EnhancedDashboardSidebar';
import { EnhancedDashboardHeader } from './EnhancedDashboardHeader';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { toast } = useToast();

  const handleAnalyze = (url: string) => {
    toast({
      title: "🚀 Bắt đầu phân tích",
      description: `Đang phân tích ${url}...`,
    });
    // Xử lý logic phân tích ở đây
    console.log('Analyzing:', url);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <EnhancedDashboardSidebar />
        <div className="flex-1 flex flex-col">
          <EnhancedDashboardHeader onAnalyze={handleAnalyze} />
          <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
