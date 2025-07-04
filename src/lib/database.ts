
import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectInsert, SeoAnalysis } from './types';

export async function createProject(userId: string, websiteUrl: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        website_url: websiteUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function updateProjectStatus(
  projectId: string, 
  status: string, 
  seoScore?: number
): Promise<boolean> {
  try {
    const updateData: any = { status };
    if (seoScore !== undefined) {
      updateData.seo_score = seoScore;
    }

    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId);

    if (error) {
      console.error('Error updating project status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating project status:', error);
    return false;
  }
}

export async function saveAnalysisResults(
  projectId: string, 
  analysisData: any,
  issuesFound: number = 0,
  recommendations: any = {}
): Promise<SeoAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('seo_analysis')
      .insert({
        project_id: projectId,
        analysis_data: analysisData,
        issues_found: issuesFound,
        recommendations
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis results:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving analysis results:', error);
    return null;
  }
}

export async function getAnalysisByProject(projectId: string): Promise<SeoAnalysis[]> {
  try {
    const { data, error } = await supabase
      .from('seo_analysis')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analysis:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return [];
  }
}

export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

export function subscribeToProjects(
  userId: string, 
  callback: (projects: Project[]) => void
) {
  const channel = supabase
    .channel('projects-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${userId}`
      },
      () => {
        // Refetch projects when changes occur
        getProjectsByUser(userId).then(callback);
      }
    )
    .subscribe();

  return channel;
}
