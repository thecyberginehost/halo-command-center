import { IntegrationNode } from '@/types/integrations';
import { MessageCircle, Camera, Video, Users, ThumbsUp, Share, Bookmark, Bell } from 'lucide-react';

// Twitter/X Integrations
export const twitterPostTweet: IntegrationNode = {
  id: 'twitter_post_tweet',
  name: 'Post Tweet',
  description: 'Post a new tweet to Twitter/X',
  category: 'communication',
  icon: MessageCircle,
  color: '#1DA1F2',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'text', label: 'Tweet Text', type: 'textarea', required: true },
    { name: 'media_urls', label: 'Media URLs', type: 'textarea', required: false }
  ],
  endpoints: [],
  configSchema: {
    consumer_key: { type: 'text', label: 'Consumer Key', required: true },
    consumer_secret: { type: 'password', label: 'Consumer Secret', required: true },
    access_token: { type: 'password', label: 'Access Token', required: true },
    access_token_secret: { type: 'password', label: 'Access Token Secret', required: true }
  }
};

export const twitterMentionTrigger: IntegrationNode = {
  id: 'twitter_mention_trigger',
  name: 'New Mention',
  description: 'Triggered when mentioned on Twitter/X',
  category: 'triggers',
  icon: Bell,
  color: '#1DA1F2',
  requiresAuth: true,
  authType: 'oauth',
  type: 'trigger',
  fields: [],
  endpoints: [],
  configSchema: {
    consumer_key: { type: 'text', label: 'Consumer Key', required: true },
    consumer_secret: { type: 'password', label: 'Consumer Secret', required: true }
  }
};

export const twitterSearchTweets: IntegrationNode = {
  id: 'twitter_search_tweets',
  name: 'Search Tweets',
  description: 'Search for tweets matching criteria',
  category: 'communication',
  icon: MessageCircle,
  color: '#1DA1F2',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'query', label: 'Search Query', type: 'text', required: true },
    { name: 'count', label: 'Number of Results', type: 'number', required: false }
  ],
  endpoints: [],
  configSchema: {
    bearer_token: { type: 'password', label: 'Bearer Token', required: true }
  }
};

// Facebook Integrations
export const facebookPostPage: IntegrationNode = {
  id: 'facebook_post_page',
  name: 'Post to Page',
  description: 'Post content to a Facebook page',
  category: 'communication',
  icon: Share,
  color: '#1877F2',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'message', label: 'Post Message', type: 'textarea', required: true },
    { name: 'link', label: 'Link URL', type: 'text', required: false },
    { name: 'picture', label: 'Picture URL', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    page_access_token: { type: 'password', label: 'Page Access Token', required: true },
    page_id: { type: 'text', label: 'Page ID', required: true }
  }
};

export const facebookPagePost: IntegrationNode = {
  id: 'facebook_page_post',
  name: 'New Page Post',
  description: 'Triggered when a new post is made to page',
  category: 'triggers',
  icon: Share,
  color: '#1877F2',
  requiresAuth: true,
  authType: 'oauth',
  type: 'trigger',
  fields: [],
  endpoints: [],
  configSchema: {
    page_access_token: { type: 'password', label: 'Page Access Token', required: true }
  }
};

// Instagram Integrations
export const instagramPostPhoto: IntegrationNode = {
  id: 'instagram_post_photo',
  name: 'Post Photo',
  description: 'Post a photo to Instagram',
  category: 'communication',
  icon: Camera,
  color: '#E4405F',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'image_url', label: 'Image URL', type: 'text', required: true },
    { name: 'caption', label: 'Caption', type: 'textarea', required: false }
  ],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true }
  }
};

export const instagramNewPost: IntegrationNode = {
  id: 'instagram_new_post',
  name: 'New Post',
  description: 'Triggered when a new post is published',
  category: 'triggers',
  icon: Camera,
  color: '#E4405F',
  requiresAuth: true,
  authType: 'oauth',
  type: 'trigger',
  fields: [],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true }
  }
};

// LinkedIn Integrations
export const linkedinPostUpdate: IntegrationNode = {
  id: 'linkedin_post_update',
  name: 'Post Update',
  description: 'Post a status update to LinkedIn',
  category: 'communication',
  icon: Users,
  color: '#0A66C2',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'text', label: 'Post Text', type: 'textarea', required: true },
    { name: 'visibility', label: 'Visibility', type: 'select', required: true, options: [
      { label: 'Public', value: 'PUBLIC' },
      { label: 'Connections Only', value: 'CONNECTIONS' }
    ]}
  ],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true }
  }
};

export const linkedinCompanyPost: IntegrationNode = {
  id: 'linkedin_company_post',
  name: 'Company Page Post',
  description: 'Post to a LinkedIn company page',
  category: 'communication',
  icon: Users,
  color: '#0A66C2',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'text', label: 'Post Text', type: 'textarea', required: true },
    { name: 'company_id', label: 'Company ID', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true }
  }
};

// YouTube Integrations
export const youtubeUploadVideo: IntegrationNode = {
  id: 'youtube_upload_video',
  name: 'Upload Video',
  description: 'Upload a video to YouTube',
  category: 'communication',
  icon: Video,
  color: '#FF0000',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'title', label: 'Video Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'video_url', label: 'Video File URL', type: 'text', required: true },
    { name: 'privacy', label: 'Privacy', type: 'select', required: true, options: [
      { label: 'Public', value: 'public' },
      { label: 'Unlisted', value: 'unlisted' },
      { label: 'Private', value: 'private' }
    ]}
  ],
  endpoints: [],
  configSchema: {
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true }
  }
};

