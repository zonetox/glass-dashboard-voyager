
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Mail, Zap, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ScheduledScan = Database['public']['Tables']['scheduled_scans']['Row'];

export function ScheduledScans() {
  const [scans, setScans] = useState<ScheduledScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [newScan, setNewScan] = useState({
    website_url: '',
    frequency_days: 30,
    email_alerts: true,
    auto_optimize: false
  });

  useEffect(() => {
    loadScheduledScans();
  }, []);

  const loadScheduledScans = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error loading scheduled scans:', error);
      toast.error('Failed to load scheduled scans');
    } finally {
      setLoading(false);
    }
  };

  const createScheduledScan = async () => {
    if (!newScan.website_url.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const nextScanDate = new Date();
      nextScanDate.setDate(nextScanDate.getDate() + newScan.frequency_days);

      const { error } = await supabase
        .from('scheduled_scans')
        .insert({
          user_id: user.id,
          website_url: newScan.website_url,
          frequency_days: newScan.frequency_days,
          email_alerts: newScan.email_alerts,
          auto_optimize: newScan.auto_optimize,
          next_scan_at: nextScanDate.toISOString()
        });

      if (error) throw error;

      toast.success('Scheduled scan created successfully');
      setNewScan({
        website_url: '',
        frequency_days: 30,
        email_alerts: true,
        auto_optimize: false
      });
      loadScheduledScans();
    } catch (error) {
      console.error('Error creating scheduled scan:', error);
      toast.error('Failed to create scheduled scan');
    }
  };

  const toggleScan = async (scanId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .update({ is_active: !isActive })
        .eq('id', scanId);

      if (error) throw error;
      loadScheduledScans();
      toast.success(`Scan ${!isActive ? 'activated' : 'paused'}`);
    } catch (error) {
      console.error('Error toggling scan:', error);
      toast.error('Failed to update scan');
    }
  };

  const deleteScan = async (scanId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;
      loadScheduledScans();
      toast.success('Scheduled scan deleted');
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast.error('Failed to delete scan');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading scheduled scans...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Scheduled Scans</h2>
        <p className="text-gray-600">Automate regular SEO monitoring and optimization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Schedule New Scan
          </CardTitle>
          <CardDescription>
            Set up automated rescanning for your websites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website-url">Website URL</Label>
            <Input
              id="website-url"
              value={newScan.website_url}
              onChange={(e) => setNewScan(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="frequency">Scan Frequency</Label>
            <Select
              value={newScan.frequency_days.toString()}
              onValueChange={(value) => setNewScan(prev => ({ ...prev, frequency_days: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Weekly (7 days)</SelectItem>
                <SelectItem value="14">Bi-weekly (14 days)</SelectItem>
                <SelectItem value="30">Monthly (30 days)</SelectItem>
                <SelectItem value="60">Bi-monthly (60 days)</SelectItem>
                <SelectItem value="90">Quarterly (90 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <Label htmlFor="email-alerts">Email Alerts</Label>
            </div>
            <Switch
              id="email-alerts"
              checked={newScan.email_alerts}
              onCheckedChange={(checked) => setNewScan(prev => ({ ...prev, email_alerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <Label htmlFor="auto-optimize">Auto-optimize on Issues</Label>
            </div>
            <Switch
              id="auto-optimize"
              checked={newScan.auto_optimize}
              onCheckedChange={(checked) => setNewScan(prev => ({ ...prev, auto_optimize: checked }))}
            />
          </div>

          <Button onClick={createScheduledScan} className="w-full">
            Create Scheduled Scan
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Scheduled Scans</h3>
        
        {scans.length === 0 ? (
          <Card>
            <CardContent className="text-center p-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Scheduled Scans</h3>
              <p className="text-gray-600">Create your first scheduled scan above.</p>
            </CardContent>
          </Card>
        ) : (
          scans.map((scan) => (
            <Card key={scan.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{new URL(scan.website_url).hostname}</h4>
                    <p className="text-sm text-gray-600">
                      Every {scan.frequency_days} days
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={scan.is_active ? 'default' : 'secondary'}>
                      {scan.is_active ? 'Active' : 'Paused'}
                    </Badge>
                    <Switch
                      checked={scan.is_active || false}
                      onCheckedChange={() => toggleScan(scan.id, scan.is_active || false)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Last Scan</div>
                    <div className="font-medium">
                      {scan.last_scan_at 
                        ? new Date(scan.last_scan_at).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Next Scan</div>
                    <div className="font-medium">
                      {new Date(scan.next_scan_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email Alerts</div>
                    <div className="font-medium">
                      {scan.email_alerts ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Auto-optimize</div>
                    <div className="font-medium">
                      {scan.auto_optimize ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteScan(scan.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
