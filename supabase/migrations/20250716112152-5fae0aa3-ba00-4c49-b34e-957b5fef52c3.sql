-- Create A/B testing table for meta titles and descriptions
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  original_title TEXT NOT NULL,
  original_description TEXT NOT NULL,
  version_a JSONB NOT NULL, -- {title, description, reasoning}
  version_b JSONB NOT NULL, -- {title, description, reasoning}
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  ctr_data JSONB DEFAULT '{"version_a": {"impressions": 0, "clicks": 0}, "version_b": {"impressions": 0, "clicks": 0}}'::jsonb,
  winner_version TEXT, -- 'a', 'b', or null
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'paused'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own A/B tests" 
ON public.ab_tests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own A/B tests" 
ON public.ab_tests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own A/B tests" 
ON public.ab_tests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own A/B tests" 
ON public.ab_tests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ab_tests_updated_at
BEFORE UPDATE ON public.ab_tests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();