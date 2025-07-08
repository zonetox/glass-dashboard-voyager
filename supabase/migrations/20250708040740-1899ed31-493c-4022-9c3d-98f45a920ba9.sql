
-- Create API tokens table for user authentication
CREATE TABLE public.api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  token_prefix TEXT NOT NULL, -- First 8 characters for display
  permissions JSONB DEFAULT '["scan", "results", "history"]'::jsonb,
  rate_limit_per_hour INTEGER DEFAULT 100,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create API usage tracking table
CREATE TABLE public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES public.api_tokens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  hour_bucket TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('hour', now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create competitor analysis table
CREATE TABLE public.competitor_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_website_url TEXT NOT NULL,
  competitor_urls JSONB NOT NULL, -- Array of competitor URLs
  analysis_data JSONB NOT NULL, -- Comparison results
  user_site_data JSONB NOT NULL, -- User's site analysis
  competitor_data JSONB NOT NULL, -- Competitors' analysis data
  insights JSONB DEFAULT '{}'::jsonb, -- AI-generated insights
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies for api_tokens
CREATE POLICY "Users can manage their own API tokens" ON public.api_tokens
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for api_usage
CREATE POLICY "Users can view their own API usage" ON public.api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage" ON public.api_usage
  FOR INSERT WITH CHECK (true);

-- RLS policies for competitor_analysis
CREATE POLICY "Users can manage their own competitor analysis" ON public.competitor_analysis
  FOR ALL USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE OR REPLACE TRIGGER update_api_tokens_updated_at
  BEFORE UPDATE ON public.api_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_competitor_analysis_updated_at
  BEFORE UPDATE ON public.competitor_analysis
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create unique index for rate limiting
CREATE UNIQUE INDEX api_usage_token_hour_endpoint_idx 
  ON public.api_usage (token_id, hour_bucket, endpoint);

-- Create function to check API rate limits
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  _token_id UUID,
  _endpoint TEXT,
  _rate_limit INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage INTEGER;
  current_hour TIMESTAMP WITH TIME ZONE;
BEGIN
  current_hour := date_trunc('hour', now());
  
  SELECT COALESCE(SUM(request_count), 0) INTO current_usage
  FROM public.api_usage
  WHERE token_id = _token_id 
    AND hour_bucket = current_hour
    AND endpoint = _endpoint;
    
  RETURN current_usage < _rate_limit;
END;
$$;

-- Create function to record API usage
CREATE OR REPLACE FUNCTION public.record_api_usage(
  _token_id UUID,
  _user_id UUID,
  _endpoint TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_hour TIMESTAMP WITH TIME ZONE;
BEGIN
  current_hour := date_trunc('hour', now());
  
  INSERT INTO public.api_usage (token_id, user_id, endpoint, hour_bucket, request_count)
  VALUES (_token_id, _user_id, _endpoint, current_hour, 1)
  ON CONFLICT (token_id, hour_bucket, endpoint)
  DO UPDATE SET 
    request_count = api_usage.request_count + 1,
    created_at = now();
    
  -- Update last_used_at on token
  UPDATE public.api_tokens 
  SET last_used_at = now() 
  WHERE id = _token_id;
END;
$$;
