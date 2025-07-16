-- Create translations table for multi-language content
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_id UUID NOT NULL,
  lang TEXT NOT NULL,
  translated_title TEXT NOT NULL,
  translated_content TEXT NOT NULL,
  translated_meta JSONB DEFAULT '{}'::jsonb,
  ai_quality_score NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_ai_quality_score CHECK (ai_quality_score >= 0.0 AND ai_quality_score <= 1.0),
  CONSTRAINT check_lang_format CHECK (lang ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  UNIQUE(original_id, lang)
);

-- Enable Row Level Security
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policies for translations
CREATE POLICY "Users can view their own translations" 
ON public.translations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own translations" 
ON public.translations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own translations" 
ON public.translations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own translations" 
ON public.translations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_translations_user_id ON public.translations(user_id);
CREATE INDEX idx_translations_original_id ON public.translations(original_id);
CREATE INDEX idx_translations_lang ON public.translations(lang);
CREATE INDEX idx_translations_status ON public.translations(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();