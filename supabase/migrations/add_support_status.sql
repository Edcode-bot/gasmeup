-- Add status column to supports table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE supports 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed'));

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_supports_status ON supports(status);

-- Update existing records to 'confirmed' (assume they're all confirmed if they exist)
UPDATE supports SET status = 'confirmed' WHERE status IS NULL OR status = 'pending';
