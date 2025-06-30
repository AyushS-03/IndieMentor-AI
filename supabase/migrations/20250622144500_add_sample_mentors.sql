-- Add sample mentors for development and testing
-- This migration adds some example mentors to showcase the platform

-- Create a demo creator profile (this will be used by the demo auth system)
-- We'll use a fixed UUID that matches what the demo auth system uses
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo-creator@example.com',
  '$2a$10$7xWgPxKYkA.FIvUhpNElL.Dg5eEF8DxiN8jLvBuD8ZyAc4zD6wXu2', -- demo password
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Demo Creator"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create corresponding profile
INSERT INTO public.profiles (id, email, name, is_creator) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo-creator@example.com', 'Demo Creator', true)
ON CONFLICT (id) DO UPDATE SET is_creator = true;

-- Insert sample mentors using the demo creator
INSERT INTO public.mentors (creator_id, name, title, description, price, expertise, status, subscribers_count) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'AI Business Strategist',
    'Entrepreneurship & Growth Expert',
    'I help entrepreneurs and business owners scale their companies using proven strategies and modern AI tools. With 15+ years of experience building and exiting startups, I provide actionable insights for sustainable growth.',
    49,
    ARRAY['Business Strategy', 'Entrepreneurship', 'Marketing', 'AI Tools', 'Growth Hacking'],
    'active',
    87
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Code Mentor Pro',
    'Senior Full-Stack Developer',
    'Learn modern web development from a seasoned engineer. I specialize in JavaScript, React, Node.js, and cloud technologies. Get career advice, code reviews, and accelerate your programming journey.',
    39,
    ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Career Development'],
    'active',
    142
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Wellness & Fitness Coach',
    'Certified Personal Trainer & Nutritionist',
    'Transform your health and fitness with personalized guidance. I combine evidence-based training methods with sustainable nutrition plans to help you reach your goals and maintain them long-term.',
    29,
    ARRAY['Fitness', 'Nutrition', 'Weight Loss', 'Strength Training', 'Wellness'],
    'active',
    93
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Digital Marketing Guru',
    'Social Media & SEO Specialist',
    'Boost your online presence and grow your brand with cutting-edge digital marketing strategies. From social media growth to SEO optimization, I help businesses dominate their online market.',
    59,
    ARRAY['Digital Marketing', 'SEO', 'Social Media', 'Content Strategy', 'Analytics'],
    'active',
    76
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Creative Design Mentor',
    'UI/UX Designer & Brand Strategist',
    'Elevate your design skills and create stunning user experiences. I teach design principles, modern tools, and help you build a portfolio that stands out in the competitive design industry.',
    45,
    ARRAY['UI/UX Design', 'Figma', 'Branding', 'Web Design', 'Portfolio Building'],
    'active',
    118
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Data Science Expert',
    'Machine Learning & Analytics Specialist',
    'Unlock the power of data to make better decisions. I help professionals learn data science, machine learning, and analytics tools to advance their careers in the data-driven economy.',
    55,
    ARRAY['Data Science', 'Machine Learning', 'Python', 'SQL', 'Analytics'],
    'active',
    65
  );
