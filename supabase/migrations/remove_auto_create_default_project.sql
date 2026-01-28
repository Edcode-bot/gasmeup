-- Remove Auto-Create Default Project Trigger
-- This migration removes the trigger that was creating duplicate projects

-- Drop the trigger
DROP TRIGGER IF EXISTS trigger_auto_create_default_project ON profiles;

-- Drop the trigger function
DROP FUNCTION IF EXISTS auto_create_default_project();

-- Drop the helper function
DROP FUNCTION IF EXISTS create_default_project_for_builder(TEXT);

-- Note: This will prevent automatic creation of default projects
-- Users will need to manually create projects through the UI
