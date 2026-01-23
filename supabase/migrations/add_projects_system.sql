-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  builder_address TEXT NOT NULL REFERENCES profiles(wallet_address) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  description TEXT NOT NULL CHECK (char_length(description) <= 2000),
  image_url TEXT NOT NULL,
  live_url TEXT,
  github_url TEXT,
  goal_amount NUMERIC(78, 18),
  raised_amount NUMERIC(78, 18) DEFAULT 0 NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add project_id to supports table
ALTER TABLE supports ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_builder_address ON projects(builder_address);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supports_project_id ON supports(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects: Anyone can read, builders can insert/update/delete their own
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Builders can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Builders can update their own projects"
  ON projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Builders can delete their own projects"
  ON projects FOR DELETE
  USING (true);

-- Function to update project raised_amount when supports are added/updated/deleted
CREATE OR REPLACE FUNCTION update_project_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.project_id IS NOT NULL THEN
      UPDATE projects
      SET raised_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM supports
        WHERE project_id = NEW.project_id AND status = 'confirmed'
      )
      WHERE id = NEW.project_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.project_id IS NOT NULL THEN
      UPDATE projects
      SET raised_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM supports
        WHERE project_id = OLD.project_id AND status = 'confirmed'
      )
      WHERE id = OLD.project_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update project raised_amount
DROP TRIGGER IF EXISTS trigger_update_project_raised_amount ON supports;
CREATE TRIGGER trigger_update_project_raised_amount
  AFTER INSERT OR UPDATE OR DELETE ON supports
  FOR EACH ROW
  EXECUTE FUNCTION update_project_raised_amount();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on projects
DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON projects;
CREATE TRIGGER trigger_update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
