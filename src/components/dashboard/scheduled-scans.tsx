import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Trash2, Edit, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ScheduledScan {
  id: string;
  website_url: string;
  frequency_days: number;
  next_scan_at: string;
  last_scan_at: string | null;
  is_active: boolean;
  auto_optimize: boolean;
  email_alerts: boolean;
  created_at: string;
}

export function ScheduledScans() {
  const [scans, setScans] = useState<ScheduledScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newScan, setNewScan] = useState({
    website_url: '',
    frequency_days: 7,
    auto_optimize: false,
    email_alerts: true
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchScheduledScans();
    }
  }, [user]);

  const fetchScheduledScans = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_scans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error fetching scheduled scans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scheduled scans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createScheduledScan = async () => {
    if (!newScan.website_url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive"
      });
      return;
    }

    try {
      const nextScanDate = new Date();
      nextScanDate.setDate(nextScanDate.getDate() + newScan.frequency_days);

      const { error } = await supabase
        .from('scheduled_scans')
        .insert({
          user_id: user?.id,
          website_url: newScan.website_url,
          frequency_days: newScan.frequency_days,
          next_scan_at: nextScanDate.toISOString(),
          auto_optimize: newScan.auto_optimize,
          email_alerts: newScan.email_alerts,
          is_active: true
        });

      if (error) throw error;

      await fetchScheduledScans();
      setShowCreateDialog(false);
      setNewScan({
        website_url: '',
        frequency_days: 7,
        auto_optimize: false,
        email_alerts: true
      });

      toast({
        title: "Success",
        description: "Scheduled scan created successfully"
      });
    } catch (error) {
      console.error('Error creating scheduled scan:', error);
      toast({
        title: "Error",
        description: "Failed to create scheduled scan",
        variant: "destructive"
      });
    }
  };

  const toggleScanStatus = async (scanId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .update({ is_active: !isActive })
        .eq('id', scanId);

      if (error) throw error;
      await fetchScheduledScans();

      toast({
        title: "Success",
        description: `Scan ${!isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating scan status:', error);
      toast({
        title: "Error",
        description: "Failed to update scan status",
        variant: "destructive"
      });
    }
  };

  const deleteScan = async (scanId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled scan?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;
      await fetchScheduledScans();

      toast({
        title: "Success",
        description: "Scheduled scan deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast({
        title: "Error",
        description: "Failed to delete scan",
        variant: "destructive"
      });
    }
  };

  const getFrequencyText = (days: number) => {
    if (days === 1) return 'Daily';
    if (days === 7) return 'Weekly';
    if (days === 30) return 'Monthly';
    return `Every ${days} days`;
  };

  const getNextScanText = (nextScanAt: string) => {
    const date = new Date(nextScanAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    return 'Overdue';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading scheduled scans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Scheduled Scans</h2>
          <p className="text-gray-400">Automate regular SEO audits for your websites</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Schedule New Scan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Schedule New Scan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="websiteUrl" className="text-white">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={newScan.website_url}
                  onChange={(e) => setNewScan({ ...newScan, website_url: e.target.value })}
                  placeholder="https://example.com"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="frequency" className="text-white">Scan Frequency</Label>
                <Select
                  value={newScan.frequency_days.toString()}
                  onValueChange={(value) => setNewScan({ ...newScan, frequency_days: parseInt(value) })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Daily</SelectItem>
                    <SelectItem value="7">Weekly</SelectItem>
                    <SelectItem value="14">Bi-weekly</SelectItem>
                    <SelectItem value="30">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoOptimize" className="text-white">Auto-optimize after scan</Label>
                <Switch
                  id="autoOptimize"
                  checked={newScan.auto_optimize}
                  onCheckedChange={(checked) => setNewScan({ ...newScan, auto_optimize: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="emailAlerts" className="text-white">Email alerts</Label>
                <Switch
                  id="emailAlerts"
                  checked={newScan.email_alerts}
                  onCheckedChange={(checked) => setNewScan({ ...newScan, email_alerts: checked })}
                />
              </div>

              <Button onClick={createScheduledScan} className="w-full bg-blue-500 hover:bg-blue-600">
                Create Scheduled Scan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {scans.length === 0 ? (
        <Card className="glass-card border-white/10">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Scheduled Scans</h3>
            <p className="text-gray-400 mb-4">
              Set up automated SEO scans to monitor your websites regularly
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Your First Scan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scans.map((scan) => (
            <Card key={scan.id} className="glass-card border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{scan.website_url}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getFrequencyText(scan.frequency_days)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {getNextScanText(scan.next_scan_at)}
                        </span>
                        {scan.last_scan_at && (
                          <span>Last: {new Date(scan.last_scan_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        scan.is_active 
                          ? 'bg-green-500/20 text-green-400 border-green-500/20'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/20'
                      }`}>
                        {scan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      {scan.auto_optimize && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">
                          Auto-optimize
                        </Badge>
                      )}
                      
                      {scan.email_alerts && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20">
                          Email alerts
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={scan.is_active}
                        onCheckedChange={() => toggleScanStatus(scan.id, scan.is_active)}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteScan(scan.id)}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}