-- Remove auto-create default project functionality

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS after_builder_insert ON public.builders;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS create_default_project();

-- Verify removal
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'after_builder_insert';

-- Note: This will return no rows if the trigger was successfully removed
