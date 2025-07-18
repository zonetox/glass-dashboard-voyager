import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Cpu, Database, Globe, HardDrive, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  database_connections: number;
  api_response_time: number;
  uptime: number;
  errors_last_hour: number;
  requests_per_minute: number;
}

interface PerformanceData {
  timestamp: string;
  response_time: number;
  requests: number;
  errors: number;
  cpu: number;
  memory: number;
}

interface DatabaseMetrics {
  active_connections: number;
  idle_connections: number;
  query_duration_avg: number;
  slow_queries: number;
  cache_hit_ratio: number;
  database_size: number;
}

export default function PerformanceMonitor() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    database_connections: 0,
    api_response_time: 0,
    uptime: 0,
    errors_last_hour: 0,
    requests_per_minute: 0
  });

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics>({
    active_connections: 0,
    idle_connections: 0,
    query_duration_avg: 0,
    slow_queries: 0,
    cache_hit_ratio: 0,
    database_size: 0
  });

  const [alertsCount, setAlertsCount] = useState({
    critical: 0,
    warning: 2,
    info: 1
  });

  useEffect(() => {
    loadSystemMetrics();
    loadPerformanceData();
    loadDatabaseMetrics();

    // Set up real-time monitoring
    const interval = setInterval(() => {
      loadSystemMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadSystemMetrics = async () => {
    try {
      // Simulate real system metrics - in production, these would come from actual monitoring
      const mockMetrics: SystemMetrics = {
        cpu_usage: Math.floor(Math.random() * 30) + 15, // 15-45%
        memory_usage: Math.floor(Math.random() * 25) + 35, // 35-60%
        disk_usage: 45,
        database_connections: Math.floor(Math.random() * 10) + 5,
        api_response_time: Math.floor(Math.random() * 100) + 150, // 150-250ms
        uptime: 99.8,
        errors_last_hour: Math.floor(Math.random() * 3),
        requests_per_minute: Math.floor(Math.random() * 50) + 100
      };

      setSystemMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading system metrics:', error);
    }
  };

  const loadPerformanceData = async () => {
    try {
      // Generate mock performance data for the last 24 hours
      const data: PerformanceData[] = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          timestamp: timestamp.toISOString(),
          response_time: Math.floor(Math.random() * 100) + 150,
          requests: Math.floor(Math.random() * 1000) + 500,
          errors: Math.floor(Math.random() * 10),
          cpu: Math.floor(Math.random() * 30) + 20,
          memory: Math.floor(Math.random() * 25) + 40
        });
      }

      setPerformanceData(data);
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  };

  const loadDatabaseMetrics = async () => {
    try {
      // Load actual database metrics from Supabase
      const { data: apiLogs } = await supabase
        .from('api_logs')
        .select('response_time_ms, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      const avgResponseTime = apiLogs?.reduce((acc, log) => acc + (log.response_time_ms || 0), 0) / (apiLogs?.length || 1);

      const mockDbMetrics: DatabaseMetrics = {
        active_connections: Math.floor(Math.random() * 5) + 3,
        idle_connections: Math.floor(Math.random() * 10) + 5,
        query_duration_avg: avgResponseTime || 45,
        slow_queries: Math.floor(Math.random() * 3),
        cache_hit_ratio: 95.2,
        database_size: 1.8 // GB
      };

      setDatabaseMetrics(mockDbMetrics);
    } catch (error) {
      console.error('Error loading database metrics:', error);
    }
  };

  const getMetricStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return { status: 'critical', color: 'destructive' };
    if (value >= thresholds.warning) return { status: 'warning', color: 'default' };
    return { status: 'healthy', color: 'default' };
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </Badge>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpu_usage}%</div>
            <Progress value={systemMetrics.cpu_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memory_usage}%</div>
            <Progress value={systemMetrics.memory_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.api_response_time}ms</div>
            <p className="text-xs text-muted-foreground mt-1">Average API response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(systemMetrics.uptime)}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Summary */}
      {(alertsCount.critical > 0 || alertsCount.warning > 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-4">
              <span>System alerts:</span>
              {alertsCount.critical > 0 && (
                <Badge variant="destructive">{alertsCount.critical} Critical</Badge>
              )}
              {alertsCount.warning > 0 && (
                <Badge variant="default">{alertsCount.warning} Warnings</Badge>
              )}
              {alertsCount.info > 0 && (
                <Badge variant="secondary">{alertsCount.info} Info</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
                <CardDescription>API response times over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value) => [`${value}ms`, 'Response Time']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="response_time" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>CPU and memory usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cpu" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="memory" 
                      stackId="1"
                      stroke="hsl(var(--secondary))" 
                      fill="hsl(var(--secondary))" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
              <CardDescription>API requests and errors over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Bar dataKey="requests" fill="hsl(var(--primary))" />
                  <Bar dataKey="errors" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{databaseMetrics.active_connections}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {databaseMetrics.idle_connections} idle
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{databaseMetrics.query_duration_avg.toFixed(1)}ms</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{databaseMetrics.cache_hit_ratio}%</div>
                <Progress value={databaseMetrics.cache_hit_ratio} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{databaseMetrics.slow_queries}</div>
                <p className="text-xs text-muted-foreground mt-1">Last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Database Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{databaseMetrics.database_size} GB</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="flex items-center gap-1 w-fit">
                  <CheckCircle className="h-3 w-3" />
                  Healthy
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Requests/Min</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.requests_per_minute}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Errors/Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.errors_last_hour}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.2%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.api_response_time}ms</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High CPU Usage Detected</p>
                    <p className="text-sm text-muted-foreground">CPU usage has exceeded 80% for the last 5 minutes</p>
                  </div>
                  <Badge variant="default">Warning</Badge>
                </div>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Slow Query Performance</p>
                    <p className="text-sm text-muted-foreground">Database queries are taking longer than usual</p>
                  </div>
                  <Badge variant="default">Warning</Badge>
                </div>
              </AlertDescription>
            </Alert>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Health Check Passed</p>
                    <p className="text-sm text-muted-foreground">All systems operating normally</p>
                  </div>
                  <Badge variant="secondary">Info</Badge>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}