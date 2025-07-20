-- Add two-factor authentication columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS backup_codes TEXT[];