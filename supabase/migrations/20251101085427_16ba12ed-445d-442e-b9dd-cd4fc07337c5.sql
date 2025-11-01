-- Fix event_logs RLS policy to prevent unauthorized access to analytics data
-- Drop the overly permissive policy that allows reading NULL user_id events
DROP POLICY IF EXISTS "Users can view their own events" ON public.event_logs;

-- Create a strict policy that only allows users to see their own events
CREATE POLICY "Users can view only their own events" 
ON public.event_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a separate policy for admins to view all events (for legitimate analytics)
CREATE POLICY "Admins can view all events" 
ON public.event_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);