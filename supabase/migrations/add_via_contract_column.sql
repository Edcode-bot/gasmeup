-- Add via_contract column to supports table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE supports ADD COLUMN IF NOT EXISTS via_contract BOOLEAN DEFAULT true;

-- Create index for via_contract queries
CREATE INDEX IF NOT EXISTS idx_supports_via_contract ON supports(via_contract);

-- Update existing records to false (they were direct transfers)
UPDATE supports SET via_contract = false WHERE via_contract IS NULL;
