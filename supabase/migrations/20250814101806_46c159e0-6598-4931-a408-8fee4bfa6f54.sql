-- Create enum for feature types
CREATE TYPE feature_type AS ENUM (
  'seo_audit_basic',
  'ai_rewrite_content', 
  'ai_meta_generator',
  'ai_content_plan',
  'ai_blog_generator',
  'image_alt_checker',
  'technical_seo_audit',
  'pdf_export',
  'whitelabel_branding'
);

-- Update subscription_features table to match new feature types
CREATE TABLE IF NOT EXISTS public.subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_type feature_type NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  description TEXT,
  suggested_min_price_usd DECIMAL(10,2) DEFAULT 0,
  suggested_limit INTEGER,
  is_free BOOLEAN DEFAULT false,
  requires_tokens BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the features from your table
INSERT INTO public.subscription_features (feature_type, feature_name, description, suggested_min_price_usd, suggested_limit, is_free, requires_tokens) VALUES
('seo_audit_basic', 'SEO Audit Cơ bản', 'Kiểm tra SEO cơ bản cho website', 0, NULL, true, false),
('ai_rewrite_content', 'AI Rewrite Content', 'Viết lại nội dung bằng AI', 5, 100, false, true),
('ai_meta_generator', 'AI Meta Title/Description', 'Tạo meta title và description bằng AI', 2, 300, false, true),
('ai_content_plan', 'AI Content Plan Generator', 'Tạo kế hoạch nội dung bằng AI', 8, 30, false, true),
('ai_blog_generator', 'AI Blog Generator', 'Tạo blog tự động bằng AI', 10, 10, false, true),
('image_alt_checker', 'Image ALT Checker + AI Fix', 'Kiểm tra và sửa ALT text hình ảnh', 3, 300, false, true),
('technical_seo_audit', 'Technical SEO Audit nâng cao', 'Kiểm tra SEO kỹ thuật chi tiết', 2, NULL, false, false),
('pdf_export', 'Xuất báo cáo PDF', 'Xuất báo cáo dạng PDF', 1, 30, false, false),
('whitelabel_branding', 'Whitelabel Branding', 'Tùy chỉnh thương hiệu cho Agency', 7, NULL, false, false);

-- Create or update package_features table to use the new enum
ALTER TABLE public.package_features 
DROP CONSTRAINT IF EXISTS package_features_feature_type_fkey;

ALTER TABLE public.package_features 
ALTER COLUMN feature_type TYPE feature_type USING feature_type::feature_type;

-- Enable RLS
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_features
CREATE POLICY "subscription_features_select_all" ON public.subscription_features
FOR SELECT USING (true);

CREATE POLICY "subscription_features_admin_all" ON public.subscription_features
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_features_updated_at
  BEFORE UPDATE ON public.subscription_features
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();