export const youtubeNewSubscriber: IntegrationNode = {
  id: 'youtube_new_subscriber',
  name: 'New Subscriber',
  description: 'Triggered when channel gets a new subscriber',
  category: 'triggers',
  icon: Users,
  color: '#FF0000',
  requiresAuth: true,
  authType: 'oauth',
  type: 'trigger',
  fields: [],
  endpoints: [],
  configSchema: {
    channel_id: { type: 'text', label: 'Channel ID', required: true }
  }
};

// TikTok Integrations
export const tiktokPostVideo: IntegrationNode = {
  id: 'tiktok_post_video',
  name: 'Post Video',
  description: 'Post a video to TikTok',
  category: 'communication',
  icon: Video,
  color: '#000000',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'video_url', label: 'Video URL', type: 'text', required: true },
    { name: 'caption', label: 'Caption', type: 'textarea', required: false },
    { name: 'privacy_level', label: 'Privacy', type: 'select', required: true, options: [
      { label: 'Public', value: 'PUBLIC_TO_EVERYONE' },
      { label: 'Friends', value: 'MUTUAL_FOLLOW_FRIEND' },
      { label: 'Private', value: 'SELF_ONLY' }
    ]}
  ],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true }
  }
};

// Pinterest Integrations
export const pinterestCreatePin: IntegrationNode = {
  id: 'pinterest_create_pin',
  name: 'Create Pin',
  description: 'Create a new pin on Pinterest',
  category: 'communication',
  icon: Bookmark,
  color: '#E60023',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'board_id', label: 'Board ID', type: 'text', required: true },
    { name: 'image_url', label: 'Image URL', type: 'text', required: true },
    { name: 'title', label: 'Pin Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'link', label: 'Destination Link', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true }
  }
};

// Discord Integrations
export const discordSendMessage: IntegrationNode = {
  id: 'discord_send_message',
  name: 'Send Message',
  description: 'Send a message to a Discord channel',
  category: 'communication',
  icon: MessageCircle,
  color: '#5865F2',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'channel_id', label: 'Channel ID', type: 'text', required: true },
    { name: 'content', label: 'Message Content', type: 'textarea', required: true },
    { name: 'embed_title', label: 'Embed Title', type: 'text', required: false },
    { name: 'embed_description', label: 'Embed Description', type: 'textarea', required: false }
  ],
  endpoints: [],
  configSchema: {
    bot_token: { type: 'password', label: 'Bot Token', required: true }
  }
};

export const discordNewMessage: IntegrationNode = {
  id: 'discord_new_message',
  name: 'New Message',
  description: 'Triggered when a new message is posted',
  category: 'triggers',
  icon: MessageCircle,
  color: '#5865F2',
  requiresAuth: true,
  authType: 'api_key',
  type: 'trigger',
  fields: [
    { name: 'channel_id', label: 'Channel ID', type: 'text', required: true }
  ],
  endpoints: [],
  configSchema: {
    bot_token: { type: 'password', label: 'Bot Token', required: true }
  }
};

// Reddit Integrations
export const redditPostSubmission: IntegrationNode = {
  id: 'reddit_post_submission',
  name: 'Create Post',
  description: 'Submit a new post to a subreddit',
  category: 'communication',
  icon: MessageCircle,
  color: '#FF4500',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'subreddit', label: 'Subreddit', type: 'text', required: true },
    { name: 'title', label: 'Post Title', type: 'text', required: true },
    { name: 'text', label: 'Post Text', type: 'textarea', required: false },
    { name: 'url', label: 'URL', type: 'text', required: false }
  ],
  endpoints: [],
  configSchema: {
    client_id: { type: 'text', label: 'Client ID', required: true },
    client_secret: { type: 'password', label: 'Client Secret', required: true },
    username: { type: 'text', label: 'Username', required: true },
    password: { type: 'password', label: 'Password', required: true }
  }
};

// Telegram Integrations
export const telegramSendMessage: IntegrationNode = {
  id: 'telegram_send_message',
  name: 'Send Message',
  description: 'Send a message via Telegram bot',
  category: 'communication',
  icon: MessageCircle,
  color: '#0088CC',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'chat_id', label: 'Chat ID', type: 'text', required: true },
    { name: 'text', label: 'Message Text', type: 'textarea', required: true },
    { name: 'parse_mode', label: 'Parse Mode', type: 'select', required: false, options: [
      { label: 'None', value: '' },
      { label: 'Markdown', value: 'Markdown' },
      { label: 'HTML', value: 'HTML' }
    ]}
  ],
  endpoints: [],
  configSchema: {
    bot_token: { type: 'password', label: 'Bot Token', required: true }
  }
};

export const telegramNewMessage: IntegrationNode = {
  id: 'telegram_new_message',
  name: 'New Message',
  description: 'Triggered when bot receives a message',
  category: 'triggers',
  icon: MessageCircle,
  color: '#0088CC',
  requiresAuth: true,
  authType: 'api_key',
  type: 'trigger',
  fields: [],
  endpoints: [],
  configSchema: {
    bot_token: { type: 'password', label: 'Bot Token', required: true }
  }
};