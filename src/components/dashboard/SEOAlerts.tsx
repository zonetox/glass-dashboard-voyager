import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Trash2,
  ExternalLink 
} from 'lucide-react';

interface Alert {
  id: string;
  domain: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  is_read: boolean;
  link?: string;
  created_at: string;
  data?: any;
}

export function SEOAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [monitoredDomains, setMonitoredDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'error' | 'warning'>('all');

  useEffect(() => {
    if (user) {
      loadAlerts();
      loadMonitoredDomains();
      
      // Set up realtime subscription for new alerts
      const channel = supabase
        .channel('seo-alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setAlerts(prev => [payload.new as Alert, ...prev]);
            showAlertNotification(payload.new as Alert);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadMonitoredDomains = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_scans')
        .select('website_url')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setMonitoredDomains(data?.map(d => d.website_url) || []);
    } catch (error) {
      console.error('Error loading monitored domains:', error);
    }
  };

  const showAlertNotification = (alert: Alert) => {
    toast({
      title: `Cảnh báo SEO: ${alert.domain}`,
      description: alert.message,
      variant: alert.severity === 'error' ? 'destructive' : 'default'
    });
  };

  const addDomain = async () => {
    if (!user || !newDomain.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập domain",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a scheduled scan for the domain (which will trigger monitoring)
      const { error } = await supabase
        .from('scheduled_scans')
        .insert({
          user_id: user.id,
          website_url: newDomain.trim(),
          frequency: 'daily',
          is_active: true,
          next_scan_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã bật monitoring cho ${newDomain}`
      });

      setNewDomain('');
      await loadMonitoredDomains();
    } catch (error) {
      console.error('Error adding domain:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm domain",
        variant: "destructive"
      });
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      await loadAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      await loadAlerts();
      
      toast({
        title: "Đã xóa",
        description: "Cảnh báo đã được xóa"
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-500 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-blue-500 bg-blue-500/10';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.is_read;
    if (filter === 'error') return alert.severity === 'error';
    if (filter === 'warning') return alert.severity === 'warning';
    return true;
  });

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">SEO Alerts</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label>Bật thông báo</Label>
          <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thêm domain để theo dõi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addDomain}>
              Thêm
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {monitoredDomains.map((domain, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {domain}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cảnh báo gần đây</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Chưa đọc
              </Button>
              <Button
                variant={filter === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('error')}
              >
                Lỗi
              </Button>
              <Button
                variant={filter === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('warning')}
              >
                Cảnh báo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Không có cảnh báo nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} ${
                    alert.is_read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{alert.domain}</span>
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.link && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={alert.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {!alert.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
