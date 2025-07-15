import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Save, Loader2 } from 'lucide-react';

interface AutoPilotConfig {
  enabled: boolean;
  frequency_days: number;
  auto_fix_seo: boolean;
  auto_update_content: boolean;
  auto_generate_schema: boolean;
  send_reports: boolean;
  backup_before_fix: boolean;
}

export function AutoPilotSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AutoPilotConfig>({
    enabled: false,
    frequency_days: 7,
    auto_fix_seo: false,
    auto_update_content: false,
    auto_generate_schema: false,
    send_reports: false,
    backup_before_fix: true,
  });

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('user_autopilot')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          enabled: data.enabled,
          frequency_days: data.frequency_days,
          auto_fix_seo: data.auto_fix_seo,
          auto_update_content: data.auto_update_content,
          auto_generate_schema: data.auto_generate_schema,
          send_reports: data.send_reports,
          backup_before_fix: data.backup_before_fix,
        });
      }
    } catch (error: any) {
      console.error('Error loading autopilot config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_autopilot')
        .upsert({
          user_id: user.id,
          ...config,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Đã lưu cài đặt",
        description: "Cài đặt Auto-Pilot SEO Mode đã được cập nhật thành công.",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getFrequencyText = (days: number) => {
    switch (days) {
      case 7: return 'tuần/lần';
      case 14: return '2 tuần/lần';
      case 30: return 'tháng/lần';
      default: return `${days} ngày/lần`;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-purple-400" />
          Auto-Pilot SEO Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
          <div>
            <Label htmlFor="autopilot-toggle" className="text-white font-medium">
              Bật chế độ tự động hóa SEO mỗi tuần
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Tự động phân tích và tối ưu website theo chu kỳ
            </p>
          </div>
          <Switch
            id="autopilot-toggle"
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
          />
        </div>

        {/* Frequency Selector */}
        <div className="space-y-3">
          <Label className="text-white font-medium">Tần suất tự động phân tích</Label>
          <Select
            value={config.frequency_days.toString()}
            onValueChange={(value) => setConfig({ ...config, frequency_days: parseInt(value) })}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Chọn tần suất" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-white/20">
              <SelectItem value="7" className="text-white hover:bg-white/10">
                Tuần/lần
              </SelectItem>
              <SelectItem value="14" className="text-white hover:bg-white/10">
                2 tuần/lần
              </SelectItem>
              <SelectItem value="30" className="text-white hover:bg-white/10">
                Tháng/lần
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Label className="text-white font-medium">Tùy chọn tự động</Label>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Checkbox
                id="auto-fix-seo"
                checked={config.auto_fix_seo}
                onCheckedChange={(checked) => setConfig({ ...config, auto_fix_seo: !!checked })}
              />
              <Label htmlFor="auto-fix-seo" className="text-white cursor-pointer">
                Tự động sửa lỗi SEO
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Checkbox
                id="auto-update-content"
                checked={config.auto_update_content}
                onCheckedChange={(checked) => setConfig({ ...config, auto_update_content: !!checked })}
              />
              <Label htmlFor="auto-update-content" className="text-white cursor-pointer">
                Tự động cập nhật nội dung bằng AI
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Checkbox
                id="auto-generate-schema"
                checked={config.auto_generate_schema}
                onCheckedChange={(checked) => setConfig({ ...config, auto_generate_schema: !!checked })}
              />
              <Label htmlFor="auto-generate-schema" className="text-white cursor-pointer">
                Tự động sinh Schema
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Checkbox
                id="send-reports"
                checked={config.send_reports}
                onCheckedChange={(checked) => setConfig({ ...config, send_reports: !!checked })}
              />
              <Label htmlFor="send-reports" className="text-white cursor-pointer">
                Gửi báo cáo định kỳ PDF
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <Checkbox
                id="backup-before-fix"
                checked={config.backup_before_fix}
                onCheckedChange={(checked) => setConfig({ ...config, backup_before_fix: !!checked })}
              />
              <Label htmlFor="backup-before-fix" className="text-white cursor-pointer">
                Backup trước khi sửa
              </Label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button 
            onClick={saveConfig} 
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu cài đặt
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}