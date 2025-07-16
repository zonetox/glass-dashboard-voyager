-- Create content_feedback table
CREATE TABLE public.content_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draft_id UUID NOT NULL REFERENCES public.content_drafts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Reviewers can create feedback" 
ON public.content_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Content owners and reviewers can view feedback" 
ON public.content_feedback 
FOR SELECT 
USING (
  (auth.uid() = reviewer_id) OR 
  (draft_id IN (
    SELECT cd.id FROM public.content_drafts cd
    JOIN public.content_plans cp ON cp.id = cd.plan_id
    WHERE cp.user_id = auth.uid()
  )) OR
  (draft_id IN (
    SELECT id FROM public.content_drafts WHERE writer_id = auth.uid()
  ))
);

-- Update content_drafts status constraint to include new statuses
ALTER TABLE public.content_drafts 
DROP CONSTRAINT IF EXISTS content_drafts_status_check;

ALTER TABLE public.content_drafts 
ADD CONSTRAINT content_drafts_status_check 
CHECK (status IN ('draft', 'in_progress', 'done', 'waiting_review', 'approved', 'needs_changes'));

-- Create trigger for updated_at
CREATE TRIGGER update_content_feedback_updated_at
BEFORE UPDATE ON public.content_feedback
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();