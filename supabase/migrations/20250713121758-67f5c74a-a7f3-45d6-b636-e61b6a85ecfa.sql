-- Create semantic_results table for storing semantic analysis data
CREATE TABLE public.semantic_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  user_id UUID NOT NULL,
  main_topic TEXT,
  missing_topics JSONB DEFAULT '[]'::jsonb,
  search_intent TEXT,
  entities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.semantic_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own semantic analysis" 
ON public.semantic_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own semantic analysis" 
ON public.semantic_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own semantic analysis" 
ON public.semantic_results 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own semantic analysis" 
ON public.semantic_results 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_semantic_results_updated_at
BEFORE UPDATE ON public.semantic_results
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();