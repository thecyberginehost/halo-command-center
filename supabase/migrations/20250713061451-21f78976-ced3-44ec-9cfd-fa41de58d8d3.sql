-- Update HubSpot OAuth configuration to include required 'oauth' scope
UPDATE public.oauth_configs 
SET 
  scopes = ARRAY['oauth', 'forms', 'crm.objects.contacts.read', 'crm.schemas.contacts.read', 'crm.objects.contacts.write', 'crm.objects.owners.read'],
  updated_at = now()
WHERE service_id = 'hubspot';