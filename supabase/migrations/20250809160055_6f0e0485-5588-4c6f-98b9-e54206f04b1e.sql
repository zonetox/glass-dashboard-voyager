-- Secure functions by pinning search_path and hardening admin-only utilities
-- 1) update_user_autopilot_updated_at
CREATE OR REPLACE FUNCTION public.update_user_autopilot_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2) handle_new_organization
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role, status, joined_at)
  VALUES (NEW.id, NEW.created_by, 'admin', 'active', now());
  RETURN NEW;
END;
$function$;

-- 3) reset_monthly_usage
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
  -- Insert new monthly usage records for all users
  INSERT INTO public.user_usage (user_id, reset_date)
  SELECT up.user_id, date_trunc('month', now()) + interval '1 month'
  FROM public.user_profiles up
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_usage uu 
    WHERE uu.user_id = up.user_id 
      AND uu.reset_date = date_trunc('month', now()) + interval '1 month'
  );
END;
$function$;

-- 4) has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

-- 5) get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$function$;

-- 6) handle_new_user (already pinned to empty search_path for safety) - keep as-is
-- Skipped to avoid changing a working secure configuration

-- 7) promote_to_admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(_user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  user_record RECORD;
BEGIN
  -- Placeholder function (no direct access to auth.users from public context)
  RETURN FALSE; 
END;
$function$;

-- 8) check_api_rate_limit
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(_token_id uuid, _endpoint text, _rate_limit integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  current_usage INTEGER;
  current_hour TIMESTAMP WITH TIME ZONE;
BEGIN
  current_hour := date_trunc('hour', now());
  
  SELECT COALESCE(SUM(request_count), 0) INTO current_usage
  FROM public.api_usage
  WHERE token_id = _token_id 
    AND hour_bucket = current_hour
    AND endpoint = _endpoint;
    
  RETURN current_usage < _rate_limit;
END;
$function$;

-- 9) record_api_usage
CREATE OR REPLACE FUNCTION public.record_api_usage(_token_id uuid, _user_id uuid, _endpoint text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  current_hour TIMESTAMP WITH TIME ZONE;
BEGIN
  current_hour := date_trunc('hour', now());
  
  INSERT INTO public.api_usage (token_id, user_id, endpoint, hour_bucket, request_count)
  VALUES (_token_id, _user_id, _endpoint, current_hour, 1)
  ON CONFLICT (token_id, hour_bucket, endpoint)
  DO UPDATE SET 
    request_count = public.api_usage.request_count + 1,
    created_at = now();
    
  UPDATE public.api_tokens 
  SET last_used_at = now() 
  WHERE id = _token_id;
END;
$function$;

-- 10) get_user_current_plan
CREATE OR REPLACE FUNCTION public.get_user_current_plan(_user_id uuid)
RETURNS TABLE(plan_id text, plan_name text, monthly_limit integer, pdf_enabled boolean, ai_enabled boolean, used_count integer, remaining_count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $function$
  SELECT 
    p.id,
    p.name,
    p.monthly_limit,
    p.pdf_enabled,
    p.ai_enabled,
    up.used_count,
    GREATEST(0, p.monthly_limit - up.used_count) as remaining_count
  FROM public.user_plans up
  JOIN public.plans p ON p.id = up.plan_id
  WHERE up.user_id = _user_id
    AND (up.end_date IS NULL OR up.end_date > CURRENT_TIMESTAMP)
    AND up.start_date <= CURRENT_TIMESTAMP
  ORDER BY up.start_date DESC
  LIMIT 1;
$function$;

-- 11) reset_user_monthly_usage
CREATE OR REPLACE FUNCTION public.reset_user_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
  UPDATE public.user_profiles 
  SET 
    scans_used = 0,
    monthly_reset_date = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  WHERE monthly_reset_date <= now();
END;
$function$;

-- 12) promote_user_to_admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  -- Placeholder implementation; requires separate admin process
  RETURN false;
END;
$function$;

