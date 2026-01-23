-- Add social links and verified column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false NOT NULL;

-- Create index for verified profiles
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified) WHERE verified = true;
