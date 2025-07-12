-- Add the missing foreign key relationship between forum_posts and profiles
ALTER TABLE public.forum_posts 
ADD CONSTRAINT forum_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;