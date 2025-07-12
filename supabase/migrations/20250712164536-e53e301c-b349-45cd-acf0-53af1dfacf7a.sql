-- Delete the welcome forum post
DELETE FROM public.forum_posts 
WHERE title = 'Welcome to the HALO Community Forums!';

-- Create RLS policy to restrict post pinning to admins/Anthony Amore only
CREATE POLICY "Only admins can pin posts"
ON public.forum_posts
FOR UPDATE
USING (
  -- Allow updates if pinned status isn't changing, or if user is Anthony/admin
  NOT (OLD.is_pinned IS DISTINCT FROM is_pinned) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (name = 'Anthony Amore' OR role ILIKE '%admin%')
  )
);