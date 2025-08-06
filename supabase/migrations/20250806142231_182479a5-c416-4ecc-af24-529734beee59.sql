-- Fix the promote-admin edge function and remove all mock data

-- First, fix the user_tier enum to include enterprise
ALTER TYPE user_tier ADD VALUE 'enterprise';

-- Create the enterprise plan if it doesn't exist
INSERT INTO public.plans (id, name, price_vnd, monthly_limit, ai_enabled, pdf_enabled)
VALUES ('enterprise', 'Enterprise Plan', 0, 1000, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_limit = EXCLUDED.monthly_limit,
  ai_enabled = EXCLUDED.ai_enabled,
  pdf_enabled = EXCLUDED.pdf_enabled;