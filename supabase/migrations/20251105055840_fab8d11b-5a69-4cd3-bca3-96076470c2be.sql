-- Create user_notification_settings table
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  scan_alerts BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT false,
  security_alerts BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own notification settings"
ON public.user_notification_settings
FOR ALL
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id 
ON public.user_notification_settings(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_user_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_notification_settings_updated_at
BEFORE UPDATE ON public.user_notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_notification_settings_updated_at();