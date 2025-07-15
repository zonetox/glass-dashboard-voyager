-- Create content_plans table
CREATE TABLE public.content_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  main_topic TEXT NOT NULL,
  plan_date DATE NOT NULL,
  title TEXT NOT NULL,
  main_keyword TEXT NOT NULL,
  secondary_keywords TEXT[],
  search_intent TEXT NOT NULL CHECK (search_intent IN ('informational', 'transactional', 'commercial', 'navigational')),
  content_length TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_content_plans_updated_at
BEFORE UPDATE ON public.content_plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();