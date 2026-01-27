-- Add ON DELETE CASCADE to all foreign key constraints
-- This is the industry standard approach used by Twitter, GitHub, etc.

-- Step 1: Find all foreign key constraints that reference users or builders
-- This query helps us understand the current structure

/*
SELECT
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (ccu.table_name = 'profiles' OR ccu.table_name = 'users');
*/

-- Step 2: Add ON DELETE CASCADE to all relevant foreign keys

-- Projects table references profiles (builder_address)
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_builder_address_fkey,
ADD CONSTRAINT projects_builder_address_fkey 
FOREIGN KEY (builder_address) 
REFERENCES public.profiles(wallet_address) 
ON DELETE CASCADE;

-- Posts table references profiles (builder_address)
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_builder_address_fkey,
ADD CONSTRAINT posts_builder_address_fkey 
FOREIGN KEY (builder_address) 
REFERENCES public.profiles(wallet_address) 
ON DELETE CASCADE;

-- Supports table references profiles (from_address and to_address)
ALTER TABLE public.supports 
DROP CONSTRAINT IF EXISTS supports_from_address_fkey,
ADD CONSTRAINT supports_from_address_fkey 
FOREIGN KEY (from_address) 
REFERENCES public.profiles(wallet_address) 
ON DELETE CASCADE;

ALTER TABLE public.supports 
DROP CONSTRAINT IF EXISTS supports_to_address_fkey,
ADD CONSTRAINT supports_to_address_fkey 
FOREIGN KEY (to_address) 
REFERENCES public.profiles(wallet_address) 
ON DELETE CASCADE;

-- Post likes table references profiles (user_address)
ALTER TABLE public.post_likes 
DROP CONSTRAINT IF EXISTS post_likes_user_address_fkey,
ADD CONSTRAINT post_likes_user_address_fkey 
FOREIGN KEY (user_address) 
REFERENCES public.profiles(wallet_address) 
ON DELETE CASCADE;

-- Post comments table references profiles (user_address)
ALTER TABLE public.post_comments 
DROP CONSTRAINT IF EXISTS post_comments_user_address_fkey,
ADD CONSTRAINT post_comments_user_address_fkey 
FOREIGN KEY (user_address) 
REFERENCES public.profiles(wallet_address) 
ON DELETE CASCADE;

-- Notifications table references profiles (user_address)
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_user_address_fkey,
ADD CONSTRAINT notifications_user_address_fkey 
FOREIGN KEY (user_address) 
REFERENCES public.profiles(wallet_address) 
ON DELETE CASCADE;

-- Milestones table references projects (which will cascade to profiles)
ALTER TABLE public.milestones 
DROP CONSTRAINT IF EXISTS milestones_project_id_fkey,
ADD CONSTRAINT milestones_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES public.projects(id) 
ON DELETE CASCADE;

-- Project updates table references projects (which will cascade to profiles)
ALTER TABLE public.project_updates 
DROP CONSTRAINT IF EXISTS project_updates_project_id_fkey,
ADD CONSTRAINT project_updates_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES public.projects(id) 
ON DELETE CASCADE;

-- Step 3: Add indexes for better performance on deletion
CREATE INDEX IF NOT EXISTS idx_projects_builder_address ON public.projects(builder_address);
CREATE INDEX IF NOT EXISTS idx_posts_builder_address ON public.posts(builder_address);
CREATE INDEX IF NOT EXISTS idx_supports_from_address ON public.supports(from_address);
CREATE INDEX IF NOT EXISTS idx_supports_to_address ON public.supports(to_address);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_address ON public.post_likes(user_address);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_address ON public.post_comments(user_address);
CREATE INDEX IF NOT EXISTS idx_notifications_user_address ON public.notifications(user_address);

-- Step 4: Verify the constraints were added correctly
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (ccu.table_name = 'profiles' OR ccu.table_name = 'users')
ORDER BY tc.table_name, tc.constraint_name;
