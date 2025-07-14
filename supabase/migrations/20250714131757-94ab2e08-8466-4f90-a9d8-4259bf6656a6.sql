-- Drop existing transactions table and recreate with exact specifications
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Create transactions table with exact requirements
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL, -- 'stripe', 'paypal', 'momo', 'vnpay'
  status TEXT NOT NULL, -- 'success', 'failed'
  amount INTEGER NOT NULL, -- Amount in cents/smallest currency unit
  currency TEXT NOT NULL DEFAULT 'vnd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  plan_id TEXT NOT NULL,
  raw_data JSONB NOT NULL -- Store raw webhook/payment data
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update transactions" 
ON public.transactions 
FOR UPDATE 
USING (true);