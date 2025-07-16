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

        // Get user profile with limits
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Get current usage
        const { data: currentUsage } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Get current month scan count
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const { count: scanCount } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', currentMonthStart.toISOString());

        // Get current month optimization count
        const { count: optimizationCount } = await supabase
          .from('optimization_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', currentMonthStart.toISOString());

        // Get current month AI rewrite count
        const { count: aiRewriteCount } = await supabase
          .from('ai_content_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', currentMonthStart.toISOString());

        if (profile && currentUsage) {
          setUsage({
            scans_used: currentUsage.scans_used || 0,
            scans_limit: profile.scans_limit || 10,
            optimizations_used: currentUsage.optimizations_used || 0,
            optimizations_limit: profile.optimizations_limit || 5,
            ai_rewrites_used: currentUsage.ai_rewrites_used || 0,
            ai_rewrites_limit: profile.ai_rewrites_limit || 10,
            reset_date: currentUsage.reset_date || new Date().toISOString(),
            current_month_scans: scanCount || 0,
            current_month_optimizations: optimizationCount || 0,
            current_month_ai_rewrites: aiRewriteCount || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching usage stats:', error);
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