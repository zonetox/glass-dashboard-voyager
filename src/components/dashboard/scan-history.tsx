
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  History, 
  Download, 
  RefreshCw, 
  FileText,
  Calendar,
  Globe
} from 'lucide-react';
import { getScanResults, downloadScanData } from '@/lib/user-management';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ScanResult = Database['public']['Tables']['scan_results']['Row'];

interface ScanHistoryProps {
  onRescan?: (url: string) => void;
}

export function ScanHistory({ onRescan }: ScanHistoryProps) {
  const { toast } = useToast();
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScanResults();
  }, []);

  const loadScanResults = async () => {
    setIsLoading(true);
    try {
      const results = await getScanResults();
      setScanResults(results);
    } catch (error) {
      console.error('Error loading scan results:', error);
      toast({
        title: "Error",
        description: "Failed to load scan history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (scanDataPath: string, websiteUrl: string) => {
    try {
      const data = await downloadScanData(scanDataPath);
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan-${new URL(websiteUrl).hostname}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download started",
          description: "Scan data is being downloaded",
        });
      }
    } catch (error) {
      console.error('Error downloading scan data:', error);
      toast({
        title: "Download failed",
        description: "Failed to download scan data",
        variant: "destructive"
      });
    }
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

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-400" />
            Scan History
          </div>
          <Button
            onClick={loadScanResults}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading scan history...</p>
          </div>
        ) : scanResults.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium">No scans found</p>
            <p className="text-gray-400">Run your first website scan to see results here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-300">Website</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">SEO Score</TableHead>
                  <TableHead className="text-gray-300">Issues</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanResults.map((result) => (
                  <TableRow key={result.id} className="border-white/10">
                    <TableCell className="text-white font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        {new URL(result.website_url).hostname}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(result.created_at || '')}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className={`font-medium ${getScoreColor(result.seo_score)}`}>
                        {result.seo_score || 'N/A'}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className="bg-yellow-500/20 border-yellow-500/20 text-yellow-400">
                        {result.issues_count || 0} issues
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={
                        result.status === 'completed' 
                          ? 'bg-green-500/20 border-green-500/20 text-green-400'
                          : 'bg-gray-500/20 border-gray-500/20 text-gray-400'
                      }>
                        {result.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        {onRescan && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRescan(result.website_url)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {result.scan_data_path && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(result.scan_data_path!, result.website_url)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {result.pdf_report_path && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
