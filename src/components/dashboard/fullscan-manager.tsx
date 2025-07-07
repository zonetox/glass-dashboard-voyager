
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Globe, Search, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FullScanResult {
  id: string;
  root_domain: string;
  total_pages: number;
  completed_pages: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  scan_data: any[];
  summary_stats?: any;
  created_at: string;
}

export function FullScanManager() {
  const [scans, setScans] = useState<FullScanResult[]>([]);
  const [newScanUrl, setNewScanUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fullscan_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading scans:', error);
        toast.error('Failed to load scan results');
      } else {
        setScans(data || []);
      }
    } catch (error) {
      console.error('Error loading scans:', error);
      toast.error('Failed to load scan results');
    }
    setLoading(false);
  };

  const startFullScan = async () => {
    if (!newScanUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setScanning(true);
    try {
      // Call the fullscan edge function
      const { data, error } = await supabase.functions.invoke('fullscan', {
        body: { 
          rootDomain: newScanUrl.trim(),
          maxPages: 100 
        }
      });

      if (error) {
        console.error('Fullscan error:', error);
        toast.error('Failed to start full scan');
      } else {
        toast.success('Full scan started successfully');
        setNewScanUrl('');
        loadScans();
      }
    } catch (error) {
      console.error('Error starting fullscan:', error);
      toast.error('Failed to start full scan');
    }
    setScanning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'scanning': return <Search className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scanning': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading full scans...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Full Site Scan</h2>
        <p className="text-gray-600">Scan entire websites for comprehensive SEO analysis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Start New Full Scan
          </CardTitle>
          <CardDescription>
            Enter a root domain to scan up to 100 pages automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="scan-url">Root Domain</Label>
              <Input
                id="scan-url"
                value={newScanUrl}
                onChange={(e) => setNewScanUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={scanning}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={startFullScan} disabled={scanning}>
                {scanning ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Start Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Scans</h3>
        
        {scans.length === 0 ? (
          <Card>
            <CardContent className="text-center p-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Scans Yet</h3>
              <p className="text-gray-600">Start your first full site scan above.</p>
            </CardContent>
          </Card>
        ) : (
          scans.map((scan) => (
            <Card key={scan.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(scan.status)}
                    <div>
                      <h4 className="font-semibold">{scan.root_domain}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(scan.status)}>
                    {scan.status}
                  </Badge>
                </div>

                {scan.status === 'scanning' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{scan.completed_pages} / {scan.total_pages} pages</span>
                    </div>
                    <Progress 
                      value={scan.total_pages > 0 ? (scan.completed_pages / scan.total_pages) * 100 : 0} 
                    />
                  </div>
                )}

                {scan.status === 'completed' && scan.summary_stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {scan.scan_data?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Pages Scanned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {scan.summary_stats.avg_seo_score || 0}
                      </div>
                      <div className="text-sm text-gray-600">Avg SEO Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {scan.summary_stats.issues_found || 0}
                      </div>
                      <div className="text-sm text-gray-600">Issues Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {scan.summary_stats.avg_readability || 0}
                      </div>
                      <div className="text-sm text-gray-600">Avg Readability</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
