-- Fix role for tenniscommunity2@gmail.com user
-- This handles both possible column names in the users table

-- First, check what columns exist
DO $$
DECLARE
    has_role_column BOOLEAN;
    has_user_role_column BOOLEAN;
    user_auth_id UUID;
BEGIN
    -- Check column existence
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
    ) INTO has_role_column;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_role'
    ) INTO has_user_role_column;
    
    RAISE NOTICE 'Has role column: %, Has user_role column: %', has_role_column, has_user_role_column;
    
    -- Find the user ID from auth.users
    SELECT id INTO user_auth_id 
    FROM auth.users 
    WHERE email = 'tenniscommunity2@gmail.com';
    
    IF user_auth_id IS NULL THEN
        RAISE NOTICE 'User not found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user ID: %', user_auth_id;
    
    -- Update or insert based on column availability
    IF has_user_role_column THEN
        -- Try to update first
        UPDATE public.users 
        SET user_role = 'oncologist',
            first_name = 'Tennis',
            last_name = 'Community',
            specialty = 'Oncology',
            institution = 'Medical Center',
            updated_at = NOW()
        WHERE id = user_auth_id;
        
        -- If no rows affected, insert
        IF NOT FOUND THEN
            INSERT INTO public.users (
                id, email, user_role, first_name, last_name, specialty, institution, created_at
            ) VALUES (
                user_auth_id, 'tenniscommunity2@gmail.com', 'oncologist', 
                'Tennis', 'Community', 'Oncology', 'Medical Center', NOW()
            );
            RAISE NOTICE 'Inserted new user record with user_role';
        ELSE
            RAISE NOTICE 'Updated existing user record with user_role';
        END IF;
        
    ELSIF has_role_column THEN
        -- Try to update first
        UPDATE public.users 
        SET role = 'oncologist',
            first_name = 'Tennis',
            last_name = 'Community',
            specialty = 'Oncology',
            institution = 'Medical Center',
            updated_at = NOW()
        WHERE id = user_auth_id;
        
        -- If no rows affected, insert
        IF NOT FOUND THEN
            INSERT INTO public.users (
                id, email, role, first_name, last_name, specialty, institution, created_at
            ) VALUES (
                user_auth_id, 'tenniscommunity2@gmail.com', 'oncologist', 
                'Tennis', 'Community', 'Oncology', 'Medical Center', NOW()
            );
            RAISE NOTICE 'Inserted new user record with role';
        ELSE
            RAISE NOTICE 'Updated existing user record with role';
        END IF;
    ELSE
        RAISE NOTICE 'No role or user_role column found!';
    END IF;
    
    -- Update auth metadata as well
    UPDATE auth.users 
    SET user_metadata = COALESCE(user_metadata, '{}'::jsonb) || '{"role": "oncologist"}'::jsonb
    WHERE id = user_auth_id;
    
    RAISE NOTICE 'Updated auth metadata for user';
    
END $$;

-- Verify the changes
SELECT 
    u.id, 
    u.email, 
    COALESCE(u.role, u.user_role) as role,
    u.first_name, 
    u.last_name,
    au.user_metadata->>'role' as auth_role
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'tenniscommunity2@gmail.com';