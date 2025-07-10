-- Create webhooks table
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  body TEXT,
  timeout INTEGER NOT NULL DEFAULT 30000,
  retries INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  workflow_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook_executions table
CREATE TABLE public.webhook_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'timeout')),
  request JSONB NOT NULL,
  response JSONB,
  error TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for webhooks
CREATE POLICY "Webhooks are tenant-scoped" 
ON public.webhooks 
FOR ALL 
USING (true);

-- Create policies for webhook_executions
CREATE POLICY "Webhook executions are tenant-scoped" 
ON public.webhook_executions 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_webhooks_tenant_id ON public.webhooks(tenant_id);
CREATE INDEX idx_webhooks_workflow_id ON public.webhooks(workflow_id);
CREATE INDEX idx_webhook_executions_webhook_id ON public.webhook_executions(webhook_id);
CREATE INDEX idx_webhook_executions_executed_at ON public.webhook_executions(executed_at);

-- Add foreign key relationships
ALTER TABLE public.webhooks 
ADD CONSTRAINT fk_webhooks_workflow_id 
FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;

ALTER TABLE public.webhooks 
ADD CONSTRAINT fk_webhooks_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.webhook_executions 
ADD CONSTRAINT fk_webhook_executions_webhook_id 
FOREIGN KEY (webhook_id) REFERENCES public.webhooks(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates on webhooks
CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();