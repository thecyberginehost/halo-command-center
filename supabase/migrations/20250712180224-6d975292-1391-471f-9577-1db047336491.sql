-- Delete the welcome forum post
DELETE FROM public.forum_posts 
WHERE title = 'Welcome to the HALO Community Forums!';

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own posts" ON public.forum_posts;

-- Create new update policy that restricts pinning
CREATE POLICY "Users can update their own posts with restrictions"
ON public.forum_posts
FOR UPDATE
USING (
  auth.uid() = author_id AND 
  (
    -- If trying to change pinned status, must be Anthony or admin
    (is_pinned = true AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (name = 'Anthony Amore' OR role ILIKE '%admin%')
    )) OR
    -- If not changing pinned status, allow normal updates
    is_pinned = false
  )
);

-- Create separate policy for Anthony/admins to pin any post
CREATE POLICY "Admins can pin any post"
ON public.forum_posts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (name = 'Anthony Amore' OR role ILIKE '%admin%')
  )
);