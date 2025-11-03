import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Shield,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  Calendar,
  Clock,
  Eye,
  Package,
  CreditCard,
  ChevronRight
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
      
      // Call secure admin-metrics edge function (server-side validation)
      const { data, error } = await supabase.functions.invoke('admin-metrics');

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from admin-metrics');
      }

      setMetrics(data);

    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: error.message === 'Insufficient permissions' 
          ? "Bạn không có quyền truy cập trang này" 
          : "Không thể tải thống kê dashboard",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 bg-clip-text text-transparent dark:from-slate-100 dark:via-blue-300 dark:to-purple-300">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Tổng quan hệ thống và quản lý người dùng
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200 dark:border-blue-800">
                <Crown className="h-4 w-4 mr-2 text-blue-600" />
                Super Admin
              </Badge>
              <Button onClick={loadDashboardMetrics} variant="outline" size="sm" className="shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20">
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500/5 via-blue-500/10 to-blue-600/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tổng người dùng</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">+{metrics.newUsersThisWeek}</span>
                    </div>
                    <span className="text-xs text-slate-500">tuần này</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-500/5 via-green-500/10 to-green-600/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Phân tích/tháng</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.totalScansThisMonth.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Activity className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">{metrics.activeUsersToday}</span>
                    </div>
                    <span className="text-xs text-slate-500">hoạt động hôm nay</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500/5 via-purple-500/10 to-purple-600/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">API Calls hôm nay</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.totalAPICallsToday.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <AlertTriangle className="h-3 w-3 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700 dark:text-orange-400">{metrics.failedAPIs.length}</span>
                    </div>
                    <span className="text-xs text-slate-500">API lỗi</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Server className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-500/5 via-orange-500/10 to-orange-600/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Báo cáo PDF</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.totalPDFReports.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">Hoạt động</span>
                    </div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabbed Content */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 rounded-none border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30">
                <TabsTrigger value="overview" className="flex items-center gap-2 py-4">
                  <TrendingUp className="h-4 w-4" />
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 py-4">
                  <Users className="h-4 w-4" />
                  Người dùng
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex items-center gap-2 py-4">
                  <Package className="h-4 w-4" />
                  Gói dịch vụ
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2 py-4">
                  <Activity className="h-4 w-4" />
                  Hệ thống
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2 py-4">
                  <BarChart3 className="h-4 w-4" />
                  Phân tích
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-8 space-y-8">
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

              <TabsContent value="users" className="p-8 space-y-6">
                <div className="space-y-6">
                  {/* Users Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý người dùng</h3>
                      <p className="text-slate-600 dark:text-slate-400">Quản lý tài khoản và quyền hạn người dùng</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input placeholder="Tìm kiếm người dùng..." className="pl-10 w-80" />
                      </div>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm người dùng
                      </Button>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Tổng người dùng</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.totalUsers}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">Hoạt động hôm nay</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{metrics.activeUsersToday}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Mới tuần này</p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{metrics.newUsersThisWeek}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Users Table */}
                  <Card className="border-0 shadow-xl">
                    <CardHeader className="border-b bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Danh sách người dùng</CardTitle>
                        <div className="flex items-center gap-2">
                          <Select defaultValue="all">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tất cả</SelectItem>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800/30">
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Gói dịch vụ</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Hoạt động gần nhất</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {metrics.recentUsers.slice(0, 10).map((user) => (
                            <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                      {user.email.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
                                    <p className="text-sm text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={user.tier === 'premium' ? 'default' : user.tier === 'enterprise' ? 'secondary' : 'outline'}
                                  className={`
                                    ${user.tier === 'premium' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                                    ${user.tier === 'enterprise' ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' : ''}
                                  `}
                                >
                                  {user.tier === 'free' && <span>Free</span>}
                                  {user.tier === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                                  {user.tier === 'enterprise' && <Shield className="h-3 w-3 mr-1" />}
                                  {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Clock className="h-4 w-4" />
                                  {new Date(user.last_active).toLocaleDateString('vi-VN')}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="packages" className="p-8 space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý gói dịch vụ</h3>
                      <p className="text-slate-600 dark:text-slate-400">Cấu hình gói dịch vụ và tính năng</p>
                    </div>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                      <Package className="h-4 w-4 mr-2" />
                      Tạo gói mới
                    </Button>
                  </div>

                  {/* Package Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {metrics.usersByTier.map((tier, index) => (
                      <Card key={tier.tier} className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Gói {tier.tier}</p>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">{tier.count}</p>
                              <p className="text-sm text-slate-500">{tier.percentage}% tổng số</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                              {tier.tier === 'Free' && <Package className="h-6 w-6 text-white" />}
                              {tier.tier === 'Premium' && <Crown className="h-6 w-6 text-white" />}
                              {tier.tier === 'Enterprise' && <Shield className="h-6 w-6 text-white" />}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Quick Navigation to Package Management */}
                  <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white">Quản lý gói dịch vụ nâng cao</h4>
                          <p className="text-slate-600 dark:text-slate-400">Cấu hình chi tiết tính năng, giá cả và giới hạn cho từng gói</p>
                        </div>
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" size="lg">
                          Quản lý gói
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="system" className="p-8 space-y-6">
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

              <TabsContent value="analytics" className="p-8 space-y-6">
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
      </div>
    </div>
  );
}