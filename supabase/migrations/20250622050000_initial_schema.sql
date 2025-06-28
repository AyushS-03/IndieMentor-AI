/*
  # IndieMentor AI - Complete Schema

  1. Database Schema
    - `profiles` - User profiles linked to auth.users
    - `mentors` - AI mentors created by users
    - `subscriptions` - User subscriptions to mentors  
    - `conversations` - Chat conversations with mentors

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for authenticated users
*/

-- Create custom types
CREATE TYPE mentor_status AS ENUM ('draft', 'active', 'paused');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  is_creator boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  avatar_url text,
  price integer NOT NULL DEFAULT 29,
  expertise text[] NOT NULL DEFAULT '{}',
  status mentor_status DEFAULT 'draft',
  subscribers_count integer DEFAULT 0,
  conversations_count integer DEFAULT 0,
  revenue integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id uuid REFERENCES mentors(id) ON DELETE CASCADE NOT NULL,
  status subscription_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(user_id, mentor_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id uuid REFERENCES mentors(id) ON DELETE CASCADE NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, mentor_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Mentors policies
CREATE POLICY "Anyone can view active mentors" ON mentors
  FOR SELECT USING (status = 'active' OR creator_id = auth.uid());

CREATE POLICY "Creators can insert their own mentors" ON mentors
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own mentors" ON mentors
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own mentors" ON mentors
  FOR DELETE USING (auth.uid() = creator_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions for themselves" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations for themselves" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at
  BEFORE UPDATE ON mentors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
