-- Create user notification settings table
CREATE TABLE public.user_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  usage_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_reports BOOLEAN NOT NULL DEFAULT false,
  security_alerts BOOLEAN NOT NULL DEFAULT true,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  system_updates BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own notification settings" 
ON public.user_notification_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create subscription packages table
CREATE TABLE public.subscription_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price_vnd INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view active packages" 
ON public.subscription_packages 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage packages" 
ON public.subscription_packages 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default subscription packages
INSERT INTO public.subscription_packages (name, description, base_price_vnd, is_default, is_recommended) VALUES
('Free Plan', 'Gói miễn phí cho người dùng cá nhân', 0, true, false),
('Pro Plan', 'Gói chuyên nghiệp cho doanh nghiệp nhỏ', 99000, false, true),
('Agency Plan', 'Gói cao cấp cho agency và doanh nghiệp lớn', 299000, false, false);

-- Create subscription features table  
CREATE TABLE public.subscription_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_type feature_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  uses_ai_tokens BOOLEAN NOT NULL DEFAULT false,
  ai_model TEXT,
  suggested_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view features" 
ON public.subscription_features 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage features" 
ON public.subscription_features 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default features
INSERT INTO public.subscription_features (feature_type, name, description, suggested_limit) VALUES
('website_scan', 'Website SEO Scan', 'Phân tích SEO toàn diện website', 50),
('ai_content', 'AI Content Generation', 'Tạo nội dung bằng AI', 100),
('optimization', 'Website Optimization', 'Tối ưu hóa website tự động', 20),
('pdf_report', 'PDF Report Generation', 'Tạo báo cáo PDF chi tiết', 10);

-- Create package features table
CREATE TABLE public.package_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES subscription_packages(id) ON DELETE CASCADE NOT NULL,
  feature_type feature_type NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  custom_limit INTEGER,
  custom_price_vnd INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.package_features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view package features" 
ON public.package_features 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage package features" 
ON public.package_features 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for timestamp updates
CREATE TRIGGER update_subscription_packages_updated_at
BEFORE UPDATE ON public.subscription_packages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_notification_settings_updated_at
BEFORE UPDATE ON public.user_notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();