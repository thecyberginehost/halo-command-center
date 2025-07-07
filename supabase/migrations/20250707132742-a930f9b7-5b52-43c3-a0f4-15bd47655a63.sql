-- Insert a default HALO tenant
INSERT INTO tenants (name, subdomain, settings) 
VALUES ('HALO Demo Organization', 'demo', '{"theme": "default", "features": ["workflows", "ai_assist", "analytics"]}')
ON CONFLICT (subdomain) DO NOTHING;