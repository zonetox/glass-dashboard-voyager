-- Update backups table structure for backup-site functionality
ALTER TABLE public.backups 
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('meta', 'schema', 'content', 'html')),
ADD COLUMN IF NOT EXISTS original_data JSONB,
ADD COLUMN IF NOT EXISTS ai_suggested_data JSONB;

-- Update existing columns to be nullable since we're adding new functionality
ALTER TABLE public.backups 
ALTER COLUMN website_url DROP NOT NULL,
ALTER COLUMN backup_type DROP NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_backups_url ON public.backups(url);
CREATE INDEX IF NOT EXISTS idx_backups_type ON public.backups(type);

-- Update RLS policies for new structure
DROP POLICY IF EXISTS "Users can manage their own backups" ON public.backups;

CREATE POLICY "Users can view their own backups" 
ON public.backups 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backups" 
ON public.backups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backups" 
ON public.backups 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backups" 
ON public.backups 
FOR DELETE 
USING (auth.uid() = user_id);