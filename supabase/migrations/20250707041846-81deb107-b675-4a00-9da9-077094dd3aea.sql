
-- Create scheduled scans table for automated rescanning
CREATE TABLE public.scheduled_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  website_url TEXT NOT NULL,
  frequency_days INTEGER NOT NULL DEFAULT 30,
  last_scan_at TIMESTAMP WITH TIME ZONE,
  next_scan_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  auto_optimize BOOLEAN DEFAULT false,
  email_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scan comparison table to track score changes
CREATE TABLE public.scan_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  website_url TEXT NOT NULL,
  previous_seo_score INTEGER,
  current_seo_score INTEGER,
  score_change INTEGER,
  new_issues JSONB DEFAULT '[]'::jsonb,
  fixed_issues JSONB DEFAULT '[]'::jsonb,
  alert_sent BOOLEAN DEFAULT false,
  scan_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduled_scans
CREATE POLICY "Users can manage their own scheduled scans" ON public.scheduled_scans
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for scan_comparisons
CREATE POLICY "Users can view their own scan comparisons" ON public.scan_comparisons
  FOR ALL USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE OR REPLACE TRIGGER update_scheduled_scans_updated_at
  BEFORE UPDATE ON public.scheduled_scans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cron job for automated rescanning (runs every hour to check for due scans)
SELECT cron.schedule(
  'automated-website-rescans',
  '0 * * * *', -- every hour
  $$
  SELECT
    net.http_post(
        url:='https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1/automated-rescan',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljamRycXl6dHp3ZWRkdGNvZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTc4MTQsImV4cCI6MjA2NzA5MzgxNH0.1hVFiDBUwBVrU8RnA4cBXDixt4-EQnNF6qtET7ruWXo"}'::jsonb,
        body:=concat('{"trigger_time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
