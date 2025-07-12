-- Clear existing marketplace packages and add developer productivity tools
DELETE FROM public.marketplace_packages;

-- Insert developer productivity and lifestyle add-ons
INSERT INTO public.marketplace_packages (
  package_name,
  display_name,
  description,
  category,
  vendor_name,
  vendor_email,
  package_version,
  pricing_model,
  price_per_month,
  is_verified,
  is_active,
  download_count,
  rating,
  rating_count,
  tags,
  package_config,
  installation_config
) VALUES
-- Music & Audio
('spotify-web-player', 'Spotify Web Player', 'Listen to your favorite music while coding with the integrated Spotify web player', 'music', 'Spotify Technologies', 'support@spotify.com', '1.2.1', 'free', 0, true, true, 15420, 4.7, 892, ARRAY['music', 'audio', 'streaming', 'productivity'], '{"type": "web_widget", "permissions": ["audio"]}', '{"widget_size": "medium", "position": "sidebar"}'),

('apple-music-widget', 'Apple Music Widget', 'Seamlessly integrate Apple Music into your development workflow', 'music', 'Apple Inc.', 'developer@apple.com', '2.1.0', 'free', 0, true, true, 8950, 4.6, 534, ARRAY['music', 'apple', 'streaming'], '{"type": "web_widget", "api": "apple_music"}', '{"requires_auth": true}'),

('soundcloud-player', 'SoundCloud Player', 'Discover new music and podcasts while working on your automations', 'music', 'SoundCloud', 'api@soundcloud.com', '1.5.3', 'free', 0, false, true, 3210, 4.2, 187, ARRAY['music', 'podcasts', 'discovery'], '{"type": "embedded_player"}', '{}'),

-- Productivity
('pomodoro-timer', 'Focus Timer Pro', 'Boost productivity with customizable Pomodoro technique timers and break reminders', 'productivity', 'ProductivityLabs', 'hello@productivitylabs.io', '3.0.2', 'freemium', 4.99, true, true, 12850, 4.8, 1205, ARRAY['timer', 'productivity', 'focus', 'pomodoro'], '{"type": "widget", "features": ["custom_intervals", "stats", "notifications"]}', '{"sidebar_position": true}'),

('quick-notes', 'Quick Notes', 'Capture ideas instantly with a minimalist note-taking widget', 'productivity', 'DevTools Co.', 'support@devtools.co', '2.3.1', 'free', 0, true, true, 9870, 4.5, 678, ARRAY['notes', 'productivity', 'quick', 'minimal'], '{"type": "overlay_widget", "storage": "local"}', '{"hotkey_enabled": true}'),

('time-tracker', 'Time Insights', 'Track time spent on different projects and automations with detailed analytics', 'productivity', 'TimeWise', 'contact@timewise.app', '1.8.0', 'premium', 9.99, true, true, 5670, 4.7, 412, ARRAY['time-tracking', 'analytics', 'productivity'], '{"type": "dashboard_widget", "analytics": true}', '{"requires_permissions": ["activity_tracking"]}'),

-- Entertainment
('tetris-classic', 'Tetris Break', 'Take coding breaks with the classic Tetris game', 'entertainment', 'RetroGames Studio', 'info@retrogames.dev', '1.0.5', 'free', 0, false, true, 7890, 4.3, 445, ARRAY['game', 'tetris', 'break', 'classic'], '{"type": "game_widget", "controls": "keyboard"}', '{"overlay_mode": true}'),

('snake-game', 'Snake Arcade', 'Nostalgic Snake game for quick mental breaks', 'entertainment', 'ArcadeDevs', 'team@arcadedevs.com', '2.1.0', 'free', 0, false, true, 6540, 4.1, 298, ARRAY['game', 'snake', 'arcade', 'retro'], '{"type": "mini_game"}', '{}'),

('meditation-timer', 'Mindful Moments', 'Guided meditation sessions for developer mental health', 'wellness', 'ZenCode', 'support@zencode.app', '1.4.2', 'freemium', 6.99, true, true, 4320, 4.9, 234, ARRAY['meditation', 'wellness', 'mental-health'], '{"type": "wellness_widget", "audio_sessions": true}', '{"privacy_mode": true}'),

-- Design & UI
('theme-manager', 'Theme Studio', 'Create and apply custom UI themes for your HALO interface', 'design', 'DesignCraft', 'hello@designcraft.studio', '2.0.1', 'premium', 7.99, true, true, 8750, 4.6, 567, ARRAY['themes', 'ui', 'customization', 'design'], '{"type": "theme_manager", "custom_css": true}', '{"requires_reload": true}'),

('color-palette', 'Color Picker Pro', 'Advanced color picking and palette generation tool', 'design', 'ColorWorks', 'support@colorworks.io', '1.7.3', 'freemium', 3.99, false, true, 3450, 4.4, 198, ARRAY['colors', 'design', 'palette'], '{"type": "design_tool"}', '{}'),

-- Communication
('slack-widget', 'Slack Quick Chat', 'Stay connected with your team without leaving HALO', 'communication', 'Slack Technologies', 'api@slack.com', '4.2.1', 'free', 0, true, true, 11200, 4.7, 834, ARRAY['chat', 'team', 'communication'], '{"type": "chat_widget", "api": "slack"}', '{"requires_auth": true}'),

('discord-status', 'Discord Presence', 'Show your current HALO activity in your Discord status', 'communication', 'Discord Inc.', 'developers@discord.com', '1.3.0', 'free', 0, true, true, 6890, 4.2, 412, ARRAY['discord', 'status', 'presence'], '{"type": "status_integration"}', '{}'),

-- Analytics
('github-stats', 'GitHub Dashboard', 'Monitor your GitHub activity and contributions', 'analytics', 'GitHub', 'support@github.com', '3.1.2', 'free', 0, true, true, 9870, 4.8, 756, ARRAY['github', 'analytics', 'stats'], '{"type": "analytics_widget", "api": "github"}', '{"oauth_required": true}'),

('productivity-insights', 'Productivity Analytics', 'Detailed insights into your automation development patterns', 'analytics', 'InsightLab', 'team@insightlab.dev', '2.5.0', 'premium', 12.99, true, true, 4560, 4.6, 287, ARRAY['analytics', 'productivity', 'insights'], '{"type": "analytics_dashboard"}', '{"data_collection": true}'),

-- Wellness
('break-reminder', 'Healthy Breaks', 'Smart break reminders with stretching exercises for developers', 'wellness', 'WellDev', 'care@welldev.health', '1.2.4', 'freemium', 2.99, true, true, 7650, 4.5, 445, ARRAY['health', 'breaks', 'wellness'], '{"type": "health_widget", "exercise_library": true}', '{"notification_system": true}'),

('water-reminder', 'Hydration Helper', 'Stay hydrated with smart water drinking reminders', 'wellness', 'HealthTech Solutions', 'support@healthtech.app', '1.1.1', 'free', 0, false, true, 2340, 4.1, 123, ARRAY['health', 'hydration', 'wellness'], '{"type": "reminder_widget"}', '{}');