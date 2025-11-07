-- Location: supabase/migrations/20250827205600_phone_verification_system.sql
-- Schema Analysis: Existing user_profiles table with phone column, artist_role/artist_status enums
-- Integration Type: Addition - SMS verification system enhancement
-- Dependencies: user_profiles table (existing)

-- 1. Create SMS verification status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'expired', 'failed');

-- 2. Create SMS verification codes table
CREATE TABLE public.sms_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    status public.verification_status DEFAULT 'pending'::public.verification_status,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes'),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for SMS verification
CREATE INDEX idx_sms_verification_codes_user_id ON public.sms_verification_codes(user_id);
CREATE INDEX idx_sms_verification_codes_phone ON public.sms_verification_codes(phone);
CREATE INDEX idx_sms_verification_codes_code ON public.sms_verification_codes(code);
CREATE INDEX idx_sms_verification_codes_status ON public.sms_verification_codes(status);
CREATE INDEX idx_sms_verification_codes_expires_at ON public.sms_verification_codes(expires_at);

-- 4. Add phone verification tracking columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN phone_verified_at TIMESTAMPTZ,
ADD COLUMN phone_verification_attempts INTEGER DEFAULT 0;

-- 5. Enable RLS for SMS verification table
ALTER TABLE public.sms_verification_codes ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for SMS verification
CREATE POLICY "users_manage_own_sms_verification_codes"
ON public.sms_verification_codes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Create function to generate verification code
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Generate 6-digit numeric code
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- 8. Create function to create SMS verification request
CREATE OR REPLACE FUNCTION public.create_sms_verification(
    target_phone TEXT
)
RETURNS TABLE(
    verification_id UUID,
    phone TEXT,
    expires_at TIMESTAMPTZ,
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID := auth.uid();
    verification_code TEXT;
    new_verification_id UUID;
    existing_code_count INTEGER;
    rate_limit_check INTEGER;
BEGIN
    -- Validate user is authenticated
    IF current_user_id IS NULL THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            target_phone, 
            NULL::TIMESTAMPTZ, 
            FALSE, 
            'User not authenticated'::TEXT;
        RETURN;
    END IF;

    -- Rate limiting: Check if user has requested too many codes recently (max 3 per hour)
    SELECT COUNT(*) INTO rate_limit_check
    FROM public.sms_verification_codes svc
    WHERE svc.user_id = current_user_id 
    AND svc.created_at > (CURRENT_TIMESTAMP - INTERVAL '1 hour');

    IF rate_limit_check >= 3 THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            target_phone, 
            NULL::TIMESTAMPTZ, 
            FALSE, 
            'Rate limit exceeded. Try again later'::TEXT;
        RETURN;
    END IF;

    -- Check for existing pending verification for this phone
    SELECT COUNT(*) INTO existing_code_count
    FROM public.sms_verification_codes svc
    WHERE svc.user_id = current_user_id 
    AND svc.phone = target_phone 
    AND svc.status = 'pending'::public.verification_status
    AND svc.expires_at > CURRENT_TIMESTAMP;

    -- If existing code exists, invalidate it
    IF existing_code_count > 0 THEN
        UPDATE public.sms_verification_codes 
        SET status = 'expired'::public.verification_status
        WHERE user_id = current_user_id 
        AND phone = target_phone 
        AND status = 'pending'::public.verification_status;
    END IF;

    -- Generate new verification code
    verification_code := public.generate_verification_code();
    
    -- Insert new verification record
    INSERT INTO public.sms_verification_codes (
        user_id, phone, code, status, expires_at
    ) VALUES (
        current_user_id, 
        target_phone, 
        verification_code, 
        'pending'::public.verification_status,
        CURRENT_TIMESTAMP + INTERVAL '10 minutes'
    ) RETURNING id INTO new_verification_id;

    -- Return success response
    RETURN QUERY SELECT 
        new_verification_id, 
        target_phone, 
        (CURRENT_TIMESTAMP + INTERVAL '10 minutes')::TIMESTAMPTZ, 
        TRUE, 
        'Verification code generated successfully'::TEXT;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            target_phone, 
            NULL::TIMESTAMPTZ, 
            FALSE, 
            ('Error creating verification: ' || SQLERRM)::TEXT;
END;
$$;

-- 9. Create function to verify SMS code
CREATE OR REPLACE FUNCTION public.verify_sms_code(
    target_phone TEXT,
    submitted_code TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    verified_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID := auth.uid();
    verification_record RECORD;
    current_time TIMESTAMPTZ := CURRENT_TIMESTAMP;
BEGIN
    -- Validate user is authenticated
    IF current_user_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'User not authenticated'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Get the latest pending verification for this phone
    SELECT * INTO verification_record
    FROM public.sms_verification_codes svc
    WHERE svc.user_id = current_user_id 
    AND svc.phone = target_phone 
    AND svc.status = 'pending'::public.verification_status
    ORDER BY svc.created_at DESC
    LIMIT 1;

    -- Check if verification record exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'No pending verification found for this phone number'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Check if code has expired
    IF verification_record.expires_at < current_time THEN
        UPDATE public.sms_verification_codes 
        SET status = 'expired'::public.verification_status
        WHERE id = verification_record.id;
        
        RETURN QUERY SELECT FALSE, 'Verification code has expired'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Check if max attempts reached
    IF verification_record.attempts >= verification_record.max_attempts THEN
        UPDATE public.sms_verification_codes 
        SET status = 'failed'::public.verification_status
        WHERE id = verification_record.id;
        
        RETURN QUERY SELECT FALSE, 'Maximum verification attempts exceeded'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Increment attempt counter
    UPDATE public.sms_verification_codes 
    SET attempts = attempts + 1
    WHERE id = verification_record.id;

    -- Check if submitted code matches
    IF verification_record.code = submitted_code THEN
        -- Code is correct - mark as verified
        UPDATE public.sms_verification_codes 
        SET 
            status = 'verified'::public.verification_status,
            verified_at = current_time
        WHERE id = verification_record.id;

        -- Update user profile to mark phone as verified
        UPDATE public.user_profiles 
        SET 
            phone_verified_at = current_time,
            phone = target_phone
        WHERE id = current_user_id;

        RETURN QUERY SELECT TRUE, 'Phone number verified successfully'::TEXT, current_time;
    ELSE
        -- Code is incorrect
        RETURN QUERY SELECT FALSE, 'Invalid verification code'::TEXT, NULL::TIMESTAMPTZ;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, ('Error verifying code: ' || SQLERRM)::TEXT, NULL::TIMESTAMPTZ;
END;
$$;

-- 10. Create function to check phone verification status
CREATE OR REPLACE FUNCTION public.get_phone_verification_status(
    target_phone TEXT
)
RETURNS TABLE(
    is_verified BOOLEAN,
    has_pending_code BOOLEAN,
    expires_at TIMESTAMPTZ,
    attempts_remaining INTEGER,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID := auth.uid();
    verification_record RECORD;
    user_verified BOOLEAN := FALSE;
BEGIN
    -- Validate user is authenticated
    IF current_user_id IS NULL THEN
        RETURN QUERY SELECT FALSE, FALSE, NULL::TIMESTAMPTZ, 0, 'User not authenticated'::TEXT;
        RETURN;
    END IF;

    -- Check if phone is already verified in user profile
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles up 
        WHERE up.id = current_user_id 
        AND up.phone = target_phone 
        AND up.phone_verified_at IS NOT NULL
    ) INTO user_verified;

    IF user_verified THEN
        RETURN QUERY SELECT TRUE, FALSE, NULL::TIMESTAMPTZ, 0, 'Phone already verified'::TEXT;
        RETURN;
    END IF;

    -- Get the latest verification record for this phone
    SELECT * INTO verification_record
    FROM public.sms_verification_codes svc
    WHERE svc.user_id = current_user_id 
    AND svc.phone = target_phone
    ORDER BY svc.created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, FALSE, NULL::TIMESTAMPTZ, 3, 'No verification attempts found'::TEXT;
        RETURN;
    END IF;

    -- Return status based on current verification record
    RETURN QUERY SELECT 
        (verification_record.status = 'verified'),
        (verification_record.status = 'pending' AND verification_record.expires_at > CURRENT_TIMESTAMP),
        verification_record.expires_at,
        GREATEST(0, verification_record.max_attempts - verification_record.attempts),
        CASE 
            WHEN verification_record.status = 'verified' THEN 'Phone verified'
            WHEN verification_record.status = 'pending' AND verification_record.expires_at > CURRENT_TIMESTAMP THEN 'Verification pending'
            WHEN verification_record.status = 'expired' THEN 'Verification code expired'
            WHEN verification_record.status = 'failed' THEN 'Verification failed - max attempts exceeded'
            ELSE 'Unknown status'
        END::TEXT;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, FALSE, NULL::TIMESTAMPTZ, 0, ('Error checking status: ' || SQLERRM)::TEXT;
END;
$$;

-- 11. Mock data for testing (using demo phone numbers)
DO $$
DECLARE
    existing_user_id UUID;
    test_verification_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create a test verification record
        INSERT INTO public.sms_verification_codes (
            id, user_id, phone, code, status, expires_at
        ) VALUES (
            test_verification_id,
            existing_user_id,
            '+254743066593',
            '123456',
            'pending'::public.verification_status,
            CURRENT_TIMESTAMP + INTERVAL '10 minutes'
        );
        
        RAISE NOTICE 'Test SMS verification created for testing with code: 123456';
    ELSE
        RAISE NOTICE 'No existing users found. Create users first.';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating test data: %', SQLERRM;
END $$;