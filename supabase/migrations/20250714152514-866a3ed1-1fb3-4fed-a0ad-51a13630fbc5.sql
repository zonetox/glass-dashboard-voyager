-- Create API logs table for debugging and monitoring
CREATE TABLE public.api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  domain TEXT,
  method TEXT DEFAULT 'GET',
  endpoint TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  request_payload JSONB,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own API logs" 
ON public.api_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert API logs" 
ON public.api_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can insert their own API logs" 
ON public.api_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_api_logs_user_id ON public.api_logs(user_id);
CREATE INDEX idx_api_logs_api_name ON public.api_logs(api_name);
CREATE INDEX idx_api_logs_domain ON public.api_logs(domain);
CREATE INDEX idx_api_logs_status_code ON public.api_logs(status_code);
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at DESC);
CREATE INDEX idx_api_logs_success ON public.api_logs(success);

-- Create updated_at trigger
CREATE TRIGGER update_api_logs_updated_at
BEFORE UPDATE ON public.api_logs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();