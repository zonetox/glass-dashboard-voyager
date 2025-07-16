-- Create content_plans table
CREATE TABLE public.content_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  focus_topic TEXT NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own content plans" 
ON public.content_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content plans" 
ON public.content_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content plans" 
ON public.content_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content plans" 
ON public.content_plans 
FOR DELETE 
USING (auth.uid() = user_id);