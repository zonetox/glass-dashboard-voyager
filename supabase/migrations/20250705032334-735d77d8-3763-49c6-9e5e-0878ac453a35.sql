
-- Create optimization_history table to track all optimization activities
CREATE TABLE public.optimization_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  website_url text NOT NULL,
  seo_score_before integer DEFAULT 0,
  seo_score_after integer DEFAULT 0,
  desktop_speed_before integer DEFAULT 0,
  desktop_speed_after integer DEFAULT 0,
  mobile_speed_before integer DEFAULT 0,
  mobile_speed_after integer DEFAULT 0,
  fixes_applied jsonb NOT NULL DEFAULT '[]'::jsonb,
  backup_url text,
  report_url text,
  status text DEFAULT 'completed',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.optimization_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for optimization_history table
CREATE POLICY "Users can view their own optimization history" 
  ON public.optimization_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own optimization history" 
  ON public.optimization_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimization history" 
  ON public.optimization_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own optimization history" 
  ON public.optimization_history 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable real-time subscriptions
ALTER TABLE public.optimization_history REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.optimization_history;

-- Create indexes for better performance
CREATE INDEX optimization_history_user_id_idx ON public.optimization_history(user_id);
CREATE INDEX optimization_history_website_url_idx ON public.optimization_history(website_url);
CREATE INDEX optimization_history_created_at_idx ON public.optimization_history(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER optimization_history_updated_at
  BEFORE UPDATE ON public.optimization_history
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
