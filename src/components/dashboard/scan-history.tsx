import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { History, Download, FileText, Trash2, Eye, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useScanHistory } from '@/hooks/useScanHistory';
import ScanHistoryComponent from '@/components/dashboard/ScanHistory';
import { getScanResults, downloadScanData } from '@/lib/user-management';
import type { Tables } from '@/integrations/supabase/types';

interface ScanResult {
  id: string;
  website_url: string;
  seo_score: number | null;
  issues_count: number | null;
  created_at: string;
  status: string;
  scan_data_path: string | null;
  optimization_log_path: string | null;
  pdf_report_path: string | null;
}

type Scan = Tables<"scans">;

export function ScanHistory() {
  const { user } = useAuth();
  const { scans: aiScans, loading: aiScansLoading } = useScanHistory(user?.id || null);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [viewingData, setViewingData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ai-analysis' | 'legacy-scans'>('ai-analysis');
  const { toast } = useToast();

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      const results = await getScanResults();
      setScanResults(results || []);
    } catch (error) {
      console.error('Error loading scan history:', error);
      toast({
        title: "Error",
        description: "Failed to load scan history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const viewScanData = async (scan: ScanResult) => {
    if (!scan.scan_data_path) {
      toast({
        title: "No Data",
        description: "No scan data available for this scan",
        variant: "destructive"
      });
      return;
    }

    try {
      const data = await downloadScanData(scan.scan_data_path);
      setSelectedScan(scan);
      setViewingData(data);
    } catch (error) {
      console.error('Error viewing scan data:', error);
      toast({
        title: "Error",
        description: "Failed to load scan data",
        variant: "destructive"
      });
    }
  };

  const deleteScan = async (scanId: string) => {
    try {
      const { error } = await supabase
        .from('scan_results')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      setScanResults(prev => prev.filter(scan => scan.id !== scanId));
      toast({
        title: "Success",
        description: "Scan deleted successfully"
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

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-500';
    if (score <= 40) return 'bg-red-500';
    if (score <= 70) return 'bg-yellow-500';
    if (score <= 90) return 'bg-green-500';
    return 'bg-purple-500';
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return 'Unknown';
    if (score <= 40) return 'Critical';
    if (score <= 70) return 'Average';
    if (score <= 90) return 'Good';
    return 'Excellent';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-white">Loading scan history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              📜 Lịch sử phân tích SEO
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadScanHistory();
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ai-analysis' | 'legacy-scans')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai-analysis">🤖 AI Analysis</TabsTrigger>
              <TabsTrigger value="legacy-scans">📊 Legacy Scans</TabsTrigger>
            </TabsList>

            <TabsContent value="ai-analysis" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI SEO Analysis History</h3>
                {aiScansLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Đang tải...</div>
                  </div>
                ) : (
                  <ScanHistoryComponent scans={aiScans} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="legacy-scans" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Legacy Scan Results</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Loading scan history...</div>
                  </div>
                ) : scanResults.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No scan history found</p>
                    <p className="text-sm text-muted-foreground">Start analyzing websites to see your scan history here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scanResults.map((scan) => (
                      <div key={scan.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{formatDate(scan.created_at)}</span>
                            </div>
                            <Badge 
                              className={scan.status === 'completed' ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}
                            >
                              {scan.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewScanData(scan)}
                              disabled={!scan.scan_data_path}
                              className="gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteScan(scan.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="font-medium">{scan.website_url}</div>
                          
                          <div className="flex items-center gap-4">
                            {scan.seo_score !== null && (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <span className="text-sm text-muted-foreground">SEO Score:</span>
                                <Badge variant="secondary">
                                  {scan.seo_score}/100 ({getScoreLabel(scan.seo_score)})
                                </Badge>
                              </div>
                            )}
                            
                            {scan.issues_count !== null && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Issues:</span>
                                <Badge variant="destructive">
                                  {scan.issues_count}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {scan.seo_score !== null && (
                            <Progress 
                              value={scan.seo_score} 
                              className="h-2 mt-2"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedScan && viewingData && (
        <Card className="border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Scan Details: {selectedScan.website_url}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedScan(null);
                  setViewingData(null);
                }}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="issues">
                  Issues
                </TabsTrigger>
                <TabsTrigger value="recommendations">
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Performance Metrics</h4>
                    <div className="space-y-2">
                      {viewingData.performanceMetrics && Object.entries(viewingData.performanceMetrics).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">SEO Metrics</h4>
                    <div className="space-y-2">
                      {viewingData.seoMetrics && Object.entries(viewingData.seoMetrics).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-medium">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                {viewingData.issues && viewingData.issues.length > 0 ? (
                  <div className="space-y-3">
                    {viewingData.issues.map((issue: any, index: number) => (
                      <div key={index} className="border border-destructive/20 rounded-lg p-3 bg-destructive/5">
                        <div className="flex items-start gap-3">
                          <Badge variant="destructive" className="mt-0.5">
                            {issue.severity || 'Medium'}
                          </Badge>
                          <div className="flex-1">
                            <h5 className="font-medium mb-1">{issue.title || issue.type}</h5>
                            <p className="text-sm text-muted-foreground">{issue.description || issue.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No issues found in this scan</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                {viewingData.recommendations && viewingData.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {viewingData.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="border border-primary/20 rounded-lg p-3 bg-primary/5">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium mb-1">{rec.title || 'Recommendation'}</h5>
                            <p className="text-sm text-muted-foreground">{rec.description || rec}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recommendations available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}