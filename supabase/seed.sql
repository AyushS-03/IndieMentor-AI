-- Seed script for local development
-- This file demonstrates the database structure but doesn't insert fake user data
-- Real users should be created through the signup flow in your application

-- The database is now ready with the following structure:
-- 1. profiles - User profiles (linked to auth.users)
-- 2. mentors - AI mentors created by users  
-- 3. subscriptions - User subscriptions to mentors
-- 4. conversations - Chat conversations with mentors

-- To test with real data:
-- 1. Sign up users through your application
-- 2. Create mentors through the app interface
-- 3. Subscribe to mentors and start conversations

-- Example of how to manually insert a mentor after creating a real user:
-- INSERT INTO public.mentors (creator_id, name, title, description, price, expertise, status) 
-- VALUES (
--   'your-real-user-id-here',
--   'My AI Mentor',
--   'Expert Title',
--   'Description of expertise',
--   50,
--   ARRAY['skill1', 'skill2'],
--   'active'
-- );
