-- Update RLS policy to allow users to delete their own posts (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'forum_posts' 
    AND policyname = 'Users can delete their own posts'
  ) THEN
    CREATE POLICY "Users can delete their own posts" 
    ON public.forum_posts 
    FOR DELETE 
    USING (auth.uid() = author_id);
  END IF;
END $$;

-- Ensure the foreign key exists properly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forum_posts_author_id_fkey'
  ) THEN
    ALTER TABLE public.forum_posts 
    ADD CONSTRAINT forum_posts_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;
END $$;