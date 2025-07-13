-- Update HubSpot OAuth configuration to match exact scopes from HubSpot app
UPDATE public.oauth_configs 
SET 
  scopes = ARRAY['oauth', 'forms', 'crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.owners.read', 'crm.schemas.contacts.read', 'crm.schemas.contacts.write'],
  updated_at = now()
WHERE service_id = 'hubspot';