-- Insert OAuth configurations for popular services
INSERT INTO public.oauth_configs (service_id, client_id, client_secret, redirect_uri, scopes) VALUES
('hubspot', 'YOUR_HUBSPOT_CLIENT_ID', 'YOUR_HUBSPOT_CLIENT_SECRET', 'https://xxltijgxrwhdudhzicel.supabase.co/oauth/callback', '{"forms", "crm.objects.contacts.read", "crm.schemas.contacts.read", "crm.objects.contacts.write", "crm.objects.owners.read"}'),
('salesforce', 'YOUR_SALESFORCE_CLIENT_ID', 'YOUR_SALESFORCE_CLIENT_SECRET', 'https://xxltijgxrwhdudhzicel.supabase.co/oauth/callback', '{"api", "refresh_token"}'),
('gmail', 'YOUR_GMAIL_CLIENT_ID', 'YOUR_GMAIL_CLIENT_SECRET', 'https://xxltijgxrwhdudhzicel.supabase.co/oauth/callback', '{"https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/userinfo.email"}'),
('slack', 'YOUR_SLACK_CLIENT_ID', 'YOUR_SLACK_CLIENT_SECRET', 'https://xxltijgxrwhdudhzicel.supabase.co/oauth/callback', '{"chat:write", "users:read", "channels:read"}')
ON CONFLICT (service_id) DO UPDATE SET
  redirect_uri = EXCLUDED.redirect_uri,
  scopes = EXCLUDED.scopes;