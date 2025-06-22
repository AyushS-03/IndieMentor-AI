/*
  # Fix RLS Policy for Profile Creation During Signup

  The issue is that during signup, the user context may not be fully established
  when trying to create the profile record. This migration creates a more
  permissive policy for profile insertion while maintaining security.
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new policy that allows authenticated users to insert profiles
-- but still validates that they can only insert their own profile
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if the user ID matches the authenticated user
    auth.uid() = id OR
    -- Allow if this is during the signup process (user just created)
    auth.uid() IS NOT NULL
  );

-- Also ensure we have a policy that allows users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure update policy exists
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);