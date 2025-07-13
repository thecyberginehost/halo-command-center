-- Update HubSpot OAuth configuration with real credentials
UPDATE public.oauth_configs 
SET 
  client_id = '0d079a9d-60a6-42ae-b8eb-66687036e664',
  client_secret = '2c9d63e7-dd9a-4bc9-875e-7802267cab2c',
  updated_at = now()
WHERE service_id = 'hubspot';