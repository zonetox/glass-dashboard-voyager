-- Create email_queue table for scheduled email sending
CREATE TYPE email_status AS ENUM ('queued', 'sent', 'failed');
CREATE TYPE email_type AS ENUM ('onboarding', 'reminder', 'promo');

CREATE TABLE public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status email_status DEFAULT 'queued',
  type email_type DEFAULT 'onboarding',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for email_queue
CREATE POLICY "Users can view their own queued emails" 
ON public.email_queue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all emails" 
ON public.email_queue 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_email_queue_user_id ON public.email_queue(user_id);
CREATE INDEX idx_email_queue_send_at ON public.email_queue(send_at);
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_type ON public.email_queue(type);