-- Reset usage count for user to allow testing
UPDATE public.user_plans 
SET used_count = 0, updated_at = now()
WHERE user_id = '27cbf172-a14a-4229-ab20-eea6daf33ba3';