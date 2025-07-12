import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Pin,
  Lock,
  CheckCircle,
  Eye,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown,
  ArrowUp,
  ArrowDown,
  MessageSquare
} from 'lucide-react';
import Layout from '@/components/Layout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { PostDetail } from '@/components/forum/PostDetail';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  priority: string;
  tags: string[];
  view_count: number;
  vote_score: number;
  created_at: string;
  category?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  author?: { name: string; email: string } | null;
}

interface ForumComment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_comment_id: string | null;
  is_solution: boolean;
  vote_score: number;
  created_at: string;
  author?: { name: string; email: string } | null;
}

const ForumPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  usePageTitle(post ? post.title : 'Forum Post');

  useEffect(() => {
    if (postId) {
      loadPost();
      getCurrentUser();
      incrementViewCount();
      loadComments();
    }
  }, [postId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      
      // First get the post
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          category:forum_categories(*)
        `)
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      let authorData = null;
      
      // Then get the author profile if author_id exists
      if (postData?.author_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('user_id', postData.author_id)
          .single();
        
        authorData = profile;
      }

      if (postData) {
        setPost({
          id: postData.id,
          title: postData.title,
          content: postData.content,
          category_id: postData.category_id,
          author_id: postData.author_id,
          is_pinned: postData.is_pinned,
          is_locked: postData.is_locked,
          is_solved: postData.is_solved,
          priority: postData.priority,
          tags: postData.tags || [],
          view_count: postData.view_count,
          vote_score: postData.vote_score,
          created_at: postData.created_at,
          category: postData.category,
          author: authorData
        });
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      toast({
        title: "Error",
        description: "Failed to load forum post",
        variant: "destructive",
      });
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase
        .from('forum_posts')
        .update({ view_count: 1 }) // Simplified for now
        .eq('id', postId);
    } catch (error) {
      // Silently fail view count increment
      console.error('Failed to increment view count:', error);
    }
  };

  const voteOnPost = async (voteType: 'up' | 'down') => {
    try {
      if (!currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to vote",
          variant: "destructive",
        });
        return;
      }

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('forum_votes')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('post_id', postId)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking same vote
          await supabase
            .from('forum_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote if clicking different vote
          await supabase
            .from('forum_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('forum_votes')
          .insert([{
            user_id: currentUser.id,
            post_id: postId,
            vote_type: voteType
          }]);
      }

      loadPost();
    } catch (error) {
      console.error('Failed to vote:', error);
      toast({
        title: "Error",
        description: "Failed to vote on post",
        variant: "destructive",
      });
    }
  };

  const loadComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get author profiles for all comments
      const commentsWithAuthors = await Promise.all(
        (commentsData || []).map(async (comment) => {
          let author = null;
          if (comment.author_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('user_id', comment.author_id)
              .single();
            author = profile;
          }
          return { ...comment, author };
        })
      );

      setComments(commentsWithAuthors);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);

      if (!currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to reply",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('forum_comments')
        .insert([{
          content: newComment.trim(),
          post_id: postId,
          author_id: currentUser.id
        }]);

      if (error) throw error;

      setNewComment('');
      loadComments();
      toast({
        title: "Success",
        description: "Reply posted successfully",
      });
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Loading...">
        <div className="text-center py-8">Loading forum post...</div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout pageTitle="Post Not Found">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
          <Button onClick={() => navigate('/forum')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forum
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={post.title}>
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/forum')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>
      </div>

      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1 min-w-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => voteOnPost('up')}
                className="h-8 w-8 p-0"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{post.vote_score}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => voteOnPost('down')}
                className="h-8 w-8 p-0"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {post.is_pinned && <Pin className="h-4 w-4 text-blue-600" />}
                  {post.is_locked && <Lock className="h-4 w-4 text-gray-600" />}
                  {post.is_solved && <CheckCircle className="h-4 w-4 text-green-600" />}
                  <h1 className="text-2xl font-bold">{post.title}</h1>
                </div>
                <Badge className={getPriorityColor(post.priority)}>
                  {post.priority.toUpperCase()}
                </Badge>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author?.name || 'Anonymous'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.view_count} views</span>
                </div>
              </div>

              {post.tags.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">
              Replies ({comments.length})
            </h2>
          </div>

          {/* Add Reply Form */}
          {!post.is_locked && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-3">Add a reply</h3>
              <Textarea
                placeholder="Write your reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
                rows={4}
              />
              <Button
                onClick={submitComment}
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? 'Posting...' : 'Post Reply'}
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No replies yet. Be the first to reply!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 min-w-12">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-medium">{comment.vote_score}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <div className="prose max-w-none mb-3">
                        <p className="whitespace-pre-wrap">{comment.content}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{comment.author?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                        </div>
                        {comment.is_solution && (
                          <Badge className="bg-green-100 text-green-800">
                            Solution
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ForumPost;