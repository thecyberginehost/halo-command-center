-- Create forum structure for HALO Community
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3b82f6',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  vote_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  is_solution BOOLEAN DEFAULT false,
  vote_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_categories (public read, admin write)
CREATE POLICY "Categories are publicly readable" ON public.forum_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Categories admin manageable" ON public.forum_categories
  FOR ALL USING (true);

-- RLS Policies for forum_posts
CREATE POLICY "Posts are publicly readable" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for forum_comments
CREATE POLICY "Comments are publicly readable" ON public.forum_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.forum_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON public.forum_comments
  FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for forum_votes
CREATE POLICY "Users can manage their own votes" ON public.forum_votes
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category_id);
CREATE INDEX idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX idx_forum_posts_created ON public.forum_posts(created_at DESC);
CREATE INDEX idx_forum_comments_post ON public.forum_comments(post_id);
CREATE INDEX idx_forum_comments_author ON public.forum_comments(author_id);
CREATE INDEX idx_forum_votes_post ON public.forum_votes(post_id);
CREATE INDEX idx_forum_votes_comment ON public.forum_votes(comment_id);

-- Functions to update vote scores
CREATE OR REPLACE FUNCTION update_post_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.forum_posts 
  SET vote_score = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END), 0)
    FROM public.forum_votes 
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_comment_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.forum_comments 
  SET vote_score = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END), 0)
    FROM public.forum_votes 
    WHERE comment_id = COALESCE(NEW.comment_id, OLD.comment_id)
  )
  WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for vote score updates
CREATE TRIGGER update_post_vote_score_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.forum_votes
  FOR EACH ROW
  WHEN (NEW.post_id IS NOT NULL OR OLD.post_id IS NOT NULL)
  EXECUTE FUNCTION update_post_vote_score();

CREATE TRIGGER update_comment_vote_score_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.forum_votes
  FOR EACH ROW
  WHEN (NEW.comment_id IS NOT NULL OR OLD.comment_id IS NOT NULL)
  EXECUTE FUNCTION update_comment_vote_score();

-- Insert default forum categories
INSERT INTO public.forum_categories (name, description, icon, color, position) VALUES
('General Discussion', 'General conversations about HALO and automation', 'MessageSquare', '#3b82f6', 1),
('Bug Reports', 'Report bugs and technical issues', 'Bug', '#ef4444', 2),
('Feature Requests', 'Suggest new features and improvements', 'Lightbulb', '#f59e0b', 3),
('Workflow Sharing', 'Share and discuss automation workflows', 'Share2', '#10b981', 4),
('MASP Providers', 'Discussion for certified MASP providers', 'Shield', '#8b5cf6', 5),
('API & Integrations', 'Technical discussions about APIs and integrations', 'Code', '#6b7280', 6),
('Announcements', 'Official HALO announcements and updates', 'Megaphone', '#059669', 7);