
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Zap, 
  Search, 
  PenTool, 
  Settings,
  ExternalLink 
} from 'lucide-react';
import { getUserProfile, getCurrentUsage } from '@/lib/user-management';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserUsage = Database['public']['Tables']['user_usage']['Row'];

export function UsageTracker() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [profileData, usageData] = await Promise.all([
        getUserProfile(),
        getCurrentUsage()
      ]);
      
      setProfile(profileData);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'pro':
        return {
          name: 'Pro',
          color: 'bg-blue-500/20 border-blue-500/20 text-blue-400',
          icon: <Crown className="h-4 w-4" />
        };
      case 'agency':
        return {
          name: 'Agency',
          color: 'bg-purple-500/20 border-purple-500/20 text-purple-400',
          icon: <Crown className="h-4 w-4" />
        };
      default:
        return {
          name: 'Free',
          color: 'bg-gray-500/20 border-gray-500/20 text-gray-400',
          icon: <Zap className="h-4 w-4" />
        };
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile || !usage) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <p className="text-gray-400 text-center">Unable to load usage data</p>
        </CardContent>
      </Card>
    );
  }

  const tierInfo = getTierInfo(profile.tier);

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Usage & Plan
          </div>
          <Badge className={tierInfo.color}>
            {tierInfo.icon}
            <span className="ml-1">{tierInfo.name}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Scans Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-green-400" />
              <span className="text-white font-medium">Website Scans</span>
            </div>
            <span className="text-gray-400 text-sm">
              {usage.scans_used} / {profile.scans_limit}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(usage.scans_used, profile.scans_limit)}
            className="h-2"
          />
        </div>

        {/* AI Rewrites Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool className="h-4 w-4 text-purple-400" />
              <span className="text-white font-medium">AI Rewrites</span>
            </div>
            <span className="text-gray-400 text-sm">
              {usage.ai_rewrites_used} / {profile.ai_rewrites_limit}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(usage.ai_rewrites_used, profile.ai_rewrites_limit)}
            className="h-2"
          />
        </div>

        {/* Optimizations Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-white font-medium">Optimizations</span>
            </div>
            <span className="text-gray-400 text-sm">
              {usage.optimizations_used} / {profile.optimizations_limit}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(usage.optimizations_used, profile.optimizations_limit)}
            className="h-2"
          />
        </div>

        {/* Reset Date */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400 text-center">
            Usage resets on: {new Date(usage.reset_date).toLocaleDateString()}
          </p>
        </div>

        {/* Upgrade Button */}
        {profile.tier === 'free' && (
          <div className="pt-2">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
