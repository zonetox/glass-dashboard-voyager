import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface UserPlanInfo {
  plan_name: string;
  scans_used: number;
  scans_limit: number;
  scans_remaining: number;
  reset_date: string;
  is_premium: boolean;
}

export function UserPlanWidget() {
  const { user } = useAuth();
  const [planInfo, setPlanInfo] = useState<UserPlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPlanInfo();
    }
  }, [user]);

  const loadPlanInfo = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_plan_summary', { _user_id: user?.id });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setPlanInfo(data[0]);
      }
    } catch (error) {
      console.error('Error loading plan info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !planInfo) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-600 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = (planInfo.scans_used / planInfo.scans_limit) * 100;
  const isLowUsage = usagePercentage >= 80;
  const isPremium = planInfo.is_premium;

  const getPlanIcon = () => {
    if (isPremium) return <Crown className="h-4 w-4 text-purple-400" />;
    return <Zap className="h-4 w-4 text-gray-400" />;
  };

  const getPlanBadgeColor = () => {
    if (isPremium) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getUsageColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500';
    if (usagePercentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPlanBadgeColor()}>
              {getPlanIcon()}
              <span className="ml-1">{planInfo.plan_name}</span>
            </Badge>
            {!isPremium && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 h-6 px-2 text-xs"
              >
                Nâng cấp
              </Button>
            )}
          </div>
          
          {isLowUsage && (
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Lượt phân tích tháng này</span>
            <span className="text-white font-medium">
              {planInfo.scans_remaining}/{planInfo.scans_limit}
            </span>
          </div>
          
          <Progress 
            value={100 - usagePercentage} 
            className="h-2"
          />
          
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>
              {planInfo.scans_remaining > 0 ? (
                <>
                  <CheckCircle2 className="h-3 w-3 inline mr-1 text-green-400" />
                  Còn {planInfo.scans_remaining} lượt
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 inline mr-1 text-red-400" />
                  Đã hết lượt
                </>
              )}
            </span>
            <span>
              Làm mới {new Date(planInfo.reset_date).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>

        {!isPremium && planInfo.scans_remaining <= 1 && (
          <div className="mt-3 p-2 bg-purple-500/10 rounded border border-purple-500/20">
            <p className="text-xs text-purple-300 text-center">
              🚀 Nâng cấp Pro để có 50 lượt phân tích/tháng!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}