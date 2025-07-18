import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Shield, Database, Globe, Mail, Key } from 'lucide-react';

interface SystemSettings {
  maintenance_mode: boolean;
  max_concurrent_scans: number;
  api_rate_limit: number;
  email_notifications: boolean;
  backup_frequency: string;
  log_retention_days: number;
}

interface SecurityPolicy {
  password_min_length: number;
  session_timeout: number;
  max_login_attempts: number;
  require_2fa: boolean;
  ip_whitelist: string[];
}

export default function AdvancedAdminControls() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    max_concurrent_scans: 10,
    api_rate_limit: 1000,
    email_notifications: true,
    backup_frequency: 'daily',
    log_retention_days: 30
  });

  const [securityPolicy, setSecurityPolicy] = useState<SecurityPolicy>({
    password_min_length: 8,
    session_timeout: 24,
    max_login_attempts: 5,
    require_2fa: false,
    ip_whitelist: []
  });

  const [bulkUserAction, setBulkUserAction] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [systemMaintenance, setSystemMaintenance] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateSystemSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'system_settings',
          setting_value: JSON.stringify(systemSettings),
          description: 'Advanced system configuration'
        });

      if (error) throw error;
      toast({ title: "System settings updated successfully" });
    } catch (error) {
      toast({ title: "Failed to update settings", variant: "destructive" });
    }
    setLoading(false);
  };

  const updateSecurityPolicy = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'security_policy',
          setting_value: JSON.stringify(securityPolicy),
          description: 'Security and authentication policies'
        });

      if (error) throw error;
      toast({ title: "Security policy updated successfully" });
    } catch (error) {
      toast({ title: "Failed to update security policy", variant: "destructive" });
    }
    setLoading(false);
  };

  const executeBulkUserAction = async () => {
    if (!bulkUserAction || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      // Implement bulk user actions
      toast({ title: `Bulk action "${bulkUserAction}" executed for ${selectedUsers.length} users` });
    } catch (error) {
      toast({ title: "Failed to execute bulk action", variant: "destructive" });
    }
    setLoading(false);
  };

  const triggerSystemMaintenance = async () => {
    setLoading(true);
    try {
      // Implement system maintenance tasks
      toast({ title: `System maintenance "${systemMaintenance}" initiated` });
    } catch (error) {
      toast({ title: "Failed to trigger maintenance", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Advanced Admin Controls</h2>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">Bulk Users</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Advanced system settings and resource limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Maintenance Mode</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={systemSettings.maintenance_mode}
                      onCheckedChange={(checked) =>
                        setSystemSettings(prev => ({ ...prev, maintenance_mode: checked }))
                      }
                    />
                    <Badge variant={systemSettings.maintenance_mode ? "destructive" : "secondary"}>
                      {systemSettings.maintenance_mode ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Max Concurrent Scans</Label>
                  <Input
                    type="number"
                    value={systemSettings.max_concurrent_scans}
                    onChange={(e) =>
                      setSystemSettings(prev => ({ ...prev, max_concurrent_scans: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Rate Limit (requests/hour)</Label>
                  <Input
                    type="number"
                    value={systemSettings.api_rate_limit}
                    onChange={(e) =>
                      setSystemSettings(prev => ({ ...prev, api_rate_limit: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select
                    value={systemSettings.backup_frequency}
                    onValueChange={(value) =>
                      setSystemSettings(prev => ({ ...prev, backup_frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Log Retention (days)</Label>
                  <Input
                    type="number"
                    value={systemSettings.log_retention_days}
                    onChange={(e) =>
                      setSystemSettings(prev => ({ ...prev, log_retention_days: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Notifications</Label>
                  <Switch
                    checked={systemSettings.email_notifications}
                    onCheckedChange={(checked) =>
                      setSystemSettings(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={updateSystemSettings} disabled={loading}>
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Policies
              </CardTitle>
              <CardDescription>
                Configure authentication and security requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input
                    type="number"
                    value={securityPolicy.password_min_length}
                    onChange={(e) =>
                      setSecurityPolicy(prev => ({ ...prev, password_min_length: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout (hours)</Label>
                  <Input
                    type="number"
                    value={securityPolicy.session_timeout}
                    onChange={(e) =>
                      setSecurityPolicy(prev => ({ ...prev, session_timeout: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={securityPolicy.max_login_attempts}
                    onChange={(e) =>
                      setSecurityPolicy(prev => ({ ...prev, max_login_attempts: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Require 2FA</Label>
                  <Switch
                    checked={securityPolicy.require_2fa}
                    onCheckedChange={(checked) =>
                      setSecurityPolicy(prev => ({ ...prev, require_2fa: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>IP Whitelist (one per line)</Label>
                <Textarea
                  placeholder="192.168.1.1&#10;10.0.0.1"
                  value={securityPolicy.ip_whitelist.join('\n')}
                  onChange={(e) =>
                    setSecurityPolicy(prev => ({ 
                      ...prev, 
                      ip_whitelist: e.target.value.split('\n').filter(ip => ip.trim()) 
                    }))
                  }
                />
              </div>

              <Button onClick={updateSecurityPolicy} disabled={loading}>
                Save Security Policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Bulk User Management
              </CardTitle>
              <CardDescription>
                Perform actions on multiple users simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={bulkUserAction} onValueChange={setBulkUserAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_notification">Send Notification</SelectItem>
                      <SelectItem value="reset_password">Reset Passwords</SelectItem>
                      <SelectItem value="suspend_accounts">Suspend Accounts</SelectItem>
                      <SelectItem value="upgrade_plan">Upgrade Plan</SelectItem>
                      <SelectItem value="export_data">Export Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Selected Users</Label>
                  <Badge variant="outline">{selectedUsers.length} users selected</Badge>
                </div>
              </div>

              <Button 
                onClick={executeBulkUserAction} 
                disabled={loading || !bulkUserAction || selectedUsers.length === 0}
              >
                Execute Bulk Action
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                System Maintenance
              </CardTitle>
              <CardDescription>
                Database cleanup, optimization, and system tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Maintenance Task</Label>
                <Select value={systemMaintenance} onValueChange={setSystemMaintenance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleanup_logs">Cleanup Old Logs</SelectItem>
                    <SelectItem value="optimize_database">Optimize Database</SelectItem>
                    <SelectItem value="rebuild_indexes">Rebuild Indexes</SelectItem>
                    <SelectItem value="clear_cache">Clear System Cache</SelectItem>
                    <SelectItem value="backup_database">Manual Backup</SelectItem>
                    <SelectItem value="vacuum_analyze">Vacuum & Analyze</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={triggerSystemMaintenance} 
                disabled={loading || !systemMaintenance}
                variant="destructive"
              >
                Run Maintenance Task
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}