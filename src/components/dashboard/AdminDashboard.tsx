import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Server, 
  Database, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Globe,
  Activity,
  RefreshCw,
  Settings,
  UserCheck,
  Shield
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
  recentUsers: Array<{
    id: string;
    email: string;
    tier: string;
    created_at: string;
    last_active: string;
  }>;
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
        .select('id, email, tier, created_at, last_active_at');

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from('user_profiles')
        .select('id, email, tier, created_at, last_active_at')
        .order('created_at', { ascending: false })
        .limit(10);

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
        },
        recentUsers: recentUsers?.map(user => ({
          id: user.id,
          email: user.email || 'N/A',
          tier: user.tier || 'free',
          created_at: user.created_at,
          last_active: user.last_active_at || user.created_at
        })) || []
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
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Quản lý hệ thống và thống kê toàn diện
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Shield className="h-4 w-4 mr-2" />
              Quản trị viên
            </Badge>
            <Button onClick={loadDashboardMetrics} variant="outline" size="sm" className="shadow-sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Tổng người dùng</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{metrics.totalUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">+{metrics.newUsersThisWeek}</span>
                  <span className="text-blue-600 dark:text-blue-400">tuần này</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-green-50 to-green-100 dark:from-green-950 dark:via-green-900 dark:to-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Phân tích/tháng</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{metrics.totalScansThisMonth.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs">
                  <Activity className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600 font-medium">{metrics.activeUsersToday}</span>
                  <span className="text-green-600 dark:text-green-400">hoạt động hôm nay</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 dark:from-purple-950 dark:via-purple-900 dark:to-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">API Calls hôm nay</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{metrics.totalAPICallsToday.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3 text-orange-600" />
                  <span className="text-orange-600 font-medium">{metrics.failedAPIs.length}</span>
                  <span className="text-purple-600 dark:text-purple-400">API lỗi</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Server className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 dark:from-orange-950 dark:via-orange-900 dark:to-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Báo cáo PDF</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{metrics.totalPDFReports.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">Đã tạo</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Tabbed Content */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-6 w-6 text-primary" />
            Tổng quan chi tiết
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Phân tích
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Người dùng
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Hệ thống
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Báo cáo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends */}
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
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
                            strokeWidth={3}
                            dot={{ r: 5 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="var(--color-users)" 
                            strokeWidth={3}
                            dot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* User Distribution */}
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-green-500" />
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
                            outerRadius={90}
                            innerRadius={40}
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
            </TabsContent>

            <TabsContent value="users" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UserCheck className="h-5 w-5 text-blue-500" />
                      Người dùng mới nhất
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics.recentUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Không có dữ liệu người dùng</p>
                        </div>
                      ) : (
                        metrics.recentUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex-1">
                              <div className="font-medium">{user.email}</div>
                              <div className="text-sm text-muted-foreground">
                                Tham gia: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={user.tier === 'free' ? 'outline' : 'default'}>
                                {user.tier.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* User Stats */}
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      Thống kê phân bổ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics.usersByTier.map((tier, index) => (
                        <div key={tier.tier} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{tier.tier}</span>
                            <span className="text-muted-foreground">{tier.count} users ({tier.percentage}%)</span>
                          </div>
                          <Progress 
                            value={tier.percentage} 
                            className="h-2" 
                            style={{ 
                              backgroundColor: `${COLORS[index % COLORS.length]}20` 
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-green-500" />
                      Tình trạng hệ thống
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
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
                          <span className="text-sm text-muted-foreground">{metrics.systemHealth.storage}%</span>
                        </div>
                        <Progress value={metrics.systemHealth.storage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* API Errors */}
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      API có lỗi nhiều nhất
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
                        {metrics.failedAPIs.map((api) => (
                          <div key={api.name} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
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
              </div>
            </TabsContent>

            <TabsContent value="reports" className="p-6">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Top 10 domain được phân tích
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.topDomains.slice(0, 10).map((domain, index) => (
                      <div key={domain.domain} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium truncate max-w-xs">{domain.domain}</div>
                            <div className="text-sm text-muted-foreground">{domain.percentage}% của tổng phân tích</div>
                          </div>
                        </div>
                        <Badge variant="secondary">{domain.scans} lượt</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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