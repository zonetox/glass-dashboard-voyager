import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Server, 
  Database, 
  Key, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';

interface SystemMetrics {
  users: {
    total: number;
    active_today: number;
    new_this_week: number;
    by_tier: { free: number; pro: number; agency: number };
  };
  usage: {
    scans_today: number;
    api_calls_today: number;
    storage_used_gb: number;
    active_tokens: number;
  };
  system: {
    database_health: 'healthy' | 'warning' | 'error';
    edge_functions_status: 'running' | 'degraded' | 'down';
    storage_usage_percent: number;
    api_response_time: number;
  };
  revenue: {
    mrr: number;
    growth_rate: number;
    churn_rate: number;
  };
}

export function AdminOverview() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      // Mock data - in real app this would fetch from admin API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        users: {
          total: 1247,
          active_today: 342,
          new_this_week: 67,
          by_tier: { free: 1089, pro: 142, agency: 16 }
        },
        usage: {
          scans_today: 1895,
          api_calls_today: 12483,
          storage_used_gb: 34.7,
          active_tokens: 89
        },
        system: {
          database_health: 'healthy',
          edge_functions_status: 'running',
          storage_usage_percent: 67,
          api_response_time: 245
        },
        revenue: {
          mrr: 12890,
          growth_rate: 8.3,
          churn_rate: 2.1
        }
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (status: string) => {
    const configs = {
      healthy: { color: 'bg-green-500/20 text-green-400 border-green-500/20', icon: CheckCircle },
      warning: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20', icon: AlertTriangle },
      error: { color: 'bg-red-500/20 text-red-400 border-red-500/20', icon: AlertTriangle },
      running: { color: 'bg-green-500/20 text-green-400 border-green-500/20', icon: CheckCircle },
      degraded: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20', icon: AlertTriangle },
      down: { color: 'bg-red-500/20 text-red-400 border-red-500/20', icon: AlertTriangle }
    };
    
    const config = configs[status as keyof typeof configs];
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{metrics.users.total.toLocaleString()}</p>
                <p className="text-xs text-green-400">+{metrics.users.new_this_week} this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Scans Today</p>
                <p className="text-2xl font-bold text-white">{metrics.usage.scans_today.toLocaleString()}</p>
                <p className="text-xs text-blue-400">{metrics.users.active_today} active users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Server className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">API Calls</p>
                <p className="text-2xl font-bold text-white">{metrics.usage.api_calls_today.toLocaleString()}</p>
                <p className="text-xs text-gray-400">{metrics.system.api_response_time}ms avg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">MRR</p>
                <p className="text-2xl font-bold text-white">${metrics.revenue.mrr.toLocaleString()}</p>
                <p className="text-xs text-green-400">+{metrics.revenue.growth_rate}% growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Distribution by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Free Tier</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{metrics.users.by_tier.free}</span>
                  <Badge className="bg-gray-500/20 text-gray-400">
                    {Math.round((metrics.users.by_tier.free / metrics.users.total) * 100)}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(metrics.users.by_tier.free / metrics.users.total) * 100} 
                className="h-2"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Pro Tier</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{metrics.users.by_tier.pro}</span>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {Math.round((metrics.users.by_tier.pro / metrics.users.total) * 100)}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(metrics.users.by_tier.pro / metrics.users.total) * 100} 
                className="h-2"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Agency Tier</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{metrics.users.by_tier.agency}</span>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {Math.round((metrics.users.by_tier.agency / metrics.users.total) * 100)}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(metrics.users.by_tier.agency / metrics.users.total) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Database</span>
                </div>
                {getHealthBadge(metrics.system.database_health)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Edge Functions</span>
                </div>
                {getHealthBadge(metrics.system.edge_functions_status)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Active API Tokens</span>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {metrics.usage.active_tokens}
                </Badge>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Storage Usage</span>
                  <span className="text-white">
                    {metrics.usage.storage_used_gb}GB ({metrics.system.storage_usage_percent}%)
                  </span>
                </div>
                <Progress value={metrics.system.storage_usage_percent} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Revenue Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold text-green-400">${metrics.revenue.mrr.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Growth Rate</p>
              <p className="text-3xl font-bold text-blue-400">{metrics.revenue.growth_rate}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Churn Rate</p>
              <p className="text-3xl font-bold text-orange-400">{metrics.revenue.churn_rate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card border-blue-500/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">System Overview Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                <p className="text-green-400 font-semibold">✅ All systems operational</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                <p className="text-blue-400 font-semibold">📈 Growth trending up</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded border border-purple-500/20">
                <p className="text-purple-400 font-semibold">🚀 Performance optimal</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded border border-orange-500/20">
                <p className="text-orange-400 font-semibold">💰 Revenue on target</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}