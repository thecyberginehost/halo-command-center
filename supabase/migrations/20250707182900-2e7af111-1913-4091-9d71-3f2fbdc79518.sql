-- Create credentials table for tenant-specific API keys
CREATE TABLE public.tenant_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL, -- 'openai', 'anthropic', 'gmail', etc.
  credentials JSONB NOT NULL, -- encrypted credential data
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, name)
);

-- Enable RLS
ALTER TABLE public.tenant_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant-scoped access
CREATE POLICY "Credentials are tenant-scoped"
ON public.tenant_credentials
FOR ALL
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_tenant_credentials_updated_at
BEFORE UPDATE ON public.tenant_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_tenant_credentials_tenant_id ON public.tenant_credentials(tenant_id);
CREATE INDEX idx_tenant_credentials_service_type ON public.tenant_credentials(service_type);