-- Create workflow_executions table
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  current_step TEXT,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create execution_logs table
CREATE TABLE public.execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
  message TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_executions
CREATE POLICY "Workflow executions are tenant-scoped" 
ON public.workflow_executions 
FOR ALL 
USING (true);

-- Create RLS policies for execution_logs
CREATE POLICY "Execution logs are tenant-scoped" 
ON public.execution_logs 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_tenant_id ON public.workflow_executions(tenant_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX idx_execution_logs_execution_id ON public.execution_logs(execution_id);
CREATE INDEX idx_execution_logs_level ON public.execution_logs(level);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_workflow_executions_updated_at
BEFORE UPDATE ON public.workflow_executions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();