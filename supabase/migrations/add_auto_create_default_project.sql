-- Auto-create Default Project Function
-- This function creates a default "Main Project" for new builders

CREATE OR REPLACE FUNCTION create_default_project_for_builder(builder_wallet TEXT)
RETURNS UUID AS $$
DECLARE
  project_id UUID;
BEGIN
  -- Insert default project
  INSERT INTO projects (
    builder_address,
    title,
    description,
    image_url,
    what_building,
    funding_reason,
    status
  ) VALUES (
    builder_wallet,
    'My Main Project',
    'I''m currently building something amazing. More details coming soon!',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    'Building my next big idea',
    'Support my development journey as I create innovative solutions',
    'idea'
  ) RETURNING id INTO project_id;
  
  RETURN project_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create default project for new builders
CREATE OR REPLACE FUNCTION auto_create_default_project()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a new profile and create default project
  IF TG_OP = 'INSERT' THEN
    PERFORM create_default_project_for_builder(NEW.wallet_address);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-creating default projects
DROP TRIGGER IF EXISTS trigger_auto_create_default_project ON profiles;
CREATE TRIGGER trigger_auto_create_default_project
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_default_project();
