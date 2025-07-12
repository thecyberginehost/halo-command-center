-- Add foreign key relationship between forum_posts and profiles
-- First, let's ensure we have the proper relationship for author_id
ALTER TABLE public.forum_posts 
ADD CONSTRAINT fk_forum_posts_author_id 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Add foreign key for forum_comments as well
ALTER TABLE public.forum_comments 
ADD CONSTRAINT fk_forum_comments_author_id 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Create a welcome post by Anthony Amore (using a fake user ID for now)
INSERT INTO public.forum_posts (
  title,
  content,
  is_pinned,
  tags,
  priority
) VALUES (
  'Welcome to the HALO Community Forums!',
  '## Welcome to the HALO Community Forums! 🚀

Hey everyone! I''m Anthony Amore, Founder & Automation Architect here at HALO.

Welcome to our community forums! This is your space to:

- **Get Help**: Ask questions about workflows, integrations, and automation challenges
- **Share Knowledge**: Help fellow MASP-certified providers with your expertise  
- **Feature Requests**: Suggest improvements and new features for the platform
- **Best Practices**: Share automation patterns and successful implementations
- **Community**: Connect with other automation professionals

Whether you''re just getting started with HALO or you''re a seasoned automation expert, this community is here to support your journey. Our MASP-certified community is incredibly knowledgeable and always willing to help.

Let''s build amazing automations together! 

Looking forward to seeing what you create,
**Anthony Amore**  
*Founder & Automation Architect*',
  true,
  ARRAY['welcome', 'introduction', 'community'],
  'high'
);