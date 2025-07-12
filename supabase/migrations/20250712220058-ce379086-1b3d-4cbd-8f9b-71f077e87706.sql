-- Add foreign key relationship between forum_posts and profiles
ALTER TABLE public.forum_posts 
ADD CONSTRAINT forum_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Update RLS policy to allow users to delete their own posts
CREATE POLICY "Users can delete their own posts" 
ON public.forum_posts 
FOR DELETE 
USING (auth.uid() = author_id);