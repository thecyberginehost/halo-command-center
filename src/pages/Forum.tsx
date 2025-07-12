import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Share2, 
  Shield, 
  Code, 
  Megaphone,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Lock,
  CheckCircle,
  Eye,
  Calendar,
  User,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Layout from '@/components/Layout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  position: number;
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
  category?: ForumCategory;
  author?: { name: string; email: string } | null;
  comment_count?: any;
}

const iconMap = {
  MessageSquare,
  Bug,
  Lightbulb,
  Share2,
  Shield,
  Code,
  Megaphone
};

const Forum = () => {
  usePageTitle('Community Forum');
  const { toast } = useToast();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'votes'>('newest');
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // Create post form
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category_id: '',
    priority: 'normal',
    tags: [] as string[]
  });

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, [selectedCategory, sortBy]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('position');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast({
        title: "Error",
        description: "Failed to load forum categories",
        variant: "destructive",
      });
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          category:forum_categories(*),
          author:profiles(name, email)
        `);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Add sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        case 'votes':
          query = query.order('vote_score', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match our interface
      const transformedPosts = (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        category_id: post.category_id,
        author_id: post.author_id,
        is_pinned: post.is_pinned,
        is_locked: post.is_locked,
        is_solved: post.is_solved,
        priority: post.priority,
        tags: post.tags || [],
        view_count: post.view_count,
        vote_score: post.vote_score,
        created_at: post.created_at,
        category: post.category,
        author: post.author,
        comment_count: 0
      }));
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast({
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create a post",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('forum_posts')
        .insert([{
          ...newPost,
          author_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      setShowCreatePost(false);
      setNewPost({
        title: '',
        content: '',
        category_id: '',
        priority: 'normal',
        tags: []
      });
      loadPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const voteOnPost = async (postId: string, voteType: 'up' | 'down') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        .eq('user_id', user.id)
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
            user_id: user.id,
            post_id: postId,
            vote_type: voteType
          }]);
      }

      loadPosts();
    } catch (error) {
      console.error('Failed to vote:', error);
      toast({
        title: "Error",
        description: "Failed to vote on post",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Layout pageTitle="Community Forum">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              HALO Community Forum
            </h2>
            <p className="text-muted-foreground">
              Share feedback, report bugs, and connect with other HALO users
            </p>
          </div>
          
          <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                
                <Select 
                  value={newPost.category_id} 
                  onValueChange={(value) => setNewPost({ ...newPost, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={newPost.priority} 
                  onValueChange={(value) => setNewPost({ ...newPost, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                
                <Textarea
                  placeholder="Write your post content..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={6}
                />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createPost} disabled={!newPost.title || !newPost.content || !newPost.category_id}>
                    Create Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forum posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="votes">Highest Voted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Categories
        </Button>
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap];
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading forum posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No posts found matching your criteria
          </div>
        ) : (
          filteredPosts.map((post) => {
            const CategoryIcon = iconMap[post.category?.icon as keyof typeof iconMap];
            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-1 min-w-16">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voteOnPost(post.id, 'up')}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">{post.vote_score}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voteOnPost(post.id, 'down')}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {post.is_pinned && <Pin className="h-4 w-4 text-blue-600" />}
                          {post.is_locked && <Lock className="h-4 w-4 text-gray-600" />}
                          {post.is_solved && <CheckCircle className="h-4 w-4 text-green-600" />}
                          <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                            {post.title}
                          </h3>
                        </div>
                        <Badge className={getPriorityColor(post.priority)}>
                          {post.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {CategoryIcon && (
                            <div className="flex items-center gap-1">
                              <CategoryIcon className="h-4 w-4" />
                              <span>{post.category?.name}</span>
                            </div>
                          )}
                          
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

                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comment_count || 0} replies</span>
                          </div>
                        </div>

                        {post.tags.length > 0 && (
                          <div className="flex gap-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </Layout>
  );
};

export default Forum;