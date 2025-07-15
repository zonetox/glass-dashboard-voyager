-- Create user_autopilot table for Auto-Pilot SEO Mode settings
CREATE TABLE public.user_autopilot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  frequency_days INTEGER NOT NULL DEFAULT 7,
  auto_fix_seo BOOLEAN NOT NULL DEFAULT false,
  auto_update_content BOOLEAN NOT NULL DEFAULT false,
  auto_generate_schema BOOLEAN NOT NULL DEFAULT false,
  send_reports BOOLEAN NOT NULL DEFAULT false,
  backup_before_fix BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_autopilot ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own autopilot settings" 
ON public.user_autopilot 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own autopilot settings" 
ON public.user_autopilot 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own autopilot settings" 
ON public.user_autopilot 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own autopilot settings" 
ON public.user_autopilot 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_autopilot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_autopilot_updated_at
BEFORE UPDATE ON public.user_autopilot
FOR EACH ROW
EXECUTE FUNCTION public.update_user_autopilot_updated_at();