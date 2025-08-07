-- Cập nhật user profiles table cho hệ thống đăng ký
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_tier TEXT DEFAULT 'free' CHECK (user_tier IN ('free', 'premium', 'enterprise')),
  scans_limit INTEGER DEFAULT 10,
  scans_used INTEGER DEFAULT 0,
  monthly_reset_date TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', now()) + interval '1 month',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles  
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function để tự động tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, user_tier)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'free'
  );
  RETURN NEW;
END;
$$;

-- Trigger để tự động tạo profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function để reset monthly usage
CREATE OR REPLACE FUNCTION public.reset_user_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles 
  SET 
    scans_used = 0,
    monthly_reset_date = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  WHERE monthly_reset_date <= now();
END;
$$;

-- Function để check usage limit
CREATE OR REPLACE FUNCTION public.check_user_scan_limit(user_uuid UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record 
  FROM public.user_profiles 
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Reset nếu đã hết tháng
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
$$;

-- Function để increment scan usage  
CREATE OR REPLACE FUNCTION public.increment_user_scan_usage(user_uuid UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;