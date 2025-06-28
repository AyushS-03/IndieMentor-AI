/*
  # Initial Schema for IndieMentor AI

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `avatar_url` (text, optional)
      - `is_creator` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `mentors`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `name` (text)
      - `title` (text)
      - `description` (text)
      - `avatar_url` (text, optional)
      - `price` (integer, monthly price in dollars)
      - `expertise` (text array)
      - `status` (enum: draft, active, paused)
      - `subscribers_count` (integer, default 0)
      - `conversations_count` (integer, default 0)
      - `revenue` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `mentor_id` (uuid, references mentors)
      - `status` (enum: active, cancelled, expired)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)
    
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `mentor_id` (uuid, references mentors)
      - `messages` (jsonb array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for creators to manage their mentors
*/

-- Create custom types
CREATE TYPE mentor_status AS ENUM ('draft', 'active', 'paused');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

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
  messages jsonb DEFAULT '[]',
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
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Mentors policies
CREATE POLICY "Anyone can read active mentors"
  ON mentors
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Creators can read own mentors"
  ON mentors
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can create mentors"
  ON mentors
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update own mentors"
  ON mentors
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete own mentors"
  ON mentors
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Creators can read subscriptions to their mentors"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    mentor_id IN (
      SELECT id FROM mentors WHERE creator_id = auth.uid()
    )
  );

-- Conversations policies
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Creators can read conversations for their mentors"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    mentor_id IN (
      SELECT id FROM mentors WHERE creator_id = auth.uid()
    )
  );

-- Create functions for incrementing counters
CREATE OR REPLACE FUNCTION increment_mentor_subscribers(mentor_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE mentors 
  SET subscribers_count = subscribers_count + 1,
      revenue = revenue + price
  WHERE id = mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_mentor_conversations(mentor_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE mentors 
  SET conversations_count = conversations_count + 1
  WHERE id = mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Sample data moved to seed.sql for local development