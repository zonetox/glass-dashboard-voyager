-- Create subscription_packages table with correct structure
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  base_price_vnd integer NOT NULL DEFAULT 0,
  is_default boolean DEFAULT false,
  is_recommended boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for subscription_packages
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_packages
CREATE POLICY "Only admins can manage subscription packages" 
ON public.subscription_packages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Subscription packages are viewable by everyone" 
ON public.subscription_packages
FOR SELECT
USING (true);

-- Create subscription_features table if not exists
CREATE TABLE IF NOT EXISTS public.subscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_type text NOT NULL UNIQUE,
  feature_name text NOT NULL,
  description text,
  suggested_limit integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for subscription_features
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_features
CREATE POLICY "Only admins can manage subscription features" 
ON public.subscription_features
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Subscription features are viewable by everyone" 
ON public.subscription_features
FOR SELECT
USING (true);

-- Insert default subscription packages
INSERT INTO public.subscription_packages (name, description, base_price_vnd, is_default, is_recommended) 
VALUES 
  ('Gói Cơ Bản', 'Gói dành cho cá nhân và doanh nghiệp nhỏ', 299000, false, false),
  ('Gói Chuyên Nghiệp', 'Gói dành cho doanh nghiệp vừa', 599000, false, true),
  ('Gói Doanh Nghiệp', 'Gói dành cho doanh nghiệp lớn', 999000, false, false)
ON CONFLICT DO NOTHING;

-- Now execute the admin promotion function
SELECT public.promote_user_to_admin_by_email('tanloifmc@yahoo.com');