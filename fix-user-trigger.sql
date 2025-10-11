-- Fix the handle_new_user trigger function to use correct table name
-- This fixes the "Database error saving new user" issue

-- Drop trigger first (required before dropping function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now drop the broken function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create corrected function that inserts into users table (not profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger with the fixed function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();