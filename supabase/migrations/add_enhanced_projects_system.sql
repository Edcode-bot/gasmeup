-- Enhanced Projects System Migration
-- Adds all the new fields for improved project management and transparency

-- Add new fields to profiles table for external integrations
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS github_username TEXT,
ADD COLUMN IF NOT EXISTS karma_gap_profile TEXT,
ADD COLUMN IF NOT EXISTS talent_protocol_profile TEXT;

-- Add new fields to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS what_building TEXT CHECK (char_length(what_building) <= 140),
ADD COLUMN IF NOT EXISTS funding_reason TEXT,
ADD COLUMN IF NOT EXISTS funding_goal NUMERIC(78, 18),
ADD COLUMN IF NOT EXISTS supporter_perks TEXT,
ADD COLUMN IF NOT EXISTS funds_usage_dev TEXT,
ADD COLUMN IF NOT EXISTS funds_usage_infra TEXT,
ADD COLUMN IF NOT EXISTS funds_usage_ops TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Update project status to include new options
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_status_check,
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('idea', 'building', 'live', 'active', 'completed', 'archived'));

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  funding_target NUMERIC(78, 18),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create project_updates table
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  builder_address TEXT NOT NULL REFERENCES profiles(wallet_address) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_builder_address ON project_updates(builder_address);
CREATE INDEX IF NOT EXISTS idx_project_updates_created_at ON project_updates(created_at DESC);

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_profiles_github_username ON profiles(github_username);

-- Enable RLS for new tables
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for milestones
CREATE POLICY "Milestones are viewable by everyone"
  ON milestones FOR SELECT
  USING (true);

CREATE POLICY "Builders can manage their own project milestones"
  ON milestones FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE builder_address = auth.jwt() ->> 'wallet_address'
    )
  );

-- RLS Policies for project_updates
CREATE POLICY "Project updates are viewable by everyone"
  ON project_updates FOR SELECT
  USING (true);

CREATE POLICY "Builders can manage their own project updates"
  ON project_updates FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE builder_address = auth.jwt() ->> 'wallet_address'
    )
  );

-- Function to update updated_at timestamp for milestones
CREATE OR REPLACE FUNCTION update_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on milestones
DROP TRIGGER IF EXISTS trigger_update_milestones_updated_at ON milestones;
CREATE TRIGGER trigger_update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_milestones_updated_at();

-- Function to update updated_at timestamp for project_updates
CREATE OR REPLACE FUNCTION update_project_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on project_updates
DROP TRIGGER IF EXISTS trigger_update_project_updates_updated_at ON project_updates;
CREATE TRIGGER trigger_update_project_updates_updated_at
  BEFORE UPDATE ON project_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_project_updates_updated_at();
