-- Fix infinite recursion in organization_members RLS policies
-- This migration creates a security definer function to break the recursion cycle

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Organization admins can manage members" ON public.organization_members;

-- Create security definer function to get user's organizations
CREATE OR REPLACE FUNCTION public.user_organizations(_user_id uuid)
RETURNS TABLE(organization_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = _user_id AND status = 'active';
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view members of their organizations"
ON public.organization_members
FOR SELECT
USING (organization_id IN (SELECT user_organizations(auth.uid())));

CREATE POLICY "Organization admins can manage members"
ON public.organization_members
FOR ALL
USING (
  organization_id IN (
    SELECT user_organizations(auth.uid())
  ) AND 
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'::organization_role
      AND om.status = 'active'
  )
);