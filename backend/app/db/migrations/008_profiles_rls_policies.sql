-- Migration 008: Add RLS Policies for Profiles Table (FIXED - No Recursion)
-- This migration secures the profiles table to prevent unauthorized access and role escalation

-- 1. Enable Row Level Security on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies (in case of re-running)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile (except role)" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 3. Create RLS Policies WITHOUT recursion

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile on signup
-- This is used by the trigger when a new user is created
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own NON-ROLE fields
-- We prevent role updates by using a function that checks the old value
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy 4: Prevent non-admin users from changing the role field
-- This is done via a trigger, not RLS policy (to avoid recursion)
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if the user is trying to update their own profile
  IF NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'You can only update your own profile';
  END IF;
  
  -- Check if role is being changed
  IF OLD.role != NEW.role THEN
    -- Check if current user is admin
    IF OLD.role != 'admin' THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS check_role_change ON profiles;

-- Create trigger to prevent role escalation
CREATE TRIGGER check_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_change();

-- Notes:
-- - No circular dependencies = no infinite recursion
-- - Role protection via trigger instead of RLS WITH CHECK
-- - Simpler and more performant
-- - The trigger will prevent users from promoting themselves to admin
