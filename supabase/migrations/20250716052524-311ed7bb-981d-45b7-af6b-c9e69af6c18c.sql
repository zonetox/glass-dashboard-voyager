-- Create wordpress_sites table
CREATE TABLE public.wordpress_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  application_password TEXT NOT NULL,
  default_category TEXT DEFAULT 'general',
  default_status TEXT DEFAULT 'publish' CHECK (default_status IN ('draft', 'publish', 'private')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wordpress_sites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own WordPress sites" 
ON public.wordpress_sites 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_wordpress_sites_updated_at
BEFORE UPDATE ON public.wordpress_sites
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add wordpress_sites column to content_drafts for multi-site publishing
ALTER TABLE public.content_drafts 
ADD COLUMN target_sites UUID[] DEFAULT '{}';

-- Add published_sites to track which sites the content was published to
ALTER TABLE public.content_drafts 
ADD COLUMN published_sites JSONB DEFAULT '[]';