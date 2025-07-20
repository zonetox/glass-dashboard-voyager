import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Settings, Users, Key, Database, Activity, Package, Info, BarChart3 } from 'lucide-react';
import { APIHealthPanel } from '@/components/dashboard/api-health-panel';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { AdminTestRunner } from '@/components/dashboard/admin-test-runner';
import AdvancedAdminControls from '@/components/dashboard/AdvancedAdminControls';
import TwoFactorAuth from '@/components/dashboard/TwoFactorAuth';
import ContentWorkflowManager from '@/components/dashboard/ContentWorkflowManager';
import PerformanceMonitor from '@/components/dashboard/PerformanceMonitor';

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

interface UserData {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string;
}

export default function Admin() {
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Kiểm tra quyền admin
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('setting_key');
      
      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Get users with their roles
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at
        `);
      
      if (error) throw error;
      
      // For demo, we'll just show the role data we have
      const usersData = data?.map(item => ({
        id: item.user_id,
        email: `user-${item.user_id.slice(0, 8)}@example.com`, // Mock email
        role: item.role,
        created_at: item.created_at,
        last_sign_in_at: item.created_at
      })) || [];
      
      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateSetting = async (settingKey: string, value: string) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', settingKey);
      
      if (error) throw error;
      
      setSettings(prev => prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, setting_value: value }
          : setting
      ));
      
      toast({
        title: "Setting updated",
        description: `${settingKey} has been updated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating setting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      
      toast({
        title: "User role updated",
        description: `User role has been changed to ${newRole}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating user role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-gray-300">Manage system settings and users</p>
            </div>
            <Badge variant="default" className="bg-red-600">
              <Settings className="h-4 w-4 mr-1" />
              Administrator
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-300">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link 
                  to="/admin/plans" 
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-white font-medium">Quản lý Gói</div>
                    <div className="text-sm text-gray-400">Cấu hình gói dịch vụ và giá cả</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <TooltipProvider>
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-11 bg-white/10">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="test-runner" className="data-[state=active]:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                Kiểm thử
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white/20">
                <Key className="h-4 w-4 mr-2" />
                API Settings
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-white/20">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="database" className="data-[state=active]:bg-white/20">
                <Database className="h-4 w-4 mr-2" />
                Database
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-white/20">
                <Activity className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="api-health" className="data-[state=active]:bg-white/20">
                <Activity className="h-4 w-4 mr-2" />
                Hệ thống API
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="2fa" className="data-[state=active]:bg-white/20">
                <Key className="h-4 w-4 mr-2" />
                2FA
              </TabsTrigger>
              <TabsTrigger value="workflow" className="data-[state=active]:bg-white/20">
                <Users className="h-4 w-4 mr-2" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-white/20">
                <BarChart3 className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>

          {/* Admin Dashboard Tab */}
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          {/* Test Runner Tab */}
          <TabsContent value="test-runner">
            <AdminTestRunner />
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="settings">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">API Configuration</CardTitle>
                <CardDescription className="text-gray-300">
                  Configure API keys for external services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingSettings ? (
                  <div className="text-white">Loading settings...</div>
                ) : (
                  settings.map((setting) => (
                    <ApiSettingItem
                      key={setting.id}
                      setting={setting}
                      onUpdate={updateSetting}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Users Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage user accounts and roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-white">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{user.email}</div>
                          <div className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                          <div className="text-sm text-gray-400">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                            {user.role}
                          </Badge>
                          <select 
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as 'admin' | 'member')}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Database Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Database statistics and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-white">Database management features will be added here.</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">System Monitoring</CardTitle>
                <CardDescription className="text-gray-300">
                  Monitor system performance and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-white">Monitoring dashboard will be added here.</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Health Tab */}
          <TabsContent value="api-health">
            <div className="space-y-6">
              {/* Help Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p>Dữ liệu AI không có không có nghĩa là function aiAnalysis đang lỗi. Có thể do user chưa bật AI analysis hoặc API key chưa được cấu hình.</p>
                        </TooltipContent>
                      </Tooltip>
                      <div>
                        <h3 className="text-white font-medium">💡 AI Analysis</h3>
                        <p className="text-sm text-gray-400">Dữ liệu AI trống ≠ lỗi function</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-5 w-5 text-yellow-400 mt-0.5" />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p>Nếu không có bản ghi scans, có nghĩa function analyze-site chưa được gọi hoặc chưa hoạt động đúng cách trong 24h qua.</p>
                        </TooltipContent>
                      </Tooltip>
                      <div>
                        <h3 className="text-white font-medium">📊 Scan Records</h3>
                        <p className="text-sm text-gray-400">Không có records = chưa hoạt động</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* API Health Panel */}
              <APIHealthPanel />
            </div>
          </TabsContent>

          {/* Advanced Admin Controls */}
          <TabsContent value="advanced">
            <AdvancedAdminControls />
          </TabsContent>

          {/* Two-Factor Authentication */}
          <TabsContent value="2fa">
            <TwoFactorAuth />
          </TabsContent>

          {/* Content Workflow Management */}
          <TabsContent value="workflow">
            <ContentWorkflowManager />
          </TabsContent>

          {/* Performance Monitor */}
          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>
          </Tabs>
        </TooltipProvider>
      </div>
    </div>
  );
}

interface ApiSettingItemProps {
  setting: AdminSetting;
  onUpdate: (key: string, value: string) => void;
}

function ApiSettingItem({ setting, onUpdate }: ApiSettingItemProps) {
  const [value, setValue] = useState(setting.setting_value);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(setting.setting_key, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(setting.setting_value);
    setIsEditing(false);
  };

  return (
    <div className="space-y-3 p-4 bg-white/5 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white font-medium">{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</Label>
          <p className="text-sm text-gray-400">{setting.description}</p>
        </div>
        <Badge variant={setting.setting_value ? 'default' : 'destructive'}>
          {setting.setting_value ? 'Configured' : 'Not Set'}
        </Badge>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <Input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter API key..."
            className="bg-white/10 border-white/20 text-white"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">Save</Button>
            <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            {setting.setting_value ? '••••••••••••••••' : 'No API key configured'}
          </div>
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            {setting.setting_value ? 'Update' : 'Configure'}
          </Button>
        </div>
      )}
    </div>
  );
}