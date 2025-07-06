
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserUsage = Database['public']['Tables']['user_usage']['Row'];
type ScanResult = Database['public']['Tables']['scan_results']['Row'];

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getCurrentUsage(): Promise<UserUsage | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .gte('reset_date', new Date().toISOString())
      .single();

    if (error) {
      console.error('Error fetching current usage:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching current usage:', error);
    return null;
  }
}

export async function incrementUsage(type: 'scans_used' | 'ai_rewrites_used' | 'optimizations_used'): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const currentUsage = await getCurrentUsage();
    if (!currentUsage) return false;

    const { error } = await supabase
      .from('user_usage')
      .update({
        [type]: currentUsage[type] + 1
      })
      .eq('id', currentUsage.id);

    if (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }
}

export async function canPerformAction(actionType: 'scans' | 'ai_rewrites' | 'optimizations'): Promise<boolean> {
  try {
    const profile = await getUserProfile();
    const usage = await getCurrentUsage();
    
    if (!profile || !usage) return false;

    switch (actionType) {
      case 'scans':
        return usage.scans_used < profile.scans_limit;
      case 'ai_rewrites':
        return usage.ai_rewrites_used < profile.ai_rewrites_limit;
      case 'optimizations':
        return usage.optimizations_used < profile.optimizations_limit;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking action permissions:', error);
    return false;
  }
}

export async function saveScanResult(
  websiteUrl: string,
  scanData: any,
  optimizationLog?: any,
  seoScore?: number,
  issuesCount?: number
): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Upload scan data to storage
    const scanDataPath = `${user.id}/scan-${Date.now()}.json`;
    const { error: scanUploadError } = await supabase.storage
      .from('scan-results')
      .upload(scanDataPath, JSON.stringify(scanData, null, 2));

    if (scanUploadError) {
      console.error('Error uploading scan data:', scanUploadError);
      return null;
    }

    let optimizationLogPath = null;
    if (optimizationLog) {
      optimizationLogPath = `${user.id}/optimization-${Date.now()}.json`;
      const { error: logUploadError } = await supabase.storage
        .from('optimization-logs')
        .upload(optimizationLogPath, JSON.stringify(optimizationLog, null, 2));

      if (logUploadError) {
        console.error('Error uploading optimization log:', logUploadError);
      }
    }

    // Save scan result record
    const { data, error } = await supabase
      .from('scan_results')
      .insert({
        user_id: user.id,
        website_url: websiteUrl,
        scan_data_path: scanDataPath,
        optimization_log_path: optimizationLogPath,
        seo_score: seoScore,
        issues_count: issuesCount
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving scan result:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error saving scan result:', error);
    return null;
  }
}

export async function getScanResults(): Promise<ScanResult[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('scan_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scan results:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching scan results:', error);
    return [];
  }
}

export async function downloadScanData(scanDataPath: string): Promise<any | null> {
  try {
    const { data, error } = await supabase.storage
      .from('scan-results')
      .download(scanDataPath);

    if (error) {
      console.error('Error downloading scan data:', error);
      return null;
    }

    const text = await data.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error parsing scan data:', error);
    return null;
  }
}
