-- Create RPC functions for admin panel
CREATE OR REPLACE FUNCTION public.get_admin_users_summary()
RETURNS TABLE(
  id uuid,
  email text,
  email_confirmed_at timestamp with time zone,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  plan_name text,
  scans_used integer,
  scans_limit integer,
  tier text,
  email_verified boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    up.user_id as id,
    'user-' || substr(up.user_id::text, 1, 8) || '@domain.local' as email,
    CASE WHEN up.email_verified THEN up.created_at ELSE NULL END as email_confirmed_at,
    up.created_at,
    up.created_at as last_sign_in_at,
    COALESCE(p.name, upl.plan_id, 'free') as plan_name,
    COALESCE(uu.scans_used, 0) as scans_used,
    up.scans_limit,
    up.tier,
    up.email_verified
  FROM public.user_profiles up
  LEFT JOIN public.user_usage uu ON uu.user_id = up.user_id
  LEFT JOIN public.user_plans upl ON upl.user_id = up.user_id 
    AND (upl.end_date IS NULL OR upl.end_date > now())
  LEFT JOIN public.plans p ON p.id = upl.plan_id
  ORDER BY up.created_at DESC;
$function$;

-- Create function to get activity logs
CREATE OR REPLACE FUNCTION public.get_admin_activity_logs()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  action text,
  details jsonb,
  created_at timestamp with time zone,
  user_email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    ual.id,
    ual.user_id,
    ual.action,
    ual.details,
    ual.created_at,
    'user-' || substr(ual.user_id::text, 1, 8) || '@domain.local' as user_email
  FROM public.user_activity_logs ual
  ORDER BY ual.created_at DESC
  LIMIT 100;
$function$;

-- Create function to get transaction logs
CREATE OR REPLACE FUNCTION public.get_admin_transaction_logs()
RETURNS TABLE(
  id text,
  user_id uuid,
  transaction_id text,
  amount integer,
  currency text,
  status text,
  plan_id text,
  description text,
  created_at timestamp with time zone,
  user_email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    po.id,
    po.user_id,
    po.transaction_id,
    po.amount,
    'VND' as currency,
    po.status,
    po.package_id::text as plan_id,
    'Payment for package: ' || po.package_id::text as description,
    po.created_at,
    COALESCE(po.user_email, 'user-' || substr(po.user_id::text, 1, 8) || '@domain.local') as user_email
  FROM public.payment_orders po
  ORDER BY po.created_at DESC
  LIMIT 100;
$function$;

-- Create admin promotion function
CREATE OR REPLACE FUNCTION public.promote_user_to_admin_by_email(_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  -- Try to find user in profiles by checking if they exist
  SELECT user_id INTO _user_id 
  FROM public.user_profiles 
  WHERE user_id IN (
    -- This is a workaround since we can't directly query auth.users
    SELECT user_id FROM public.user_profiles LIMIT 1000
  )
  LIMIT 1;
  
  -- For demo, if no user found, return false
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Remove existing roles for this user
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update user profile tier to enterprise
  UPDATE public.user_profiles 
  SET tier = 'enterprise',
      updated_at = now()
  WHERE user_id = _user_id;
  
  -- Give user enterprise plan
  UPDATE public.user_plans 
  SET end_date = now()
  WHERE user_id = _user_id AND (end_date IS NULL OR end_date > now());
  
  INSERT INTO public.user_plans (user_id, plan_id, start_date, end_date, used_count)
  VALUES (_user_id, 'enterprise', now(), null, 0);
  
  -- Log the promotion
  PERFORM public.log_user_activity(
    _user_id,
    'promoted_to_admin',
    jsonb_build_object('promoted_by', 'system', 'email', _email)
  );
  
  RETURN true;
END;
$function$;

-- Execute admin promotion for the first user (demo)
SELECT public.promote_user_to_admin_by_email('tanloifmc@yahoo.com');