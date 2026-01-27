-- Add RLS DELETE policies to allow users and admins to delete records
-- This fixes the issue where CASCADE constraints work but RLS blocks deletion

-- Enable RLS on tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add DELETE policy for profiles table (users can delete their own profile)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (wallet_address = auth.jwt() ->> 'wallet_address');

-- Add DELETE policy for service role (admin can delete any profile)
CREATE POLICY "Service role can delete any profile"
ON public.profiles
FOR DELETE
TO service_role
USING (true);

-- Enable RLS on projects table if not already enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Add DELETE policy for projects (users can delete their own projects)
CREATE POLICY "Users can delete own projects"
ON public.projects
FOR DELETE
TO authenticated
USING (builder_address = auth.jwt() ->> 'wallet_address');

-- Add DELETE policy for service role (admin can delete any project)
CREATE POLICY "Service role can delete any project"
ON public.projects
FOR DELETE
TO service_role
USING (true);

-- Enable RLS on posts table if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Add DELETE policy for posts (users can delete their own posts)
CREATE POLICY "Users can delete own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (builder_address = auth.jwt() ->> 'wallet_address');

-- Add DELETE policy for service role (admin can delete any post)
CREATE POLICY "Service role can delete any post"
ON public.posts
FOR DELETE
TO service_role
USING (true);

-- Enable RLS on supports table if not already enabled
ALTER TABLE public.supports ENABLE ROW LEVEL SECURITY;

-- Add DELETE policy for supports (users can delete their own sent/received supports)
CREATE POLICY "Users can delete own supports"
ON public.supports
FOR DELETE
TO authenticated
USING (from_address = auth.jwt() ->> 'wallet_address' OR to_address = auth.jwt() ->> 'wallet_address');

-- Add DELETE policy for service role (admin can delete any support)
CREATE POLICY "Service role can delete any support"
ON public.supports
FOR DELETE
TO service_role
USING (true);

-- Enable RLS on notifications table if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Add DELETE policy for notifications (users can delete their own notifications)
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (user_address = auth.jwt() ->> 'wallet_address');

-- Add DELETE policy for service role (admin can delete any notification)
CREATE POLICY "Service role can delete any notification"
ON public.notifications
FOR DELETE
TO service_role
USING (true);

-- Enable RLS on post_likes table if not already enabled
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Add DELETE policy for post likes (users can delete their own likes)
CREATE POLICY "Users can delete own post likes"
ON public.post_likes
FOR DELETE
TO authenticated
USING (user_address = auth.jwt() ->> 'wallet_address');

-- Add DELETE policy for service role (admin can delete any post like)
CREATE POLICY "Service role can delete any post like"
ON public.post_likes
FOR DELETE
TO service_role
USING (true);

-- Enable RLS on post_comments table if not already enabled
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Add DELETE policy for post comments (users can delete their own comments)
CREATE POLICY "Users can delete own post comments"
ON public.post_comments
FOR DELETE
TO authenticated
USING (user_address = auth.jwt() ->> 'wallet_address');

-- Add DELETE policy for service role (admin can delete any post comment)
CREATE POLICY "Service role can delete any post comment"
ON public.post_comments
FOR DELETE
TO service_role
USING (true);

-- Verify policies were created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND cmd = 'DELETE'
ORDER BY tablename, policyname;
