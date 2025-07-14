import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Eye, RefreshCw, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface ApiLog {
  id: string;
  api_name: string;
  domain: string | null;
  method: string;
  endpoint: string | null;
  status_code: number | null;
  response_time_ms: number | null;
  success: boolean;
  error_message: string | null;
  request_payload: any;
  response_data: any;
  created_at: string;
}

export function ApiLogsDebugPanel() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredLogs, setFilteredLogs] = useState<ApiLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [apiFilter, setApiFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadApiLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, statusFilter, apiFilter]);

  const loadApiLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('api_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error loading API logs:', error);
      toast({
        title: "❌ Lỗi",
        description: "Không thể tải logs API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.api_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.error_message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'success') {
        filtered = filtered.filter(log => log.success);
      } else if (statusFilter === 'error') {
        filtered = filtered.filter(log => !log.success);
      } else if (statusFilter === '2xx') {
        filtered = filtered.filter(log => log.status_code && log.status_code >= 200 && log.status_code < 300);
      } else if (statusFilter === '4xx') {
        filtered = filtered.filter(log => log.status_code && log.status_code >= 400 && log.status_code < 500);
      } else if (statusFilter === '5xx') {
        filtered = filtered.filter(log => log.status_code && log.status_code >= 500);
      }
    }

    // API filter
    if (apiFilter !== 'all') {
      filtered = filtered.filter(log => log.api_name === apiFilter);
    }

    setFilteredLogs(filtered);
  };

  const getStatusBadge = (log: ApiLog) => {
    if (log.success && log.status_code && log.status_code < 300) {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">✅ Success</Badge>;
    } else if (log.status_code && log.status_code >= 400 && log.status_code < 500) {
      return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">⚠️ 4xx</Badge>;
    } else if (log.status_code && log.status_code >= 500) {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">❌ 5xx</Badge>;
    } else if (log.error_message?.includes('timeout')) {
      return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">⏰ Timeout</Badge>;
    } else {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">❌ Error</Badge>;
    }
  };

  const uniqueApis = [...new Set(logs.map(log => log.api_name))];

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Đang tải logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          API Logs & Debug ({filteredLogs.length}/{logs.length})
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Tìm domain, API, lỗi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="2xx">2xx</SelectItem>
              <SelectItem value="4xx">4xx</SelectItem>
              <SelectItem value="5xx">5xx</SelectItem>
            </SelectContent>
          </Select>

          <Select value={apiFilter} onValueChange={setApiFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="API" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả API</SelectItem>
              {uniqueApis.map(api => (
                <SelectItem key={api} value={api}>{api}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={loadApiLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>API</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(log.created_at), 'HH:mm:ss dd/MM')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.api_name}</Badge>
                  </TableCell>
                  <TableCell className="max-w-32 truncate">
                    {log.domain || '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log)}
                    {log.status_code && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {log.status_code}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {log.response_time_ms ? `${log.response_time_ms}ms` : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Chi tiết API Log - {log.api_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Thông tin cơ bản</h4>
                              <div className="space-y-1 text-sm">
                                <div><strong>API:</strong> {log.api_name}</div>
                                <div><strong>Domain:</strong> {log.domain || '-'}</div>
                                <div><strong>Method:</strong> {log.method}</div>
                                <div><strong>Endpoint:</strong> {log.endpoint || '-'}</div>
                                <div><strong>Status:</strong> {log.status_code || '-'}</div>
                                <div><strong>Time:</strong> {log.response_time_ms ? `${log.response_time_ms}ms` : '-'}</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Kết quả</h4>
                              <div className="space-y-2">
                                {getStatusBadge(log)}
                                {log.error_message && (
                                  <div className="p-2 bg-red-500/10 rounded text-sm text-red-300">
                                    <strong>Lỗi:</strong> {log.error_message}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {log.request_payload && (
                            <div>
                              <h4 className="font-medium mb-2">Request Payload</h4>
                              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(log.request_payload, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {log.response_data && (
                            <div>
                              <h4 className="font-medium mb-2">Response Data</h4>
                              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(log.response_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không có logs nào phù hợp với bộ lọc
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}