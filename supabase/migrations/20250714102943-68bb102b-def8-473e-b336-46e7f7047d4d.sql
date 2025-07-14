-- Create plans table
CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  monthly_limit integer NOT NULL DEFAULT 0,
  pdf_enabled boolean NOT NULL DEFAULT false,
  ai_enabled boolean NOT NULL DEFAULT false,
  price_vnd integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user_plans table
CREATE TABLE public.user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone,
  used_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, plan_id, start_date)
);

-- Enable RLS on both tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for plans table (readable by everyone)
CREATE POLICY "Plans are viewable by everyone" 
ON public.plans 
FOR SELECT 
USING (true);

-- Only admins can modify plans
CREATE POLICY "Admins can manage plans" 
ON public.plans 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_plans table
CREATE POLICY "Users can view their own plans" 
ON public.user_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans" 
ON public.user_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
ON public.user_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user plans" 
ON public.user_plans 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX idx_user_plans_plan_id ON public.user_plans(plan_id);
CREATE INDEX idx_user_plans_user_end_date ON public.user_plans(user_id, end_date);

-- Create trigger for updated_at
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_plans_updated_at
BEFORE UPDATE ON public.user_plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default plans
INSERT INTO public.plans (id, name, monthly_limit, pdf_enabled, ai_enabled, price_vnd) VALUES
('free', 'Miễn Phí', 5, false, false, 0),
('pro', 'Pro', 100, true, true, 299000);

-- Function to get user's current active plan
CREATE OR REPLACE FUNCTION public.get_user_current_plan(_user_id uuid)
RETURNS TABLE(
  plan_id text,
  plan_name text,
  monthly_limit integer,
  pdf_enabled boolean,
  ai_enabled boolean,
  used_count integer,
  remaining_count integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.name,
    p.monthly_limit,
    p.pdf_enabled,
    p.ai_enabled,
    up.used_count,
    GREATEST(0, p.monthly_limit - up.used_count) as remaining_count
  FROM public.user_plans up
  JOIN public.plans p ON p.id = up.plan_id
  WHERE up.user_id = _user_id
    AND (up.end_date IS NULL OR up.end_date > CURRENT_TIMESTAMP)
    AND up.start_date <= CURRENT_TIMESTAMP
  ORDER BY up.start_date DESC
  LIMIT 1;
$$;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_user_usage(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_plan RECORD;
BEGIN
  -- Get current active plan
  SELECT * INTO current_plan FROM public.get_user_current_plan(_user_id);
  
  IF NOT FOUND THEN
    -- No active plan, assign free plan
    INSERT INTO public.user_plans (user_id, plan_id)
    VALUES (_user_id, 'free');
    
    -- Get the newly created plan
    SELECT * INTO current_plan FROM public.get_user_current_plan(_user_id);
  END IF;
  
  -- Check if user has remaining usage
  IF current_plan.remaining_count <= 0 THEN
    RETURN false;
  END IF;
  
  -- Increment usage
  UPDATE public.user_plans 
  SET used_count = used_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = _user_id 
    AND plan_id = current_plan.plan_id
    AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP)
    AND start_date <= CURRENT_TIMESTAMP;
    
  RETURN true;
END;
$$;