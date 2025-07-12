-- Tạo enum cho roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Tạo bảng user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Tạo function để check role (security definer để tránh recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Tạo function để get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies cho user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Cập nhật function handle_new_user để tự động assign role member
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Tạo user profile
  INSERT INTO public.user_profiles (user_id, tier)
  VALUES (NEW.id, 'free');
  
  -- Tạo user usage
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);
  
  -- Assign role member by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

-- Tạo bảng admin_settings để lưu API keys
CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS cho admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Chỉ admin mới có thể access admin_settings
CREATE POLICY "Only admins can access admin settings"
ON public.admin_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger cho updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default API settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('openai_api_key', '', 'OpenAI API Key for AI analysis'),
('google_pagespeed_api_key', '', 'Google PageSpeed API Key for performance analysis');

-- Tạo admin user đầu tiên (sẽ cần set password sau)
-- Lưu ý: Cần tạo user qua Supabase auth trước, sau đó update role