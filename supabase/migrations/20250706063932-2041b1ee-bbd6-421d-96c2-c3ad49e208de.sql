
-- Create optimization history table for rollback functionality
CREATE TABLE public.optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  website_url TEXT NOT NULL,
  seo_score_before INTEGER DEFAULT 0,
  seo_score_after INTEGER DEFAULT 0,
  desktop_speed_before INTEGER DEFAULT 0,
  desktop_speed_after INTEGER DEFAULT 0,
  mobile_speed_before INTEGER DEFAULT 0,
  mobile_speed_after INTEGER DEFAULT 0,
  fixes_applied JSONB NOT NULL DEFAULT '[]'::jsonb,
  backup_url TEXT, -- URL to backup in storage
  report_url TEXT, -- URL to optimization report
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for optimization history
ALTER TABLE public.optimization_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for optimization history
CREATE POLICY "Users can view their own optimization history" ON public.optimization_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own optimization history" ON public.optimization_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own optimization history" ON public.optimization_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own optimization history" ON public.optimization_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public) VALUES ('backups', 'backups', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true);

-- Storage policies for backups
CREATE POLICY "Users can upload their own backups" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'backups' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own backups" ON storage.objects
  FOR SELECT USING (bucket_id = 'backups' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for reports  
CREATE POLICY "Users can upload their own reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_optimization_history_updated_at
  BEFORE UPDATE ON public.optimization_history
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
