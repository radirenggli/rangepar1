/*
  # RPG Golf - Initial Database Schema

  ## Overview
  This migration creates the complete database structure for the RPG Golf app,
  a driving range practice application for iOS and Android.

  ## New Tables

  ### `profiles`
  User profile information linked to Supabase auth.users
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `display_name` (text) - User's display name
  - `avatar_url` (text) - Profile picture URL
  - `unit_preference` (text) - 'yards' or 'meters'
  - `is_premium` (boolean) - Premium subscription status
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last profile update

  ### `practice_sessions`
  Individual practice session records
  - `id` (uuid, primary key) - Session identifier
  - `user_id` (uuid, foreign key) - Links to profiles
  - `session_type` (text) - 'free', '9_holes', '18_holes'
  - `holes_completed` (integer) - Number of holes finished
  - `total_shots` (integer) - Total shots taken
  - `unit_used` (text) - 'yards' or 'meters'
  - `started_at` (timestamptz) - Session start time
  - `completed_at` (timestamptz) - Session completion time
  - `created_at` (timestamptz) - Record creation time

  ### `holes`
  Individual hole configuration within a session
  - `id` (uuid, primary key) - Hole identifier
  - `session_id` (uuid, foreign key) - Links to practice_sessions
  - `hole_number` (integer) - Hole sequence (1-18)
  - `par` (integer) - Par value (4, 5, or 6)
  - `distance` (integer) - Total distance in user's preferred unit
  - `fairway_width` (text) - 'narrow', 'medium', 'wide'
  - `fairway_width_yards` (integer) - Actual width in yards
  - `created_at` (timestamptz) - Record creation time

  ### `shots`
  Individual shot records with direction tracking
  - `id` (uuid, primary key) - Shot identifier
  - `hole_id` (uuid, foreign key) - Links to holes
  - `session_id` (uuid, foreign key) - Links to practice_sessions
  - `shot_number` (integer) - Shot sequence for this hole
  - `direction` (text) - 'straight', 'draw', 'hook', 'push', 'slice'
  - `distance_remaining` (integer) - Distance to hole after shot
  - `created_at` (timestamptz) - Record creation time

  ## Security
  
  Row Level Security (RLS) is enabled on all tables with policies that:
  - Allow users to view only their own data
  - Allow users to insert their own data
  - Allow users to update their own data
  - Allow users to delete their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  avatar_url text,
  unit_preference text DEFAULT 'yards' CHECK (unit_preference IN ('yards', 'meters')),
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create practice_sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('free', '9_holes', '18_holes')),
  holes_completed integer DEFAULT 0,
  total_shots integer DEFAULT 0,
  unit_used text NOT NULL CHECK (unit_used IN ('yards', 'meters')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON practice_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON practice_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON practice_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON practice_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create holes table
CREATE TABLE IF NOT EXISTS holes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  hole_number integer NOT NULL,
  par integer NOT NULL CHECK (par IN (4, 5, 6)),
  distance integer NOT NULL,
  fairway_width text NOT NULL CHECK (fairway_width IN ('narrow', 'medium', 'wide')),
  fairway_width_yards integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE holes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own holes"
  ON holes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = holes.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own holes"
  ON holes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = holes.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own holes"
  ON holes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = holes.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = holes.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own holes"
  ON holes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = holes.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

-- Create shots table
CREATE TABLE IF NOT EXISTS shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hole_id uuid NOT NULL REFERENCES holes(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  shot_number integer NOT NULL,
  direction text NOT NULL CHECK (direction IN ('straight', 'draw', 'hook', 'push', 'slice')),
  distance_remaining integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shots"
  ON shots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = shots.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own shots"
  ON shots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = shots.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own shots"
  ON shots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = shots.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = shots.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own shots"
  ON shots FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = shots.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_holes_session_id ON holes(session_id);
CREATE INDEX IF NOT EXISTS idx_shots_hole_id ON shots(hole_id);
CREATE INDEX IF NOT EXISTS idx_shots_session_id ON shots(session_id);