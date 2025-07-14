-- Update user_profiles table to include email verification status
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create user_transactions table for payment history
CREATE TABLE IF NOT EXISTS public.user_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'VND',
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  payment_method TEXT, -- 'stripe', 'paypal', etc.
  plan_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activity logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'login', 'scan', 'upgrade', 'downgrade', etc.
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.user_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" 
ON public.user_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all transactions" 
ON public.user_transactions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create RLS policies for user_activity_logs
CREATE POLICY "Users can view their own activity" 
ON public.user_activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" 
ON public.user_activity_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON public.user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON public.user_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON public.user_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON public.user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_user_transactions_updated_at
BEFORE UPDATE ON public.user_transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create a function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  _user_id UUID,
  _action TEXT,
  _details JSONB DEFAULT NULL,
  _ip_address INET DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_activity_logs (user_id, action, details, ip_address, user_agent)
  VALUES (_user_id, _action, _details, _ip_address, _user_agent);
END;
$$;

-- Create a function to get user plan summary
CREATE OR REPLACE FUNCTION public.get_user_plan_summary(_user_id UUID)
RETURNS TABLE(
  plan_name TEXT,
  scans_used INTEGER,
  scans_limit INTEGER,
  scans_remaining INTEGER,
  reset_date TIMESTAMP WITH TIME ZONE,
  is_premium BOOLEAN
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    p.name,
    uu.scans_used,
    up.scans_limit,
    GREATEST(0, up.scans_limit - uu.scans_used) as scans_remaining,
    uu.reset_date,
    (p.name != 'Free Plan') as is_premium
  FROM public.user_plans upp
  JOIN public.plans p ON p.id = upp.plan_id
  JOIN public.user_profiles up ON up.user_id = upp.user_id
  LEFT JOIN public.user_usage uu ON uu.user_id = upp.user_id
  WHERE upp.user_id = _user_id
    AND (upp.end_date IS NULL OR upp.end_date > CURRENT_TIMESTAMP)
    AND upp.start_date <= CURRENT_TIMESTAMP
  ORDER BY upp.start_date DESC
  LIMIT 1;
$$;