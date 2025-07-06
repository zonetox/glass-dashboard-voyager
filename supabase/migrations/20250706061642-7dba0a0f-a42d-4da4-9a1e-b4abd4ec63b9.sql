
-- Create user tiers enum
CREATE TYPE public.user_tier AS ENUM ('free', 'pro', 'agency');

-- Create user profiles table with tier information
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tier public.user_tier NOT NULL DEFAULT 'free',
  scans_limit INTEGER NOT NULL DEFAULT 5,
  ai_rewrites_limit INTEGER NOT NULL DEFAULT 10,
  optimizations_limit INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create usage tracking table
CREATE TABLE public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scans_used INTEGER NOT NULL DEFAULT 0,
  ai_rewrites_used INTEGER NOT NULL DEFAULT 0,
  optimizations_used INTEGER NOT NULL DEFAULT 0,
  reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, reset_date)
);

-- Create scan results storage table
CREATE TABLE public.scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  website_url TEXT NOT NULL,
  scan_data_path TEXT, -- Path to JSON file in storage
  optimization_log_path TEXT, -- Path to optimization log in storage
  pdf_report_path TEXT, -- Path to PDF report in storage
  seo_score INTEGER,
  issues_count INTEGER,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_usage
CREATE POLICY "Users can view their own usage" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own usage" ON public.user_usage
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usage" ON public.user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for scan_results
CREATE POLICY "Users can view their own scan results" ON public.scan_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scan results" ON public.scan_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scan results" ON public.scan_results
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scan results" ON public.scan_results
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, tier)
  VALUES (NEW.id, 'free');
  
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to reset monthly usage
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage buckets for scan results
INSERT INTO storage.buckets (id, name, public) VALUES ('scan-results', 'scan-results', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('optimization-logs', 'optimization-logs', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('pdf-reports', 'pdf-reports', false);

-- Storage policies
CREATE POLICY "Users can upload their own scan results" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'scan-results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own scan results" ON storage.objects
  FOR SELECT USING (bucket_id = 'scan-results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own optimization logs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'optimization-logs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own optimization logs" ON storage.objects
  FOR SELECT USING (bucket_id = 'optimization-logs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own PDF reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pdf-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own PDF reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdf-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON public.user_usage
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
