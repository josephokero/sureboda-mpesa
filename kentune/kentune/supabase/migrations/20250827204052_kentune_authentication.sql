-- Location: supabase/migrations/20250827204052_kentunez_authentication.sql
-- Schema Analysis: Fresh project - no existing tables found
-- Integration Type: Complete authentication system for KENTUNEZ artists
-- Dependencies: None - initial schema creation

-- 1. Create custom types for KENTUNEZ domain
CREATE TYPE public.artist_role AS ENUM ('artist', 'admin', 'moderator');
CREATE TYPE public.artist_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- 2. Create user_profiles table as intermediary for auth relationships
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    stage_name TEXT,
    role public.artist_role DEFAULT 'artist'::public.artist_role,
    status public.artist_status DEFAULT 'pending'::public.artist_status,
    phone TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

-- 4. Functions for automatic profile creation and updates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, stage_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'stage_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'artist')::public.artist_role
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', OLD.full_name),
    stage_name = COALESCE(NEW.raw_user_meta_data->>'stage_name', OLD.stage_name),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 5. Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies using Pattern 1 for core user table
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 7. Admin access policy using auth.users metadata
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 8. Triggers for new user creation and updates
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Mock Data for Testing
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    artist1_uuid UUID := gen_random_uuid();
    artist2_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@kentunez.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "KENTUNEZ Admin", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (artist1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'artist1@kentunez.com', crypt('artist123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "DJ Kimani", "stage_name": "Kimani Beats"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (artist2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'artist2@kentunez.com', crypt('artist123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sarah Wanjiku", "stage_name": "Sarafina"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Update artist profiles with additional info
    UPDATE public.user_profiles 
    SET 
        status = 'active'::public.artist_status,
        bio = 'Passionate about bringing Kenyan music to the world',
        location = 'Nairobi, Kenya',
        is_verified = true
    WHERE id = artist1_uuid;

    UPDATE public.user_profiles 
    SET 
        status = 'active'::public.artist_status,
        bio = 'Contemporary Kenyan artist blending traditional and modern sounds',
        location = 'Mombasa, Kenya',
        is_verified = true
    WHERE id = artist2_uuid;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- 10. Cleanup function for test data
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs for test data
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
  WHERE email LIKE '%@kentunez.com';

    -- Delete in dependency order (children first, then auth.users last)
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);

    -- Delete auth.users last (after all references are removed)
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;