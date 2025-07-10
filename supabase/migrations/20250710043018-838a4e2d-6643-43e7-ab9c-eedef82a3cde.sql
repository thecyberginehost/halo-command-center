-- Create missing tables for advanced integration features

-- Integration executions table
CREATE TABLE public.integration_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id TEXT NOT NULL,
  tenant_id UUID NOT NULL,
  workflow_id UUID,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- OAuth states table for OAuth flow security
CREATE TABLE public.oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  tenant_id UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhook environments table for test/production environments
CREATE TABLE public.webhook_environments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  is_production BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- OAuth configurations table
CREATE TABLE public.oauth_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  redirect_uri TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data mappings table for transformation rules
CREATE TABLE public.data_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  source_integration TEXT NOT NULL,
  target_integration TEXT NOT NULL,
  mappings JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.integration_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Integration executions are tenant-scoped" 
ON public.integration_executions 
FOR ALL 
USING (true);

CREATE POLICY "OAuth states are tenant-scoped" 
ON public.oauth_states 
FOR ALL 
USING (true);

CREATE POLICY "Webhook environments are tenant-scoped" 
ON public.webhook_environments 
FOR ALL 
USING (true);

CREATE POLICY "OAuth configs are system-managed" 
ON public.oauth_configs 
FOR SELECT 
USING (true);

CREATE POLICY "Data mappings are tenant-scoped" 
ON public.data_mappings 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_integration_executions_tenant_id ON public.integration_executions(tenant_id);
CREATE INDEX idx_integration_executions_workflow_id ON public.integration_executions(workflow_id);
CREATE INDEX idx_integration_executions_status ON public.integration_executions(status);
CREATE INDEX idx_integration_executions_started_at ON public.integration_executions(started_at);

CREATE INDEX idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX idx_oauth_states_expires_at ON public.oauth_states(expires_at);
CREATE INDEX idx_oauth_states_tenant_id ON public.oauth_states(tenant_id);

CREATE INDEX idx_webhook_environments_tenant_id ON public.webhook_environments(tenant_id);
CREATE INDEX idx_webhook_environments_workflow_id ON public.webhook_environments(workflow_id);

CREATE INDEX idx_oauth_configs_service_id ON public.oauth_configs(service_id);

CREATE INDEX idx_data_mappings_tenant_id ON public.data_mappings(tenant_id);
CREATE INDEX idx_data_mappings_source_integration ON public.data_mappings(source_integration);
CREATE INDEX idx_data_mappings_target_integration ON public.data_mappings(target_integration);

-- Add foreign key relationships
ALTER TABLE public.integration_executions 
ADD CONSTRAINT fk_integration_executions_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.integration_executions 
ADD CONSTRAINT fk_integration_executions_workflow_id 
FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;

ALTER TABLE public.oauth_states 
ADD CONSTRAINT fk_oauth_states_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.webhook_environments 
ADD CONSTRAINT fk_webhook_environments_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.webhook_environments 
ADD CONSTRAINT fk_webhook_environments_workflow_id 
FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;

ALTER TABLE public.data_mappings 
ADD CONSTRAINT fk_data_mappings_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Add updated_at triggers
CREATE TRIGGER update_integration_executions_updated_at
BEFORE UPDATE ON public.integration_executions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhook_environments_updated_at
BEFORE UPDATE ON public.webhook_environments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_oauth_configs_updated_at
BEFORE UPDATE ON public.oauth_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_mappings_updated_at
BEFORE UPDATE ON public.data_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing auth_type column to tenant_credentials if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_credentials' 
        AND column_name = 'auth_type'
    ) THEN
        ALTER TABLE public.tenant_credentials 
        ADD COLUMN auth_type TEXT DEFAULT 'api_key';
    END IF;
END $$;

-- Add missing expires_at column to tenant_credentials if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_credentials' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE public.tenant_credentials 
        ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add missing scopes column to tenant_credentials if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_credentials' 
        AND column_name = 'scopes'
    ) THEN
        ALTER TABLE public.tenant_credentials 
        ADD COLUMN scopes TEXT[];
    END IF;
END $$;