-- Create backups table for backup-site functionality
CREATE TABLE public.backups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('meta', 'schema', 'content', 'html')),
    original_data JSONB NOT NULL,
    ai_suggested_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create indexes for better performance
CREATE INDEX idx_backups_user_id ON public.backups(user_id);
CREATE INDEX idx_backups_url ON public.backups(url);
CREATE INDEX idx_backups_type ON public.backups(type);
CREATE INDEX idx_backups_created_at ON public.backups(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_backups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_backups_updated_at
    BEFORE UPDATE ON public.backups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_backups_updated_at();