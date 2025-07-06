
import { supabase } from '@/integrations/supabase/client';

export interface BackupInfo {
  id: string;
  url: string;
  backupUrl: string;
  reportUrl?: string;
  createdAt: string;
  seoScoreBefore: number;
  seoScoreAfter: number;
  fixesApplied: any[];
  status: string;
}

export interface RollbackCredentials {
  username: string;
  applicationPassword: string;
}

export async function listBackups(url: string): Promise<BackupInfo[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await supabase.functions.invoke('rollback-website', {
      body: {
        action: 'list-backups',
        url
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.backups || [];
  } catch (error) {
    console.error('Failed to list backups:', error);
    throw error;
  }
}

export async function initiateRollback(
  url: string,
  backupId: string,
  backupUrl: string,
  wpCredentials?: RollbackCredentials
): Promise<{ success: boolean; message: string; details: string[] }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await supabase.functions.invoke('rollback-website', {
      body: {
        action: 'rollback',
        url,
        backupId,
        backupUrl,
        wpCredentials
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}