-- 13) check_feature_access
CREATE OR REPLACE FUNCTION public.check_feature_access(user_id uuid, feature public.feature_type)
RETURNS TABLE(has_access boolean, remaining_usage integer, total_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  current_subscription RECORD;
  feature_config RECORD;
  current_usage INTEGER;
BEGIN
  SELECT us.*, sp.name as package_name INTO current_subscription
  FROM public.user_subscriptions us
  JOIN public.subscription_packages sp ON sp.id = us.package_id
  WHERE us.user_id = check_feature_access.user_id 
    AND us.status = 'active'
    AND (us.end_date IS NULL OR us.end_date > now())
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;
  
  SELECT pf.*, sf.suggested_limit INTO feature_config
  FROM public.package_features pf
  JOIN public.subscription_features sf ON sf.feature_type = pf.feature_type
  WHERE pf.package_id = current_subscription.package_id
    AND pf.feature_type = feature
    AND pf.is_enabled = true;
    
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;
  
  SELECT COALESCE(fu.usage_count, 0) INTO current_usage
  FROM public.feature_usage fu
  WHERE fu.user_id = check_feature_access.user_id
    AND fu.feature_type = feature
    AND fu.period_start = date_trunc('month', now());
    
  IF current_usage IS NULL THEN
    current_usage := 0;
  END IF;
  
  IF feature_config.custom_limit IS NULL THEN
    RETURN QUERY SELECT true, -1, -1;
  ELSE
    RETURN QUERY SELECT 
      (current_usage < feature_config.custom_limit),
      (feature_config.custom_limit - current_usage),
      feature_config.custom_limit;
  END IF;
END;
$function$;

-- 14) increment_user_usage
CREATE OR REPLACE FUNCTION public.increment_user_usage(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  current_plan RECORD;
BEGIN
  SELECT * INTO current_plan FROM public.get_user_current_plan(_user_id);
  
  IF NOT FOUND THEN
    INSERT INTO public.user_plans (user_id, plan_id)
    VALUES (_user_id, 'free');
    
    SELECT * INTO current_plan FROM public.get_user_current_plan(_user_id);
  END IF;
  
  IF current_plan.remaining_count <= 0 THEN
    RETURN false;
  END IF;
  
  UPDATE public.user_plans 
  SET used_count = used_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = _user_id 
    AND plan_id = current_plan.plan_id
    AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP)
    AND start_date <= CURRENT_TIMESTAMP;
    
  RETURN true;
END;
$function$;

-- 15) log_user_activity
CREATE OR REPLACE FUNCTION public.log_user_activity(_user_id uuid, _action text, _details jsonb DEFAULT NULL::jsonb, _ip_address inet DEFAULT NULL::inet, _user_agent text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
  INSERT INTO public.user_activity_logs (user_id, action, details, ip_address, user_agent)
  VALUES (_user_id, _action, _details, _ip_address, _user_agent);
END;
$function$;

-- 16) get_user_plan_summary
CREATE OR REPLACE FUNCTION public.get_user_plan_summary(_user_id uuid)
RETURNS TABLE(plan_name text, scans_used integer, scans_limit integer, scans_remaining integer, reset_date timestamp with time zone, is_premium boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $function$
  SELECT 
    p.name,
    uu.scans_used,
    up.scans_limit,
    GREATEST(0, up.scans_limit - uu.scans_used) as scans_remaining,
    uu.reset_date,
    (p.name != 'Free Plan') as is_premium
  FROM public.user_plans upp
  JOIN public.plans p ON p.id = upp.plan_id
  JOIN public.user_profiles up ON up.user_id = upp.user_id
  LEFT JOIN public.user_usage uu ON uu.user_id = upp.user_id
  WHERE upp.user_id = _user_id
    AND (upp.end_date IS NULL OR upp.end_date > CURRENT_TIMESTAMP)
    AND upp.start_date <= CURRENT_TIMESTAMP
  ORDER BY upp.start_date DESC
  LIMIT 1;
$function$;

-- 17) execute_admin_query (add admin check)
CREATE OR REPLACE FUNCTION public.execute_admin_query(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  result json;
BEGIN
  -- Enforce admin-only execution
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Only allow SELECT queries for security
  IF NOT (query ILIKE 'select%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query || ') t' INTO result;
  
  RETURN COALESCE(result, '[]'::json);
END;
$function$;

-- Lock down EXECUTE privileges for execute_admin_query
REVOKE ALL ON FUNCTION public.execute_admin_query(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_admin_query(text) TO authenticated;

-- 18) check_user_scan_limit
CREATE OR REPLACE FUNCTION public.check_user_scan_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record 
  FROM public.user_profiles 
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF profile_record.monthly_reset_date <= now() THEN
    UPDATE public.user_profiles 
    SET 
      scans_used = 0,
      monthly_reset_date = date_trunc('month', now()) + interval '1 month'
    WHERE user_id = user_uuid;
    RETURN true;
  END IF;
  
  RETURN profile_record.scans_used < profile_record.scans_limit;
END;
$function$;

-- 19) increment_user_scan_usage
CREATE OR REPLACE FUNCTION public.increment_user_scan_usage(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  can_scan boolean;
BEGIN
  SELECT public.check_user_scan_limit(user_uuid) INTO can_scan;
  
  IF can_scan THEN
    UPDATE public.user_profiles 
    SET 
      scans_used = scans_used + 1,
      updated_at = now()
    WHERE user_id = user_uuid;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- 20) update_backups_updated_at
CREATE OR REPLACE FUNCTION public.update_backups_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 21) handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;