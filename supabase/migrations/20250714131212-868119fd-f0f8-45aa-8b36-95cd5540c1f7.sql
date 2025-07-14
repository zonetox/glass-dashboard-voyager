-- Create transactions table to log payment transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_provider TEXT NOT NULL, -- 'stripe', 'paypal', 'momo', 'vnpay'
  external_transaction_id TEXT,
  session_id TEXT,
  amount INTEGER, -- Amount in cents/smallest currency unit
  currency TEXT DEFAULT 'vnd',
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'cancelled'
  payment_data JSONB, -- Store raw webhook data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

-- Add updated_at trigger
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();