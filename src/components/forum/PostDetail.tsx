import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  ArrowUp,
  ArrowDown,
  Pin,
  Lock,
  CheckCircle,
  Eye,
  Calendar,
  User,
  Edit,
  Trash2,
  Reply,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, isAfter, subHours } from 'date-fns';

interface ForumComment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_comment_id: string | null;
  is_solution: boolean;
  vote_score: number;
  created_at: string;
  updated_at: string;
  author?: { name: string; email: string } | null;
}

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
  category?: any;
  author?: { name: string; avatar_url: string } | null;
}

interface PostDetailProps {
  post: ForumPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdate: () => void;
}

export const PostDetail = ({ post, open, onOpenChange, onPostUpdate }: PostDetailProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<ForumComment | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  useEffect(() => {
    if (open) {
      loadComments();
      getCurrentUser();
      incrementViewCount();
    }
  }, [open, post.id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setUserProfile(profile);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase
        .from('forum_posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', post.id);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Get author profiles separately
      const commentsWithAuthors = await Promise.all((data || []).map(async (comment) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('user_id', comment.author_id)
          .single();
        
        return {
          ...comment,
          author: profile
        };
      }));
      
      setComments(commentsWithAuthors);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createComment = async () => {
    try {
      if (!currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to reply",
          variant: "destructive",
        });
        return;
      }

      if (!newComment.trim()) return;

      const { error } = await supabase
        .from('forum_comments')
        .insert([{
          content: newComment,
          author_id: currentUser.id,
          post_id: post.id,
          parent_comment_id: replyToComment
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });

      setNewComment('');
      setReplyToComment(null);
      loadComments();
      onPostUpdate();
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    }
  };

  const editComment = async () => {
    try {
      if (!editingComment) return;

      const { error } = await supabase
        .from('forum_comments')
        .update({ content: editCommentContent })
        .eq('id', editingComment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment updated successfully!",
      });

      setEditingComment(null);
      setEditCommentContent('');
      loadComments();
    } catch (error) {
      console.error('Failed to edit comment:', error);
      toast({
        title: "Error",
        description: "Failed to edit comment",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully!",
      });

      loadComments();
      onPostUpdate();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const voteOnComment = async (commentId: string, voteType: 'up' | 'down') => {
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
        .eq('comment_id', commentId)
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
            comment_id: commentId,
            vote_type: voteType
          }]);
      }

      loadComments();
    } catch (error) {
      console.error('Failed to vote on comment:', error);
    }
  };

  const canEditComment = (comment: ForumComment) => {
    if (!currentUser) return false;
    if (currentUser.id !== comment.author_id) return false;
    
    // Check if comment was created within 24 hours
    const commentDate = new Date(comment.created_at);
    const twentyFourHoursAgo = subHours(new Date(), 24);
    return isAfter(commentDate, twentyFourHoursAgo);
  };

  const canDeleteComment = (comment: ForumComment) => {
    if (!currentUser) return false;
    return currentUser.id === comment.author_id;
  };

  const openEditComment = (comment: ForumComment) => {
    setEditingComment(comment);
    setEditCommentContent(comment.content);
  };

  const canPinPost = () => {
    if (!currentUser || !userProfile) return false;
    return userProfile.name === 'Anthony Amore' || userProfile.role?.toLowerCase().includes('admin');
  };

  const togglePinPost = async () => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_pinned: !post.is_pinned })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: post.is_pinned ? "Post unpinned" : "Post pinned",
      });

      onPostUpdate();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
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

  const renderComments = (parentId: string | null = null, depth: number = 0) => {
    const filteredComments = comments.filter(comment => comment.parent_comment_id === parentId);
    
    return filteredComments.map((comment) => (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
        <Card className="border-l-4 border-l-blue-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-1 min-w-12">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => voteOnComment(comment.id, 'up')}
                  className="h-6 w-6 p-0"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium">{comment.vote_score}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => voteOnComment(comment.id, 'down')}
                  className="h-6 w-6 p-0"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Comment Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{comment.author?.name || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                  {comment.is_solution && (
                    <Badge className="bg-green-100 text-green-800 text-xs">Solution</Badge>
                  )}
                </div>

                {editingComment?.id === comment.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={editComment}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm mb-3">{comment.content}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyToComment(comment.id)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                      
                      {canEditComment(comment) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditComment(comment)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      {canDeleteComment(comment) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteComment(comment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Nested replies */}
        {renderComments(comment.id, depth + 1)}
        
        {/* Reply form for this specific comment */}
        {replyToComment === comment.id && (
          <div className="ml-8 mt-3">
            <Card className="border-dashed">
              <CardContent className="p-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={createComment} disabled={!newComment.trim()}>
                    Post Reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setReplyToComment(null);
                    setNewComment('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {post.is_pinned && <Pin className="h-4 w-4 text-blue-600" />}
              {post.is_locked && <Lock className="h-4 w-4 text-gray-600" />}
              {post.is_solved && <CheckCircle className="h-4 w-4 text-green-600" />}
              {post.title}
            </DialogTitle>
            {canPinPost() && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={togglePinPost}
                className={post.is_pinned ? "text-blue-600 hover:text-blue-700" : ""}
              >
                <Pin className="h-4 w-4 mr-1" />
                {post.is_pinned ? 'Unpin' : 'Pin'}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Post Content */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                <Badge className={getPriorityColor(post.priority)}>
                  {post.priority.toUpperCase()}
                </Badge>
              </div>
              
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{post.content}</p>
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
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
            </h3>
            
            {/* New Comment Form */}
            {!post.is_locked && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Write your reply..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end mt-3">
                    <Button onClick={createComment} disabled={!newComment.trim()}>
                      Post Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            {loading ? (
              <div className="text-center py-4">Loading replies...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No replies yet. Be the first to reply!
              </div>
            ) : (
              <div className="space-y-1">
                {renderComments()}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};