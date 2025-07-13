-- Update HubSpot OAuth configuration with real credentials
-- Replace with actual client ID and secret provided by user
UPDATE public.oauth_configs 
SET 
  client_id = 'REPLACE_WITH_REAL_HUBSPOT_CLIENT_ID',
  client_secret = 'REPLACE_WITH_REAL_HUBSPOT_CLIENT_SECRET',
  updated_at = now()
WHERE service_id = 'hubspot';