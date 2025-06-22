/*
  # Fix profile insert policy for signup

  1. Changes
    - Update the "Users can insert own profile" policy to allow public access
    - This allows profile creation during the signup process when user is not yet fully authenticated
    - The WITH CHECK clause still ensures only the user can insert their own profile

  2. Security
    - Maintains security by checking auth.uid() = id in the WITH CHECK clause
    - Only changes the TO clause from authenticated to public for insert operations
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policy that allows public insert but still validates the user ID
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);