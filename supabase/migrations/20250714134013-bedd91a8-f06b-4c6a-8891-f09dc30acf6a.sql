-- Create email_logs table for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email logs
CREATE POLICY "Users can view their own email logs" 
ON public.email_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert email logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update email logs" 
ON public.email_logs 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_logs_updated_at
BEFORE UPDATE ON public.email_logs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();