-- CORRECTED Storage RLS Policies for Project Images
-- Based on official Supabase documentation: INSERT policies only need WITH CHECK

-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_can_upload" ON storage.objects;
DROP POLICY IF EXISTS "public_can_view" ON storage.objects;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- CORRECTED INSERT policy for authenticated users
-- NOTE: INSERT operations only need WITH CHECK, not USING clause
CREATE POLICY "authenticated_can_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

-- SELECT policy for public viewing
CREATE POLICY "public_can_view"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-images');

-- Optional: UPDATE policy for authenticated users (if needed)
CREATE POLICY "authenticated_can_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images')
WITH CHECK (bucket_id = 'project-images');

-- Optional: DELETE policy for authenticated users (if needed)
CREATE POLICY "authenticated_can_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');

-- Verify policies were created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname IN ('authenticated_can_upload', 'public_can_view', 'authenticated_can_update', 'authenticated_can_delete')
ORDER BY policyname;

-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'project-images';
