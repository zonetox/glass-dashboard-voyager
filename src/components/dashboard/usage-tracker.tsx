import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Zap, Target, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { getUserProfile, getCurrentUsage } from '@/lib/user-management';
import { useToast } from '@/hooks/use-toast';

interface UsageStats {
  scans: { used: number; limit: number; percentage: number };
  ai_rewrites: { used: number; limit: number; percentage: number };
  optimizations: { used: number; limit: number; percentage: number };
  tier: string;
  resetDate: string;
}

export function UsageTracker() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      const [profile, usage] = await Promise.all([
        getUserProfile(),
        getCurrentUsage()
      ]);

      if (profile && usage) {
        setUsageStats({
          scans: {
            used: usage.scans_used,
            limit: profile.scans_limit,
            percentage: (usage.scans_used / profile.scans_limit) * 100
          },
          ai_rewrites: {
            used: usage.ai_rewrites_used,
            limit: profile.ai_rewrites_limit,
            percentage: (usage.ai_rewrites_used / profile.ai_rewrites_limit) * 100
          },
          optimizations: {
            used: usage.optimizations_used,
            limit: profile.optimizations_limit,
            percentage: (usage.optimizations_used / profile.optimizations_limit) * 100
          },
          tier: profile.tier,
          resetDate: usage.reset_date
        });
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
      toast({
        title: "Error",
        description: "Failed to load usage statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return { color: 'bg-red-500/20 text-red-400', text: 'Critical' };
    if (percentage >= 70) return { color: 'bg-yellow-500/20 text-yellow-400', text: 'Warning' };
    return { color: 'bg-green-500/20 text-green-400', text: 'Good' };
  };

  const formatResetDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-500/20 text-gray-400';
      case 'pro': return 'bg-blue-500/20 text-blue-400';
      case 'agency': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-white">Loading usage data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!usageStats) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-gray-400">No usage data available</div>
        </CardContent>
      </Card>
    );
  }

  const usageItems = [
    {
      name: 'Website Scans',
      icon: BarChart3,
      stats: usageStats.scans,
      description: 'Analyze website SEO performance'
    },
    {
      name: 'AI Content Rewrites', 
      icon: Zap,
      stats: usageStats.ai_rewrites,
      description: 'AI-powered content optimization'
    },
    {
      name: 'Website Optimizations',
      icon: Target,
      stats: usageStats.optimizations,
      description: 'Automated SEO improvements'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Usage Overview
            </CardTitle>
            <Badge className={`${getTierBadgeColor(usageStats.tier)} capitalize`}>
              {usageStats.tier} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Next Reset Date</p>
                <p className="text-sm text-gray-400">{formatResetDate(usageStats.resetDate)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
            >
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div className="grid gap-6">
        {usageItems.map((item) => {
          const IconComponent = item.icon;
          const status = getStatusBadge(item.stats.percentage);
          
          return (
            <Card key={item.name} className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    <Badge className={status.color}>
                      {status.text}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Usage</span>
                      <span className="text-white font-semibold">
                        {item.stats.used} / {item.stats.limit}
                      </span>
                    </div>
                    
                    <Progress 
                      value={item.stats.percentage} 
                      className="h-3"
                    />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {Math.round(item.stats.percentage)}% used
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.stats.limit - item.stats.used} remaining
                      </span>
                    </div>
                  </div>

                  {item.stats.percentage >= 80 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <p className="text-sm text-yellow-300">
                        You're approaching your {item.name.toLowerCase()} limit. Consider upgrading your plan.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan Comparison */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Plan Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-white">Feature</th>
                  <th className="text-center py-2 text-white">Free</th>
                  <th className="text-center py-2 text-white">Pro</th>
                  <th className="text-center py-2 text-white">Agency</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-3 text-gray-300">Website Scans</td>
                  <td className="text-center py-3 text-gray-400">5/month</td>
                  <td className="text-center py-3 text-blue-400">50/month</td>
                  <td className="text-center py-3 text-purple-400">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 text-gray-300">AI Rewrites</td>
                  <td className="text-center py-3 text-gray-400">10/month</td>
                  <td className="text-center py-3 text-blue-400">100/month</td>
                  <td className="text-center py-3 text-purple-400">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 text-gray-300">Optimizations</td>
                  <td className="text-center py-3 text-gray-400">2/month</td>
                  <td className="text-center py-3 text-blue-400">20/month</td>
                  <td className="text-center py-3 text-purple-400">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}