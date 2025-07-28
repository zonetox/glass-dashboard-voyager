-- Create enum types for subscription system
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'expired');
CREATE TYPE feature_type AS ENUM ('seo_audit', 'ai_rewrite', 'ai_meta', 'ai_content_plan', 'ai_blog', 'image_alt', 'technical_seo', 'pdf_export', 'whitelabel');

-- Subscription features table with pricing and limits
CREATE TABLE public.subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_type feature_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  suggested_price_vnd INTEGER NOT NULL DEFAULT 0,
  suggested_limit INTEGER DEFAULT NULL,
  uses_ai_tokens BOOLEAN DEFAULT false,
  ai_model TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscription packages table
CREATE TABLE public.subscription_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price_vnd INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_recommended BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Package features junction table
CREATE TABLE public.package_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES subscription_packages(id) ON DELETE CASCADE,
  feature_type feature_type NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  custom_price_vnd INTEGER DEFAULT NULL,
  custom_limit INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(package_id, feature_type)
);

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  package_id UUID NOT NULL REFERENCES subscription_packages(id),
  status subscription_status DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature usage tracking
CREATE TABLE public.feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_type feature_type NOT NULL,
  usage_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
  period_end TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_type, period_start)
);

-- Enable RLS
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for features (viewable by all, manageable by admins)
CREATE POLICY "Features are viewable by everyone" ON subscription_features FOR SELECT USING (true);
CREATE POLICY "Only admins can manage features" ON subscription_features FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for packages (viewable by all, manageable by admins)
CREATE POLICY "Packages are viewable by everyone" ON subscription_packages FOR SELECT USING (true);
CREATE POLICY "Only admins can manage packages" ON subscription_packages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for package features (viewable by all, manageable by admins)
CREATE POLICY "Package features are viewable by everyone" ON package_features FOR SELECT USING (true);
CREATE POLICY "Only admins can manage package features" ON package_features FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage user subscriptions" ON user_subscriptions FOR ALL USING (true);

-- RLS Policies for feature usage
CREATE POLICY "Users can view their own usage" ON feature_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage feature usage" ON feature_usage FOR ALL USING (true);

-- Insert default features with suggested pricing
INSERT INTO subscription_features (feature_type, name, description, suggested_price_vnd, suggested_limit, uses_ai_tokens, ai_model) VALUES
('seo_audit', 'SEO Audit Cơ bản', 'Phân tích SEO tổng quan website', 0, NULL, false, NULL),
('ai_rewrite', 'AI Rewrite Content', 'Viết lại nội dung bằng AI', 120000, 100, true, 'gpt-4o-mini'),
('ai_meta', 'AI Meta Title/Description', 'Tạo meta title và description bằng AI', 50000, 300, true, 'gpt-4o-mini'),
('ai_content_plan', 'AI Content Plan Generator', 'Tạo kế hoạch nội dung bằng AI', 200000, 30, true, 'gpt-4o'),
('ai_blog', 'AI Blog Generator', 'Tạo bài viết blog bằng AI', 250000, 10, true, 'gpt-4o'),
('image_alt', 'Image ALT Checker + AI Fix', 'Kiểm tra và sửa ALT text hình ảnh', 75000, 300, true, 'gpt-4o-mini'),
('technical_seo', 'Technical SEO Audit nâng cao', 'Phân tích SEO kỹ thuật chi tiết', 50000, NULL, false, NULL),
('pdf_export', 'Xuất báo cáo PDF', 'Xuất báo cáo dạng PDF', 25000, 30, false, NULL),
('whitelabel', 'Whitelabel Branding', 'Tùy chỉnh thương hiệu cho Agency', 175000, NULL, false, NULL);

-- Insert sample packages
INSERT INTO subscription_packages (name, description, base_price_vnd, is_default, is_recommended) VALUES
('Gói Miễn phí', 'Gói cơ bản cho người dùng mới', 0, true, false),
('Gói AI Cơ bản', 'Gói cơ bản với tính năng AI', 225000, false, true),
('Gói Content Pro', 'Gói chuyên nghiệp cho content creator', 475000, false, false);

