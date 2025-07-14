-- Add business profile fields to user_profiles table
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'personal';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS business_website TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS business_category TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS business_hours JSONB;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS google_my_business_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS coordinates JSONB;

-- Create index for business queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_type ON public.user_profiles(business_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_category ON public.user_profiles(business_category);