import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Clock, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react';

interface ScheduledScan {
  id: string;
  website_url: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  last_scan_at?: string;
  next_scan_at?: string;
  created_at: string;
}

export function AutomatedRescans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scheduledScans, setScheduledScans] = useState<ScheduledScan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newScanUrl, setNewScanUrl] = useState('');
  const [newScanFrequency, setNewScanFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    loadScheduledScans();
  }, [user]);

  const loadScheduledScans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScheduledScans(data || []);
    } catch (error) {
      console.error('Error loading scheduled scans:', error);
    }
  };

  const createScheduledScan = async () => {
    if (!user || !newScanUrl.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập URL website",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .insert({
          user_id: user.id,
          website_url: newScanUrl.trim(),
          frequency: newScanFrequency,
          is_active: true,
          next_scan_at: getNextScanTime(newScanFrequency)
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã lên lịch quét tự động ${newScanFrequency} cho ${newScanUrl}`
      });

      setNewScanUrl('');
      await loadScheduledScans();
    } catch (error) {
      console.error('Error creating scheduled scan:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo lịch quét. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScanStatus = async (scanId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .update({ is_active: !currentStatus })
        .eq('id', scanId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Đã bật" : "Đã tắt",
        description: `Lịch quét tự động đã được ${!currentStatus ? 'kích hoạt' : 'tạm dừng'}`
      });

      await loadScheduledScans();
    } catch (error) {
      console.error('Error toggling scan status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive"
      });
    }
  };

  const runNow = async (websiteUrl: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('automated-rescan', {
        body: { websiteUrl }
      });

      if (error) throw error;

      toast({
        title: "Đã chạy quét",
        description: `Đang quét ${websiteUrl}...`
      });
    } catch (error) {
      console.error('Error running scan:', error);
      toast({
        title: "Lỗi",
        description: "Không thể chạy quét",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNextScanTime = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toISOString();
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Hàng ngày',
      weekly: 'Hàng tuần',
      monthly: 'Hàng tháng'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Lên lịch quét tự động
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label htmlFor="url">URL Website</Label>
              <input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={newScanUrl}
                onChange={(e) => setNewScanUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Tần suất</Label>
              <Select value={newScanFrequency} onValueChange={(value: any) => setNewScanFrequency(value)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Hàng ngày</SelectItem>
                  <SelectItem value="weekly">Hàng tuần</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={createScheduledScan} disabled={isLoading}>
            <Clock className="h-4 w-4 mr-2" />
            Tạo lịch quét
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Các lịch quét đã lên</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledScans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có lịch quét nào. Tạo lịch quét đầu tiên ở trên.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Website</TableHead>
                  <TableHead>Tần suất</TableHead>
                  <TableHead>Quét tiếp theo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="font-medium">{scan.website_url}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFrequencyLabel(scan.frequency)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {scan.next_scan_at ? new Date(scan.next_scan_at).toLocaleString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={scan.is_active}
                          onCheckedChange={() => toggleScanStatus(scan.id, scan.is_active)}
                        />
                        {scan.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Pause className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runNow(scan.website_url)}
                        disabled={isLoading}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Chạy ngay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
