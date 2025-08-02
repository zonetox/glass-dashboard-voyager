import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  Shield, 
  Activity,
  CreditCard,
  CheckCircle2,
  XCircle,
  Crown,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

interface UserData {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  plan_name: string;
  scans_used: number;
  scans_limit: number;
  tier: string;
  email_verified: boolean;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  user_email: string;
}

interface Transaction {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  plan_id: string;
  description: string;
  created_at: string;
  user_email: string;
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadUsers(),
        loadActivities(),
        loadTransactions()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Get users with their plan information from profiles
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          tier,
          scans_limit,
          email_verified,
          created_at,
          user_usage(scans_used),
          user_plans(
            plan_id,
            plans(name)
          )
        `);

      if (usersError) throw usersError;

      // Transform data for display
      const transformedUsers = usersData?.map((profile: any) => {
        const planInfo = profile.user_plans?.[0];
        const usageInfo = profile.user_usage?.[0];
        
        return {
          id: profile.user_id,
          email: `user-${profile.user_id.slice(0, 8)}@system.local`, // Mock email for privacy
          email_confirmed_at: profile.email_verified ? profile.created_at : null,
          created_at: profile.created_at,
          last_sign_in_at: profile.created_at, // Mock last sign in
          plan_name: planInfo?.plans?.name || planInfo?.plan_id || 'free',
          scans_used: usageInfo?.scans_used || 0,
          scans_limit: profile.scans_limit || 10,
          tier: profile.tier || 'free',
          email_verified: profile.email_verified || false
        };
      }) || [];

      setUsers(transformedUsers);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: "❌ Lỗi", 
        description: "Không thể tải danh sách người dùng",
        variant: "destructive"
      });
    }
  };

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform activities with mock emails for privacy
      const activitiesWithEmails = (data || []).map((activity) => ({
        ...activity,
        user_email: `user-${activity.user_id.slice(0, 8)}@system.local`
      }));

      setActivities(activitiesWithEmails);
    } catch (error: any) {
      console.error('Error loading activities:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform transactions with user emails
      const transactionsWithEmails = (data || []).map((transaction) => ({
        ...transaction,
        user_email: transaction.user_email || `user-${transaction.user_id.slice(0, 8)}@system.local`,
        currency: 'VND',
        plan_id: transaction.package_id,
        description: `Payment for ${transaction.package_id} package`
      }));

      setTransactions(transactionsWithEmails);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan_name.toLowerCase().includes(planFilter.toLowerCase());
    return matchesSearch && matchesPlan;
  });

  const getStatusBadge = (user: UserData) => {
    if (user.email_confirmed_at) {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">✅ Verified</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">⚠️ Unverified</Badge>;
  };

  const getPlanBadge = (planName: string) => {
    if (planName.includes('Pro')) {
      return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
        <Crown className="h-3 w-3 mr-1" />
        {planName}
      </Badge>;
    }
    return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
      {planName}
    </Badge>;
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Quản lý người dùng</h2>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Người dùng ({users.length})
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Activity className="h-4 w-4 mr-2" />
            Hoạt động ({activities.length})
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <CreditCard className="h-4 w-4 mr-2" />
            Giao dịch ({transactions.length})
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Danh sách người dùng
              </CardTitle>
              
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Tìm email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Gói" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Gói</TableHead>
                    <TableHead>Sử dụng</TableHead>
                    <TableHead>Đăng ký</TableHead>
                    <TableHead>Hoạt động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        {getPlanBadge(user.plan_name)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.scans_used}/{user.scans_limit} lượt
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {format(new Date(user.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {user.last_sign_in_at ? 
                          format(new Date(user.last_sign_in_at), 'dd/MM HH:mm') : 
                          'Chưa đăng nhập'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Nhật ký hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Hành động</TableHead>
                    <TableHead>Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(activity.created_at), 'HH:mm dd/MM')}
                      </TableCell>
                      <TableCell>{activity.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.action}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {activity.details ? JSON.stringify(activity.details) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Lịch sử giao dịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Gói</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Mã GD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(transaction.created_at), 'HH:mm dd/MM')}
                      </TableCell>
                      <TableCell>{transaction.user_email}</TableCell>
                      <TableCell>{transaction.plan_id}</TableCell>
                      <TableCell>
                        {(transaction.amount / 100).toLocaleString('vi-VN')} {transaction.currency}
                      </TableCell>
                      <TableCell>
                        {getTransactionStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaction.transaction_id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}