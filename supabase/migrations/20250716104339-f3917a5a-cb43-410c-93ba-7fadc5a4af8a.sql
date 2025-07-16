-- Create auto_links table for internal link suggestions
CREATE TABLE public.auto_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_article_id UUID NOT NULL,
  to_article_id UUID NOT NULL,
  anchor_text TEXT NOT NULL,
  position INTEGER NOT NULL,
  ai_score NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'suggested',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_ai_score CHECK (ai_score >= 0.0 AND ai_score <= 1.0)
);

-- Enable Row Level Security
ALTER TABLE public.auto_links ENABLE ROW LEVEL SECURITY;

-- Create policies for auto_links
CREATE POLICY "Users can view their own auto links" 
ON public.auto_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own auto links" 
ON public.auto_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auto links" 
ON public.auto_links 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own auto links" 
ON public.auto_links 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_auto_links_user_id ON public.auto_links(user_id);
CREATE INDEX idx_auto_links_from_article ON public.auto_links(from_article_id);
CREATE INDEX idx_auto_links_status ON public.auto_links(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_auto_links_updated_at
BEFORE UPDATE ON public.auto_links
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();