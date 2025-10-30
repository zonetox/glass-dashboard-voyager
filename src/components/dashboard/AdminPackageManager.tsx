import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminFeatureManager } from './AdminFeatureManager';
import { AdminPackageCreator } from './AdminPackageCreator';
import { 
  Package, 
  Plus, 
  Settings, 
  Users, 
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  Edit3,
  Trash2,
  DollarSign,
  Sliders
} from 'lucide-react';

interface PackageStats {
  totalPackages: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  conversionRate: number;
  popularPackages: Array<{
    name: string;
    subscribers: number;
    revenue: number;
  }>;
}

export function AdminPackageManager() {
  const [stats, setStats] = useState<PackageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPackageStats();
  }, []);

  const loadPackageStats = async () => {
    try {
      setLoading(true);

      // Fetch real data from subscription system
      const [packagesData, subscriptionsData] = await Promise.all([
        supabase.from('subscription_packages').select('*'),
        supabase.from('user_subscriptions').select('*').eq('status', 'active')
      ]);

      // Calculate stats
      const totalPackages = packagesData.data?.length || 0;
      const activeSubscriptions = subscriptionsData.data?.length || 0;
      
      // Calculate real revenue from payment_orders
      const { data: payments } = await supabase
        .from('payment_orders')
        .select('amount, status, created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(new Date().setDate(1)).toISOString()); // This month

      const monthlyRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      
      // Calculate conversion rate from total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      const conversionRate = totalUsers && totalUsers > 0 
        ? (activeSubscriptions / totalUsers) * 100 
        : 0;

      // Get popular packages with real data
      const { data: packageStats } = await supabase
        .from('user_subscriptions')
        .select('package_id, subscription_packages(name, price_vnd)')
        .eq('status', 'active');

      const packageMap = new Map();
      packageStats?.forEach(sub => {
        const pkg = (sub as any).subscription_packages;
        if (pkg) {
          const current = packageMap.get(pkg.name) || { name: pkg.name, subscribers: 0, revenue: 0, price: pkg.price_vnd };
          current.subscribers += 1;
          current.revenue += pkg.price_vnd || 0;
          packageMap.set(pkg.name, current);
        }
      });

      const popularPackages = Array.from(packageMap.values())
        .sort((a, b) => b.subscribers - a.subscribers)
        .slice(0, 3);

      setStats({
        totalPackages,
        activeSubscriptions,
        monthlyRevenue,
        conversionRate,
        popularPackages
      });

    } catch (error) {
      console.error('Error loading package stats:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải thống kê gói",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thống kê gói...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Không thể tải thống kê gói</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Quản lý Gói & Tính năng
          </h2>
          <p className="text-muted-foreground">Quản lý gói dịch vụ, tính năng và cấu hình giá cả</p>
        </div>
        <Button onClick={loadPackageStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tải lại
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="packages">Quản lý gói</TabsTrigger>
          <TabsTrigger value="features">Cấu hình tính năng</TabsTrigger>
          <TabsTrigger value="create">Tạo gói mới</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Packages</p>
                <p className="text-2xl font-bold">{stats.totalPackages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString('vi-VN')} VND</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Popular Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.popularPackages.map((pkg, index) => (
              <div key={pkg.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium">{pkg.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {pkg.subscribers} subscribers
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {pkg.revenue.toLocaleString('vi-VN')} VND
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monthly revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Manage Plans</div>
                <div className="text-sm text-muted-foreground">
                  Configure pricing and features
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-medium">View Orders</div>
                <div className="text-sm text-muted-foreground">
                  Monitor subscription orders
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">User Management</div>
                <div className="text-sm text-muted-foreground">
                  Manage user subscriptions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Revenue chart will be displayed here</p>
              <p className="text-sm text-muted-foreground mt-1">
                Integration with charts library needed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="packages">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Danh sách gói hiện tại</h3>
              <Button asChild>
                <a href="/admin/plans" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Chỉnh sửa chi tiết
                </a>
              </Button>
            </div>
            
            <div className="grid gap-4">
              {/* Package list would go here */}
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    Các gói hiện tại đang được quản lý trong trang 
                    <a href="/admin/plans" className="text-primary hover:underline ml-1">
                      Admin Plans
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <AdminFeatureManager />
        </TabsContent>

        <TabsContent value="create">
          <AdminPackageCreator onPackageCreated={loadPackageStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}