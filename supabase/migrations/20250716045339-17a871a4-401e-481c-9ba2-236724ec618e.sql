-- Create content_drafts table
CREATE TABLE public.content_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.content_plans(id) ON DELETE CASCADE,
  writer_id UUID NOT NULL,
  content TEXT,
  last_saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'done')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Writers can view their own drafts" 
ON public.content_drafts 
FOR SELECT 
USING (auth.uid() = writer_id);

CREATE POLICY "Writers can create their own drafts" 
ON public.content_drafts 
FOR INSERT 
WITH CHECK (auth.uid() = writer_id);

CREATE POLICY "Writers can update their own drafts" 
ON public.content_drafts 
FOR UPDATE 
USING (auth.uid() = writer_id);

CREATE POLICY "Content plan owners can view drafts for their content plans" 
ON public.content_drafts 
FOR SELECT 
USING (
  plan_id IN (
    SELECT id FROM public.content_plans WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_content_drafts_updated_at
BEFORE UPDATE ON public.content_drafts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();