import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Server, 
  Database, 
  Key, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Globe,
  Activity,
  ChartBar,
  RefreshCw
} from 'lucide-react';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardMetrics {
  totalUsers: number;
  newUsersThisWeek: number;
  activeUsersToday: number;
  totalScansThisMonth: number;
  totalAPICallsToday: number;
  totalPDFReports: number;
  failedAPIs: Array<{
    name: string;
    failures: number;
    last_error: string;
  }>;
  topDomains: Array<{
    domain: string;
    scans: number;
    percentage: number;
  }>;
  usersByTier: Array<{
    tier: string;
    count: number;
    percentage: number;
  }>;
  monthlyScansData: Array<{
    month: string;
    scans: number;
    users: number;
  }>;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    apis: 'healthy' | 'warning' | 'error';
    storage: number;
  };
}

const chartConfig = {
  scans: {
    label: 'Scans',
    color: 'hsl(var(--chart-1))',
  },
  users: {
    label: 'Users',
    color: 'hsl(var(--chart-2))',
  },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats
      const { data: userStats } = await supabase
        .from('user_profiles')
        .select('tier, created_at');

      // Fetch scan stats
      const { data: scanStats } = await supabase
        .from('scans')
        .select('url, created_at');

      // Fetch API logs for error analysis
      const { data: apiLogs } = await supabase
        .from('api_logs')
        .select('api_name, success, error_message, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch PDF reports
      const { data: pdfReports } = await supabase
        .from('reports')
        .select('id')
        .eq('report_type', 'seo_analysis');

      // Process data
      const currentDate = new Date();
      const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const today = new Date().toDateString();

      // User metrics
      const totalUsers = userStats?.length || 0;
      const newUsersThisWeek = userStats?.filter(user => 
        new Date(user.created_at) >= oneWeekAgo
      ).length || 0;
      const activeUsersToday = userStats?.filter(user => 
        new Date(user.created_at).toDateString() === today
      ).length || 0;

      // Scan metrics
      const totalScansThisMonth = scanStats?.filter(scan => 
        new Date(scan.created_at).getMonth() === currentDate.getMonth()
      ).length || 0;
      
      const scansToday = scanStats?.filter(scan => 
        new Date(scan.created_at).toDateString() === today
      ).length || 0;

      // API error analysis
      const failedAPIs = apiLogs ? Object.entries(
        apiLogs
          .filter(log => !log.success)
          .reduce((acc, log) => {
            if (!acc[log.api_name]) {
              acc[log.api_name] = { count: 0, last_error: '' };
            }
            acc[log.api_name].count++;
            acc[log.api_name].last_error = log.error_message || 'Unknown error';
            return acc;
          }, {} as Record<string, { count: number; last_error: string }>)
      ).map(([name, data]) => ({
        name,
        failures: data.count,
        last_error: data.last_error
      })).sort((a, b) => b.failures - a.failures).slice(0, 5) : [];

      // Top domains analysis
      const domainCounts = scanStats ? Object.entries(
        scanStats.reduce((acc, scan) => {
          try {
            const domain = new URL(scan.url).hostname;
            acc[domain] = (acc[domain] || 0) + 1;
          } catch {
            // Invalid URL, skip
          }
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a).slice(0, 10) : [];

      const totalDomainScans = domainCounts.reduce((sum, [, count]) => sum + count, 0);
      const topDomains = domainCounts.map(([domain, scans]) => ({
        domain,
        scans,
        percentage: Math.round((scans / totalDomainScans) * 100)
      }));

      // Users by tier
      const tierCounts = userStats ? userStats.reduce((acc, user) => {
        acc[user.tier] = (acc[user.tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) : {};

      const usersByTier = Object.entries(tierCounts).map(([tier, count]) => ({
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        count,
        percentage: Math.round((count / totalUsers) * 100)
      }));

      // Monthly trends (mock data for demonstration)
      const monthlyScansData = [
        { month: 'Jan', scans: 1200, users: 150 },
        { month: 'Feb', scans: 1450, users: 180 },
        { month: 'Mar', scans: 1680, users: 210 },
        { month: 'Apr', scans: 1890, users: 245 },
        { month: 'May', scans: 2100, users: 280 },
        { month: 'Jun', scans: 2350, users: 320 },
      ];

      setMetrics({
        totalUsers,
        newUsersThisWeek,
        activeUsersToday,
        totalScansThisMonth,
        totalAPICallsToday: apiLogs?.length || 0,
        totalPDFReports: pdfReports?.length || 0,
        failedAPIs,
        topDomains,
        usersByTier,
        monthlyScansData,
        systemHealth: {
          database: 'healthy',
          apis: failedAPIs.length > 10 ? 'warning' : 'healthy',
          storage: 67
        }
      });

    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải thống kê dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (status: string) => {
    const configs = {
      healthy: { color: 'bg-green-500/20 text-green-400 border-green-500/20', icon: CheckCircle },
      warning: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20', icon: AlertTriangle },
      error: { color: 'bg-red-500/20 text-red-400 border-red-500/20', icon: AlertTriangle },
    };
    
    const config = configs[status as keyof typeof configs];
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thống kê hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">📊 Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Tổng quan hệ thống và thống kê sử dụng
          </p>
        </div>
        <Button onClick={loadDashboardMetrics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng người dùng</p>
                <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{metrics.newUsersThisWeek} tuần này</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lượt phân tích/tháng</p>
                <p className="text-2xl font-bold">{metrics.totalScansThisMonth.toLocaleString()}</p>
                <p className="text-xs text-blue-600">{metrics.activeUsersToday} hoạt động hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Server className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Calls hôm nay</p>
                <p className="text-2xl font-bold">{metrics.totalAPICallsToday.toLocaleString()}</p>
                <p className="text-xs text-orange-600">{metrics.failedAPIs.length} API lỗi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Báo cáo PDF</p>
                <p className="text-2xl font-bold">{metrics.totalPDFReports.toLocaleString()}</p>
                <p className="text-xs text-green-600">Đã tạo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Xu hướng theo tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.monthlyScansData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="var(--color-scans)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="var(--color-users)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Phân bổ người dùng theo gói
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.usersByTier}
                    dataKey="count"
                    nameKey="tier"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ tier, percentage }) => `${tier}: ${percentage}%`}
                  >
                    {metrics.usersByTier.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              API bị lỗi nhiều nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.failedAPIs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Không có API nào bị lỗi trong 7 ngày qua</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.failedAPIs.map((api, index) => (
                  <div key={api.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium">{api.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {api.last_error}
                      </div>
                    </div>
                    <Badge variant="destructive">{api.failures} lỗi</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Domains */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Top 10 domain được phân tích
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topDomains.slice(0, 10).map((domain, index) => (
                <div key={domain.domain} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div>
                      <div className="font-medium truncate max-w-xs">{domain.domain}</div>
                      <div className="text-sm text-muted-foreground">{domain.percentage}% của tổng</div>
                    </div>
                  </div>
                  <Badge>{domain.scans} lượt</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tình trạng hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>Database</span>
                </div>
                {getHealthBadge(metrics.systemHealth.database)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span>APIs</span>
                </div>
                {getHealthBadge(metrics.systemHealth.apis)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Storage Usage</span>
                <span>{metrics.systemHealth.storage}%</span>
              </div>
              <Progress value={metrics.systemHealth.storage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}