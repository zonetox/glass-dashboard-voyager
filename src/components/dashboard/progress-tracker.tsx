import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, Calendar, BarChart3, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, getCurrentUsage } from '@/lib/user-management';

interface UsageData {
  scans_used: number;
  ai_rewrites_used: number;
  optimizations_used: number;
  scans_limit: number;
  ai_rewrites_limit: number;
  optimizations_limit: number;
}

interface ProgressStat {
  label: string;
  current: number;
  limit: number;
  percentage: number;
  icon: any;
  color: string;
}

export function ProgressTracker() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const [profile, usage, scansData] = await Promise.all([
        getUserProfile(),
        getCurrentUsage(),
        supabase
          .from('scan_results')
          .select('website_url, seo_score, created_at')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (profile && usage) {
        setUsageData({
          scans_used: usage.scans_used,
          ai_rewrites_used: usage.ai_rewrites_used,
          optimizations_used: usage.optimizations_used,
          scans_limit: profile.scans_limit,
          ai_rewrites_limit: profile.ai_rewrites_limit,
          optimizations_limit: profile.optimizations_limit,
        });
      }

      if (scansData.data) {
        setRecentScans(scansData.data);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-white">Loading progress data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-gray-400">No usage data available</div>
        </CardContent>
      </Card>
    );
  }

  const progressStats: ProgressStat[] = [
    {
      label: 'Website Scans',
      current: usageData.scans_used,
      limit: usageData.scans_limit,
      percentage: (usageData.scans_used / usageData.scans_limit) * 100,
      icon: BarChart3,
      color: 'blue'
    },
    {
      label: 'AI Rewrites',
      current: usageData.ai_rewrites_used,
      limit: usageData.ai_rewrites_limit,
      percentage: (usageData.ai_rewrites_used / usageData.ai_rewrites_limit) * 100,
      icon: Zap,
      color: 'purple'
    },
    {
      label: 'Optimizations',
      current: usageData.optimizations_used,
      limit: usageData.optimizations_limit,
      percentage: (usageData.optimizations_used / usageData.optimizations_limit) * 100,
      icon: Target,
      color: 'green'
    }
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Usage Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {progressStats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div key={stat.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-4 w-4 text-${stat.color}-400`} />
                      <span className="text-sm font-medium text-gray-300">{stat.label}</span>
                    </div>
                    <span className={`text-sm font-semibold ${getProgressColor(stat.percentage)}`}>
                      {stat.current}/{stat.limit}
                    </span>
                  </div>
                  
                  <Progress 
                    value={stat.percentage} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {Math.round(stat.percentage)}% used
                    </span>
                    {stat.percentage >= 80 && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                        Near Limit
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-green-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400 mb-2">No recent activity</p>
              <p className="text-sm text-gray-500">Start analyzing websites to see your activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {scan.website_url}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(scan.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {scan.seo_score !== null ? (
                      <>
                        {scan.seo_score >= 70 ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                        <Badge 
                          className={`
                            ${scan.seo_score >= 90 ? 'bg-purple-500/20 text-purple-400' : ''}
                            ${scan.seo_score >= 70 && scan.seo_score < 90 ? 'bg-green-500/20 text-green-400' : ''}
                            ${scan.seo_score >= 40 && scan.seo_score < 70 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                            ${scan.seo_score < 40 ? 'bg-red-500/20 text-red-400' : ''}
                          `}
                        >
                          {scan.seo_score}/100
                        </Badge>
                      </>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400">
                        Processing
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Reset Info */}
      <Card className="glass-card border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">Monthly Usage Reset</h4>
              <p className="text-sm text-gray-400">
                Your usage limits reset on the 1st of each month. Upgrade your plan for higher limits.
              </p>
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
    </div>
  );
}