-- Create admin role for the user (tanloifmc@yahoo.com)
-- First, we need to find the user ID and create admin role

-- Create a function to promote user to admin by email
CREATE OR REPLACE FUNCTION public.promote_user_to_admin_by_email(_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  -- Find user by email from auth.users (using RPC since we can't query auth.users directly)
  -- We'll use the user_profiles table to find the user
  SELECT user_id INTO _user_id 
  FROM public.user_profiles up
  WHERE EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = up.user_id 
    AND au.email = _email
  )
  LIMIT 1;
  
  IF _user_id IS NULL THEN
    -- If user doesn't exist in profiles, return false
    RETURN false;
  END IF;
  
  -- Remove existing roles for this user
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update user profile tier to admin
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

-- Create some default plans if they don't exist
INSERT INTO public.plans (id, name, monthly_limit, pdf_enabled, ai_enabled, price_vnd) 
VALUES 
  ('free', 'Gói Miễn Phí', 10, false, false, 0),
  ('pro', 'Gói Pro', 100, true, true, 299000),
  ('enterprise', 'Gói Doanh Nghiệp', 1000, true, true, 999000)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_limit = EXCLUDED.monthly_limit,
  pdf_enabled = EXCLUDED.pdf_enabled,
  ai_enabled = EXCLUDED.ai_enabled,
  price_vnd = EXCLUDED.price_vnd,
  updated_at = now();

-- Create default subscription packages if they don't exist
INSERT INTO public.subscription_packages (id, name, price_monthly_vnd, price_yearly_vnd, description) 
VALUES 
  (gen_random_uuid(), 'Gói Cơ Bản', 299000, 2990000, 'Gói dành cho cá nhân và doanh nghiệp nhỏ'),
  (gen_random_uuid(), 'Gói Chuyên Nghiệp', 599000, 5990000, 'Gói dành cho doanh nghiệp vừa'),
  (gen_random_uuid(), 'Gói Doanh Nghiệp', 999000, 9990000, 'Gói dành cho doanh nghiệp lớn')
ON CONFLICT DO NOTHING;

-- Create default subscription features if they don't exist
INSERT INTO public.subscription_features (feature_type, feature_name, description, suggested_limit) 
VALUES 
  ('seo_scan', 'Quét SEO', 'Số lần quét SEO trang web mỗi tháng', 100),
  ('ai_content', 'Tạo nội dung AI', 'Số bài viết AI có thể tạo mỗi tháng', 50),
  ('pdf_report', 'Báo cáo PDF', 'Xuất báo cáo SEO dạng PDF', 1),
  ('api_access', 'Truy cập API', 'Sử dụng API để tích hợp', 1000),
  ('competitor_analysis', 'Phân tích đối thủ', 'Số lần phân tích đối thủ mỗi tháng', 10)
ON CONFLICT (feature_type) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  description = EXCLUDED.description,
  suggested_limit = EXCLUDED.suggested_limit;