import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UsageStats {
  scans_used: number;
  scans_limit: number;
  optimizations_used: number;
  optimizations_limit: number;
  ai_rewrites_used: number;
  ai_rewrites_limit: number;
  reset_date: string;
  current_month_scans: number;
  current_month_optimizations: number;
  current_month_ai_rewrites: number;
}

export function useUsageTracking() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUsageStats = async () => {
      try {
        setLoading(true);

        // Get current plan from user_plans
        const { data: currentPlan } = await supabase.rpc('get_user_current_plan', { 
          _user_id: user.id 
        });

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Get current month scan count from real scans table
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const { count: scanCount } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', currentMonthStart.toISOString());

        // Get current month optimization count from real table
        const { count: optimizationCount } = await supabase
          .from('optimization_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', currentMonthStart.toISOString());

        // Get current month AI rewrite count from real table
        const { count: aiRewriteCount } = await supabase
          .from('ai_content_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', currentMonthStart.toISOString());

        // Calculate limits based on plan
        const planLimits = {
          free: { scans: 10, optimizations: 3, ai_rewrites: 2 },
          pro: { scans: 100, optimizations: 50, ai_rewrites: 25 },
          enterprise: { scans: 500, optimizations: 200, ai_rewrites: 100 }
        };

        const tier = profile?.tier || 'free';
        const limits = planLimits[tier as keyof typeof planLimits] || planLimits.free;

        // Use real data from database
        const planInfo = Array.isArray(currentPlan) ? currentPlan[0] : currentPlan;
        
        setUsage({
          scans_used: planInfo?.used_count || scanCount || 0,
          scans_limit: planInfo?.monthly_limit || limits.scans,
          optimizations_used: optimizationCount || 0,
          optimizations_limit: limits.optimizations,
          ai_rewrites_used: aiRewriteCount || 0,
          ai_rewrites_limit: limits.ai_rewrites,
          reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          current_month_scans: scanCount || 0,
          current_month_optimizations: optimizationCount || 0,
          current_month_ai_rewrites: aiRewriteCount || 0,
        });

      } catch (error) {
        console.error('Error fetching usage stats:', error);
        // Set default fallback values
        setUsage({
          scans_used: 0,
          scans_limit: 10,
          optimizations_used: 0,
          optimizations_limit: 3,
          ai_rewrites_used: 0,
          ai_rewrites_limit: 2,
          reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          current_month_scans: 0,
          current_month_optimizations: 0,
          current_month_ai_rewrites: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsageStats();
  }, [user]);

  const incrementUsage = async (type: 'scans' | 'optimizations' | 'ai_rewrites') => {
    if (!user || !usage) return false;

    try {
      const { error } = await supabase
        .from('user_usage')
        .update({
          [`${type}_used`]: usage[`${type}_used`] + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (!error) {
        setUsage(prev => prev ? {
          ...prev,
          [`${type}_used`]: prev[`${type}_used`] + 1
        } : null);
        return true;
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
    
    return false;
  };

  return { usage, loading, incrementUsage };
}