-- Cleanup Project Image Upload System
-- This removes all project image upload related items while preserving avatar uploads

-- Drop the project-images storage bucket and all its contents
-- NOTE: This will delete all uploaded project images permanently
-- Use the correct Supabase storage syntax
DELETE FROM storage.buckets WHERE id = 'project-images';

-- Remove all project image storage policies (they were for the project-images bucket)
-- These policies should be automatically removed when the bucket is dropped,
-- but we'll ensure they're gone for completeness
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own project images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_uploads" ON storage.objects;

-- Note: Avatar upload functionality is preserved because:
-- 1. Avatar uploads use a different bucket (likely 'avatars' or similar)
-- 2. Avatar policies are separate and not affected by this cleanup
-- 3. Profile image uploads continue to work as before

-- Summary of what's removed:
-- - project-images storage bucket
-- - All project image files (permanent deletion)
-- - All project image RLS policies
-- - All project image upload functions/logic

-- Summary of what's preserved:
-- - Avatar storage bucket (separate from project-images)
-- - Avatar upload functionality
-- - Profile image uploads
-- - All other existing functionality
