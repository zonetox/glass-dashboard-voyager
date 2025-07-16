-- Create content_assignments table
CREATE TABLE public.content_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_plan_id UUID NOT NULL REFERENCES public.content_plans(id) ON DELETE CASCADE,
  writer_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view assignments for their content plans" 
ON public.content_assignments 
FOR SELECT 
USING (
  content_plan_id IN (
    SELECT id FROM public.content_plans WHERE user_id = auth.uid()
  ) 
  OR writer_id = auth.uid()
);

CREATE POLICY "Users can create assignments for their content plans" 
ON public.content_assignments 
FOR INSERT 
WITH CHECK (
  content_plan_id IN (
    SELECT id FROM public.content_plans WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update assignments for their content plans or their own assignments" 
ON public.content_assignments 
FOR UPDATE 
USING (
  content_plan_id IN (
    SELECT id FROM public.content_plans WHERE user_id = auth.uid()
  ) 
  OR writer_id = auth.uid()
);

CREATE POLICY "Users can delete assignments for their content plans" 
ON public.content_assignments 
FOR DELETE 
USING (
  content_plan_id IN (
    SELECT id FROM public.content_plans WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_content_assignments_updated_at
BEFORE UPDATE ON public.content_assignments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();