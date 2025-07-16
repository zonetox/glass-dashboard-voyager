-- Create rankings table for keyword tracking
CREATE TABLE public.rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  keyword TEXT NOT NULL,
  target_url TEXT,
  current_rank INTEGER,
  previous_rank INTEGER,
  search_volume INTEGER,
  difficulty_score INTEGER,
  serp_data JSONB DEFAULT '{}',
  tracked_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_rankings_user_domain ON public.rankings(user_id, domain);
CREATE INDEX idx_rankings_keyword ON public.rankings(keyword);
CREATE INDEX idx_rankings_date ON public.rankings(tracked_date);

-- Enable RLS
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own rankings" 
ON public.rankings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rankings" 
ON public.rankings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rankings" 
ON public.rankings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rankings" 
ON public.rankings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rankings_updated_at
BEFORE UPDATE ON public.rankings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create table for keyword tracking configurations
CREATE TABLE public.keyword_tracking_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  target_urls JSONB DEFAULT '{}', -- Map of keyword -> target URL
  tracking_frequency INTEGER DEFAULT 7, -- Days between checks
  last_tracked_at TIMESTAMP WITH TIME ZONE,
  next_track_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for configs
ALTER TABLE public.keyword_tracking_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for configs
CREATE POLICY "Users can manage their own tracking configs" 
ON public.keyword_tracking_configs 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for configs
CREATE TRIGGER update_keyword_tracking_configs_updated_at
BEFORE UPDATE ON public.keyword_tracking_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();