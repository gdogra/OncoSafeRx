-- Add deleted_at column to users table for soft delete functionality
-- Run this in Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add comment to the column
COMMENT ON COLUMN public.users.deleted_at IS 'Timestamp when user was soft deleted';

-- Create index for better query performance on non-deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NULL;

-- Update RLS policy to exclude deleted users from normal queries (optional)
-- This ensures deleted users don't appear in regular user queries
DROP POLICY IF EXISTS "Users can view own profile and admins can view all active users" ON public.users;

CREATE POLICY "Users can view own profile and admins can view all active users" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR 
        (EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin') 
            AND is_active = true 
            AND deleted_at IS NULL
        ))
    );

-- Add policy for admin delete operations
DROP POLICY IF EXISTS "Admins can soft delete users" ON public.users;

CREATE POLICY "Admins can soft delete users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin') 
            AND is_active = true 
            AND deleted_at IS NULL
        )
    );

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO service_role;