
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
type OrganizationInvitation = Database['public']['Tables']['organization_invitations']['Row'];

export async function createOrganization(name: string, description?: string): Promise<Organization | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name,
        description,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating organization:', error);
    return null;
  }
}

export async function getOrganizations(): Promise<Organization[]> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organization members:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return [];
  }
}

export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: 'admin' | 'editor' | 'viewer' = 'viewer'
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: user.id
      });

    if (error) {
      console.error('Error inviting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error inviting user:', error);
    return false;
  }
}

export async function updateMemberRole(
  memberId: string,
  role: 'admin' | 'editor' | 'viewer'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating member role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating member role:', error);
    return false;
  }
}

export async function removeMember(memberId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('organization_members')
      .update({ status: 'inactive' })
      .eq('id', memberId);

    if (error) {
      console.error('Error removing member:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing member:', error);
    return false;
  }
}
