-- Create content_intent table for storing intent classification results
CREATE TABLE public.content_intent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  intent_type TEXT NOT NULL CHECK (intent_type IN ('informational', 'navigational', 'transactional', 'commercial')),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_intent ENABLE ROW LEVEL SECURITY;

-- Create policies for content_intent
CREATE POLICY "Users can view their own content intent" 
ON public.content_intent 
FOR SELECT 
USING (content_id IN (SELECT id FROM scans WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own content intent" 
ON public.content_intent 
FOR INSERT 
WITH CHECK (content_id IN (SELECT id FROM scans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own content intent" 
ON public.content_intent 
FOR UPDATE 
USING (content_id IN (SELECT id FROM scans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own content intent" 
ON public.content_intent 
FOR DELETE 
USING (content_id IN (SELECT id FROM scans WHERE user_id = auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_content_intent_updated_at
BEFORE UPDATE ON public.content_intent
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();