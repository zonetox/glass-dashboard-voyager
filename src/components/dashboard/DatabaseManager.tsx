import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  HardDrive,
  Activity,
  Zap
} from 'lucide-react';

interface DatabaseStats {
  totalTables: number;
  totalRows: number;
  databaseSize: string;
  connectionPool: {
    active: number;
    idle: number;
    max: number;
  };
  recentQueries: Array<{
    query: string;
    duration: number;
    timestamp: string;
    status: 'success' | 'error';
  }>;
  tableStats: Array<{
    table: string;
    rows: number;
    size: string;
    lastModified: string;
  }>;
}

export function DatabaseManager() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      setLoading(true);
      
      // Get table statistics
      const tables = [
        'user_profiles', 'scans', 'user_plans', 'user_usage', 
        'reports', 'api_logs', 'alerts', 'rankings'
      ];
      
      const tableStatsPromises = tables.map(async (table) => {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        return {
          table,
          rows: count || 0,
          size: `${Math.round((count || 0) * 1.2 / 1024)}KB`, // Estimated
          lastModified: new Date().toISOString()
        };
      });

      const tableStats = await Promise.all(tableStatsPromises);
      const totalRows = tableStats.reduce((sum, stat) => sum + stat.rows, 0);

      // Mock connection pool data (would come from database monitoring)
      const connectionPool = {
        active: Math.floor(Math.random() * 10) + 5,
        idle: Math.floor(Math.random() * 15) + 10,
        max: 50
      };

      // Mock recent queries
      const recentQueries = [
        {
          query: 'SELECT COUNT(*) FROM scans WHERE created_at > NOW() - INTERVAL \'1 hour\'',
          duration: 45,
          timestamp: new Date().toISOString(),
          status: 'success' as const
        },
        {
          query: 'SELECT * FROM user_profiles ORDER BY created_at DESC LIMIT 10',
          duration: 23,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: 'success' as const
        },
        {
          query: 'UPDATE user_usage SET scans_used = scans_used + 1 WHERE user_id = ?',
          duration: 12,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          status: 'success' as const
        }
      ];

      setStats({
        totalTables: tables.length,
        totalRows,
        databaseSize: `${Math.round(totalRows * 2.5 / 1024)}MB`,
        connectionPool,
        recentQueries,
        tableStats
      });

    } catch (error) {
      console.error('Error loading database stats:', error);
      toast({
        title: "Lỗi tải thống kê",
        description: "Không thể tải thống kê database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập câu lệnh SQL",
        variant: "destructive"
      });
      return;
    }

    // Only allow SELECT queries for safety
    if (!sqlQuery.trim().toLowerCase().startsWith('select')) {
      toast({
        title: "Không được phép",
        description: "Chỉ cho phép câu lệnh SELECT",
        variant: "destructive"
      });
      return;
    }

    try {
      setExecuting(true);
      const startTime = Date.now();
      
      const { data, error } = await supabase.rpc('execute_admin_query', {
        query: sqlQuery
      });

      const duration = Date.now() - startTime;

      if (error) throw error;

      setQueryResult({
        data,
        duration,
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      toast({
        title: "Thực thi thành công",
        description: `Câu lệnh hoàn thành trong ${duration}ms`
      });

    } catch (error: any) {
      console.error('Query execution error:', error);
      setQueryResult({
        error: error.message,
        duration: 0,
        timestamp: new Date().toISOString(),
        status: 'error'
      });
      
      toast({
        title: "Lỗi thực thi",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setExecuting(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thống kê database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Management
          </h2>
          <p className="text-muted-foreground">Monitor and manage database performance</p>
        </div>
        <Button onClick={loadDatabaseStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tables</p>
                <p className="text-2xl font-bold">{stats.totalTables}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rows</p>
                <p className="text-2xl font-bold">{stats.totalRows.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Database Size</p>
                <p className="text-2xl font-bold">{stats.databaseSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{stats.connectionPool.active}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.connectionPool.idle} idle / {stats.connectionPool.max} max
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Pool Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Connection Pool Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Active Connections</span>
                <span className="text-sm font-medium">
                  {stats.connectionPool.active} / {stats.connectionPool.max}
                </span>
              </div>
              <Progress 
                value={(stats.connectionPool.active / stats.connectionPool.max) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-lg font-bold text-green-600">{stats.connectionPool.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{stats.connectionPool.idle}</p>
                <p className="text-xs text-muted-foreground">Idle</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <p className="text-lg font-bold text-gray-600">{stats.connectionPool.max}</p>
                <p className="text-xs text-muted-foreground">Max</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Table Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.tableStats.map((table) => (
              <div key={table.table} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{table.table}</div>
                  <div className="text-sm text-muted-foreground">
                    Last modified: {new Date(table.lastModified).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{table.rows.toLocaleString()} rows</div>
                  <div className="text-sm text-muted-foreground">{table.size}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SQL Query Executor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            SQL Query Executor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="SELECT * FROM user_profiles LIMIT 10;"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="min-h-[100px] font-mono"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                ⚠️ Only SELECT queries are allowed for safety
              </p>
              <Button 
                onClick={executeQuery} 
                disabled={executing || !sqlQuery.trim()}
                size="sm"
              >
                {executing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Query Result */}
          {queryResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Query Result</h4>
                <Badge className={queryResult.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {queryResult.status === 'success' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {queryResult.status}
                </Badge>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                {queryResult.status === 'success' ? (
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(queryResult.data, null, 2)}
                  </pre>
                ) : (
                  <p className="text-red-600 text-sm">{queryResult.error}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Query Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentQueries.map((query, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <code className="text-sm bg-background px-2 py-1 rounded font-mono break-all">
                    {query.query}
                  </code>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(query.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant={query.status === 'success' ? 'default' : 'destructive'}>
                    {query.duration}ms
                  </Badge>
                  {query.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}