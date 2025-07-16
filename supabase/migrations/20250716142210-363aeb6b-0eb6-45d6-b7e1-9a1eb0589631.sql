-- Create posts table for AI-generated content
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  keyword TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'vi',
  slug TEXT,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  categories TEXT[],
  outline JSONB,
  ai_score NUMERIC DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  wordpress_post_id INTEGER,
  wordpress_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own posts" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_language ON public.posts(language);
CREATE INDEX idx_posts_keyword ON public.posts(keyword);
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at);
CREATE INDEX idx_posts_published_at ON public.posts(published_at);