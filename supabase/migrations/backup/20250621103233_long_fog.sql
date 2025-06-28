/*
  # Remove Sample Data

  This migration removes the sample data that was causing foreign key constraint violations.
  The sample profiles and mentors will be created through the application instead.
*/

-- Remove sample mentors first (due to foreign key dependency)
DELETE FROM mentors WHERE creator_id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003'
);

-- Remove sample profiles
DELETE FROM profiles WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003'
);