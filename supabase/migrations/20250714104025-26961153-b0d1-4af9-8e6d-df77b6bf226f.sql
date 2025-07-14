-- Update the handle_new_user function to also create user_plans entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (user_id, tier)
  VALUES (NEW.id, 'free');
  
  -- Create user usage
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);
  
  -- Assign role member by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  -- Create free plan entry
  INSERT INTO public.user_plans (user_id, plan_id, start_date, end_date, used_count)
  VALUES (NEW.id, 'free', now(), null, 0);
  
  RETURN NEW;
END;
$$;