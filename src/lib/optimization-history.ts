
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type OptimizationHistory = Database['public']['Tables']['optimization_history']['Row'];
type OptimizationHistoryInsert = Database['public']['Tables']['optimization_history']['Insert'];

export async function saveOptimizationHistory(data: {
  websiteUrl: string;
  seoScoreBefore: number;
  seoScoreAfter: number;
  desktopSpeedBefore: number;
  desktopSpeedAfter: number;
  mobileSpeedBefore: number;
  mobileSpeedAfter: number;
  fixesApplied: any[];
  backupUrl?: string;
  reportUrl?: string;
  status?: string;
}): Promise<OptimizationHistory | null> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data: result, error } = await supabase
      .from('optimization_history')
      .insert({
        user_id: user.data.user.id,
        website_url: data.websiteUrl,
        seo_score_before: data.seoScoreBefore,
        seo_score_after: data.seoScoreAfter,
        desktop_speed_before: data.desktopSpeedBefore,
        desktop_speed_after: data.desktopSpeedAfter,
        mobile_speed_before: data.mobileSpeedBefore,
        mobile_speed_after: data.mobileSpeedAfter,
        fixes_applied: data.fixesApplied,
        backup_url: data.backupUrl,
        report_url: data.reportUrl,
        status: data.status || 'completed'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving optimization history:', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error saving optimization history:', error);
    return null;
  }
}

export async function getOptimizationHistory(userId?: string): Promise<OptimizationHistory[]> {
  try {
    const { data, error } = await supabase
      .from('optimization_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching optimization history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching optimization history:', error);
    return [];
  }
}

export async function getOptimizationHistoryByDomain(domain: string): Promise<OptimizationHistory[]> {
  try {
    const { data, error } = await supabase
      .from('optimization_history')
      .select('*')
      .ilike('website_url', `%${domain}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching optimization history by domain:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching optimization history by domain:', error);
    return [];
  }
}

export async function rollbackOptimization(historyId: string): Promise<boolean> {
  try {
    // This would typically involve restoring from backup
    // For now, we'll just mark it as a rollback action
    const { error } = await supabase
      .from('optimization_history')
      .update({ status: 'rolled_back' })
      .eq('id', historyId);

    if (error) {
      console.error('Error rolling back optimization:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error rolling back optimization:', error);
    return false;
  }
}
