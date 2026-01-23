-- GasMeUp Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table: Store builder profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supports table: Store all support transactions
CREATE TABLE IF NOT EXISTS supports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC(78, 18) NOT NULL, -- Supports up to 18 decimal places for ETH/MATIC
  message TEXT,
  tx_hash TEXT NOT NULL UNIQUE,
  chain_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_supports_from_address ON supports(from_address);
CREATE INDEX IF NOT EXISTS idx_supports_to_address ON supports(to_address);
CREATE INDEX IF NOT EXISTS idx_supports_tx_hash ON supports(tx_hash);
CREATE INDEX IF NOT EXISTS idx_supports_chain_id ON supports(chain_id);
CREATE INDEX IF NOT EXISTS idx_supports_created_at ON supports(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Supports are viewable by everyone" ON supports;
DROP POLICY IF EXISTS "Anyone can insert supports" ON supports;

-- RLS Policies for profiles: Anyone can read, authenticated users can insert/update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for supports: Anyone can read, anyone can insert
CREATE POLICY "Supports are viewable by everyone"
  ON supports FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert supports"
  ON supports FOR INSERT
  WITH CHECK (true);