-- Configure free package features
INSERT INTO package_features (package_id, feature_type, is_enabled, custom_limit) 
SELECT sp.id, 'seo_audit', true, NULL FROM subscription_packages sp WHERE sp.name = 'Gói Miễn phí';
INSERT INTO package_features (package_id, feature_type, is_enabled, custom_limit) 
SELECT sp.id, 'technical_seo', true, NULL FROM subscription_packages sp WHERE sp.name = 'Gói Miễn phí';
INSERT INTO package_features (package_id, feature_type, is_enabled, custom_limit) 
SELECT sp.id, 'ai_blog', true, 3 FROM subscription_packages sp WHERE sp.name = 'Gói Miễn phí';

-- Configure AI Basic package features
INSERT INTO package_features (package_id, feature_type, is_enabled, custom_limit) 
SELECT sp.id, 'seo_audit', true, NULL FROM subscription_packages sp WHERE sp.name = 'Gói AI Cơ bản';
INSERT INTO package_features (package_id, feature_type, is_enabled, custom_limit) 
SELECT sp.id, 'technical_seo', true, NULL FROM subscription_packages sp WHERE sp.name = 'Gói AI Cơ bản';
INSERT INTO package_features (package_id, feature_type, is_enabled, custom_limit) 
SELECT sp.id, 'ai_rewrite', true, 100 FROM subscription_packages sp WHERE sp.name = 'Gói AI Cơ bản';
INSERT INTO package_features (package_id, feature_type, is_enabled, custom_limit) 
SELECT sp.id, 'ai_meta', true, 300 FROM subscription_packages sp WHERE sp.name = 'Gói AI Cơ bản';

-- Configure Content Pro package features  
INSERT INTO package_features (package_id, feature_type, is_enabled, custom_limit) 
SELECT sp.id, sf.feature_type, true, 
  CASE sf.feature_type 
    WHEN 'ai_blog' THEN 10
    WHEN 'ai_content_plan' THEN 30
    WHEN 'pdf_export' THEN 30
    ELSE sf.suggested_limit 
  END
FROM subscription_packages sp, subscription_features sf 
WHERE sp.name = 'Gói Content Pro';

-- Create function to check user feature access
CREATE OR REPLACE FUNCTION check_feature_access(user_id UUID, feature feature_type)
RETURNS TABLE(has_access BOOLEAN, remaining_usage INTEGER, total_limit INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_subscription RECORD;
  feature_config RECORD;
  current_usage INTEGER;
BEGIN
  -- Get user's current active subscription
  SELECT us.*, sp.name as package_name INTO current_subscription
  FROM user_subscriptions us
  JOIN subscription_packages sp ON sp.id = us.package_id
  WHERE us.user_id = check_feature_access.user_id 
    AND us.status = 'active'
    AND (us.end_date IS NULL OR us.end_date > now())
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- No active subscription, deny access
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;
  
  -- Get feature configuration for this package
  SELECT pf.*, sf.suggested_limit INTO feature_config
  FROM package_features pf
  JOIN subscription_features sf ON sf.feature_type = pf.feature_type
  WHERE pf.package_id = current_subscription.package_id
    AND pf.feature_type = feature
    AND pf.is_enabled = true;
    
  IF NOT FOUND THEN
    -- Feature not enabled in package
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;
  
  -- Get current usage for this period
  SELECT COALESCE(fu.usage_count, 0) INTO current_usage
  FROM feature_usage fu
  WHERE fu.user_id = check_feature_access.user_id
    AND fu.feature_type = feature
    AND fu.period_start = date_trunc('month', now());
    
  IF current_usage IS NULL THEN
    current_usage := 0;
  END IF;
  
  -- Check if user has remaining usage
  IF feature_config.custom_limit IS NULL THEN
    -- Unlimited usage
    RETURN QUERY SELECT true, -1, -1;
  ELSE
    -- Limited usage
    RETURN QUERY SELECT 
      (current_usage < feature_config.custom_limit),
      (feature_config.custom_limit - current_usage),
      feature_config.custom_limit;
  END IF;
END;
$$;