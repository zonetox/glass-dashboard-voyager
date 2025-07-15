-- Create ai_content_logs table for tracking AI content generation
CREATE TABLE public.ai_content_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  keyword TEXT NOT NULL,
  intent TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  article_length INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_content_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_content_logs
CREATE POLICY "Users can view their own content logs" 
ON public.ai_content_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content logs" 
ON public.ai_content_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_content_logs_updated_at
BEFORE UPDATE ON public.ai_content_logs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();