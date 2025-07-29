import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, AlertTriangle, BarChart, Save } from 'lucide-react';

interface NotificationSettings {
  email_notifications: boolean;
  usage_alerts: boolean;
  weekly_reports: boolean;
  security_alerts: boolean;
  marketing_emails: boolean;
  system_updates: boolean;
}

export function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    usage_alerts: true,
    weekly_reports: false,
    security_alerts: true,
    marketing_emails: false,
    system_updates: true,
  });

  useEffect(() => {
    if (user) {
      loadNotificationSettings();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    try {
      // For now, use local storage as fallback until table is created
      const savedSettings = localStorage.getItem(`notification_settings_${user?.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // For now, save to local storage as fallback
      localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(settings));

      toast({
        title: "Đã lưu cài đặt",
        description: "Cài đặt thông báo đã được cập nhật thành công."
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu cài đặt",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Cài đặt thông báo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <Label className="font-medium">Email thông báo</Label>
                <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
              </div>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(value) => updateSetting('email_notifications', value)}
            />
          </div>

          {/* Usage Alerts */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <Label className="font-medium">Cảnh báo hạn mức</Label>
                <p className="text-sm text-muted-foreground">Thông báo khi sắp hết hạn mức sử dụng</p>
              </div>
            </div>
            <Switch
              checked={settings.usage_alerts}
              onCheckedChange={(value) => updateSetting('usage_alerts', value)}
            />
          </div>

          {/* Weekly Reports */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart className="w-5 h-5 text-green-500" />
              <div>
                <Label className="font-medium">Báo cáo hàng tuần</Label>
                <p className="text-sm text-muted-foreground">Tóm tắt hoạt động và thống kê hàng tuần</p>
              </div>
            </div>
            <Switch
              checked={settings.weekly_reports}
              onCheckedChange={(value) => updateSetting('weekly_reports', value)}
            />
          </div>

          {/* Security Alerts */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-red-500" />
              <div>
                <Label className="font-medium">Cảnh báo bảo mật</Label>
                <p className="text-sm text-muted-foreground">Thông báo về hoạt động bảo mật</p>
              </div>
            </div>
            <Switch
              checked={settings.security_alerts}
              onCheckedChange={(value) => updateSetting('security_alerts', value)}
            />
          </div>

          {/* Marketing Emails */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-500" />
              <div>
                <Label className="font-medium">Email marketing</Label>
                <p className="text-sm text-muted-foreground">Nhận email về tính năng mới và khuyến mãi</p>
              </div>
            </div>
            <Switch
              checked={settings.marketing_emails}
              onCheckedChange={(value) => updateSetting('marketing_emails', value)}
            />
          </div>

          {/* System Updates */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <Label className="font-medium">Cập nhật hệ thống</Label>
                <p className="text-sm text-muted-foreground">Thông báo về cập nhật và bảo trì hệ thống</p>
              </div>
            </div>
            <Switch
              checked={settings.system_updates}
              onCheckedChange={(value) => updateSetting('system_updates', value)}
            />
          </div>
        </div>

        <Button onClick={saveSettings} disabled={saving} className="w-full">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}