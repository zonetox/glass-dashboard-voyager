-- Update content_drafts status constraint to include all workflow statuses
ALTER TABLE public.content_drafts 
DROP CONSTRAINT IF EXISTS content_drafts_status_check;

ALTER TABLE public.content_drafts 
ADD CONSTRAINT content_drafts_status_check 
CHECK (status IN ('draft', 'in_progress', 'waiting_review', 'needs_changes', 'approved', 'scheduled', 'published'));

-- Add scheduled_date column for scheduled publishing
ALTER TABLE public.content_drafts 
ADD COLUMN scheduled_date TIMESTAMP WITH TIME ZONE;