-- Fix the handle_new_user trigger to handle metadata properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, stage_name, role, phone)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'stage_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.artist_role, 'artist'::public.artist_role),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the signup
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    -- Still insert basic profile to prevent auth failure
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'artist'::public.artist_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the user update trigger as well
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.user_profiles
  SET 
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
    stage_name = COALESCE(NEW.raw_user_meta_data->>'stage_name', stage_name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_user_update: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Ensure the update trigger exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();