
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search, 
  RefreshCw, 
  Undo2, 
  TrendingUp, 
  TrendingDown,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getOptimizationHistory, 
  getOptimizationHistoryByDomain, 
  rollbackOptimization 
} from '@/lib/optimization-history';
import type { Database } from '@/integrations/supabase/types';

type OptimizationHistory = Database['public']['Tables']['optimization_history']['Row'];

interface OptimizationHistoryProps {
  onRescan?: (url: string) => void;
}

export function OptimizationHistory({ onRescan }: OptimizationHistoryProps) {
  const { toast } = useToast();
  const [history, setHistory] = useState<OptimizationHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<OptimizationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDomain, setSearchDomain] = useState('');

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getOptimizationHistory();
      setHistory(data);
      setFilteredHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: "Error",
        description: "Failed to load optimization history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDomainSearch = async (domain: string) => {
    setSearchDomain(domain);
    if (!domain.trim()) {
      setFilteredHistory(history);
      return;
    }

    try {
      const filtered = await getOptimizationHistoryByDomain(domain);
      setFilteredHistory(filtered);
    } catch (error) {
      console.error('Error filtering by domain:', error);
      toast({
        title: "Error",
        description: "Failed to filter by domain",
        variant: "destructive"
      });
    }
  };

  const handleRollback = async (historyId: string, websiteUrl: string) => {
    try {
      const success = await rollbackOptimization(historyId);
      if (success) {
        toast({
          title: "Rollback initiated",
          description: `Rollback process started for ${websiteUrl}`,
        });
        loadHistory(); // Refresh the list
      } else {
        throw new Error('Rollback failed');
      }
    } catch (error) {
      console.error('Error during rollback:', error);
      toast({
        title: "Rollback failed",
        description: "Failed to initiate rollback process",
        variant: "destructive"
      });
    }
  };

  const getScoreChange = (before: number | null, after: number | null) => {
    if (!before || !after) return null;
    const change = after - before;
    return {
      value: change,
      isPositive: change > 0,
      percentage: Math.abs((change / before) * 100).toFixed(1)
    };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <History className="h-5 w-5 text-blue-400" />
          Optimization History
        </CardTitle>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter by domain..."
              value={searchDomain}
              onChange={(e) => handleDomainSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white"
            />
          </div>
          <Button
            onClick={loadHistory}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading optimization history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium">No optimization history found</p>
            <p className="text-gray-400">Run some optimizations to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-300">Website</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">SEO Score</TableHead>
                  <TableHead className="text-gray-300">Speed Score</TableHead>
                  <TableHead className="text-gray-300">Fixes Applied</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((record) => {
                  const seoChange = getScoreChange(record.seo_score_before, record.seo_score_after);
                  const desktopChange = getScoreChange(record.desktop_speed_before, record.desktop_speed_after);
                  
                  return (
                    <TableRow key={record.id} className="border-white/10">
                      <TableCell className="text-white font-medium">
                        {new URL(record.website_url).hostname}
                      </TableCell>
                      
                      <TableCell className="text-gray-300">
                        {formatDate(record.created_at)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-white">
                            {record.seo_score_before} → {record.seo_score_after}
                          </span>
                          {seoChange && (
                            <div className={`flex items-center gap-1 ${
                              seoChange.isPositive ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {seoChange.isPositive ? 
                                <TrendingUp className="h-3 w-3" /> : 
                                <TrendingDown className="h-3 w-3" />
                              }
                              <span className="text-xs">
                                {seoChange.isPositive ? '+' : ''}{seoChange.value} ({seoChange.percentage}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-white">
                            {record.desktop_speed_before} → {record.desktop_speed_after}
                          </span>
                          {desktopChange && (
                            <div className={`flex items-center gap-1 ${
                              desktopChange.isPositive ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {desktopChange.isPositive ? 
                                <TrendingUp className="h-3 w-3" /> : 
                                <TrendingDown className="h-3 w-3" />
                              }
                              <span className="text-xs">
                                {desktopChange.isPositive ? '+' : ''}{desktopChange.value}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className="bg-blue-500/20 border-blue-500/20 text-blue-400">
                          {Array.isArray(record.fixes_applied) ? record.fixes_applied.length : 0} fixes
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={
                          record.status === 'completed' ? 'bg-green-500/20 border-green-500/20 text-green-400' :
                          record.status === 'rolled_back' ? 'bg-yellow-500/20 border-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 border-gray-500/20 text-gray-400'
                        }>
                          {record.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          {onRescan && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRescan(record.website_url)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {record.backup_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRollback(record.id, record.website_url)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Undo2 className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {record.report_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(record.report_url!, '_blank')}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
