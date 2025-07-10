-- Create storage buckets for binary data management
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('integration-files', 'integration-files', false),
  ('user-uploads', 'user-uploads', false),
  ('workflow-assets', 'workflow-assets', false),
  ('temp-files', 'temp-files', false);

-- Create table for dynamic property configurations
CREATE TABLE public.dynamic_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  integration_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  property_type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'object', 'array'
  display_conditions JSONB DEFAULT '[]'::jsonb,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  default_value JSONB,
  is_required BOOLEAN DEFAULT false,
  is_dynamic BOOLEAN DEFAULT true,
  resource_locator JSONB, -- For dynamic resource loading
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, integration_id, property_name)
);

-- Create table for file metadata tracking
CREATE TABLE public.file_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  checksum TEXT,
  uploaded_by UUID,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  integration_id TEXT,
  usage_context TEXT, -- 'workflow', 'integration', 'user_upload', 'temp'
  metadata JSONB DEFAULT '{}'::jsonb,
  is_processed BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processing_result JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for operation templates (router pattern)
CREATE TABLE public.operation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'http', 'data_processing', 'file_operation', 'validation'
  description TEXT,
  operation_config JSONB NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  error_handling JSONB DEFAULT '{}'::jsonb,
  retry_config JSONB DEFAULT '{}'::jsonb,
  is_system_template BOOLEAN DEFAULT false,
  version TEXT DEFAULT '1.0',
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, template_name, version)
);

-- Create table for helper function configurations
CREATE TABLE public.helper_functions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  function_type TEXT NOT NULL, -- 'http_request', 'data_transform', 'validation', 'file_process'
  description TEXT,
  function_config JSONB NOT NULL,
  input_parameters JSONB NOT NULL,
  output_format JSONB,
  error_mapping JSONB DEFAULT '{}'::jsonb,
  execution_timeout INTEGER DEFAULT 30000,
  rate_limit JSONB,
  is_cached BOOLEAN DEFAULT false,
  cache_duration INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, function_name)
);

-- Enable RLS for all new tables
ALTER TABLE public.dynamic_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_functions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dynamic_properties
CREATE POLICY "Dynamic properties are tenant-scoped" 
ON public.dynamic_properties 
FOR ALL 
USING (true);

-- Create RLS policies for file_metadata
CREATE POLICY "File metadata is tenant-scoped" 
ON public.file_metadata 
FOR ALL 
USING (true);

-- Create RLS policies for operation_templates
CREATE POLICY "Operation templates are tenant-scoped" 
ON public.operation_templates 
FOR ALL 
USING (true);

-- Create RLS policies for helper_functions
CREATE POLICY "Helper functions are tenant-scoped" 
ON public.helper_functions 
FOR ALL 
USING (true);

-- Create storage policies for integration-files bucket
CREATE POLICY "Integration files are tenant-accessible" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'integration-files');

-- Create storage policies for user-uploads bucket
CREATE POLICY "User uploads are tenant-accessible" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'user-uploads');

-- Create storage policies for workflow-assets bucket
CREATE POLICY "Workflow assets are tenant-accessible" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'workflow-assets');

-- Create storage policies for temp-files bucket
CREATE POLICY "Temp files are tenant-accessible" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'temp-files');

-- Create triggers for updated_at columns
CREATE TRIGGER update_dynamic_properties_updated_at
  BEFORE UPDATE ON public.dynamic_properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_file_metadata_updated_at
  BEFORE UPDATE ON public.file_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operation_templates_updated_at
  BEFORE UPDATE ON public.operation_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_helper_functions_updated_at
  BEFORE UPDATE ON public.helper_functions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_dynamic_properties_tenant_integration 
ON public.dynamic_properties(tenant_id, integration_id);

CREATE INDEX idx_file_metadata_tenant_workflow 
ON public.file_metadata(tenant_id, workflow_id);

CREATE INDEX idx_file_metadata_bucket_path 
ON public.file_metadata(bucket_name, file_path);

CREATE INDEX idx_operation_templates_tenant_category 
ON public.operation_templates(tenant_id, category);

CREATE INDEX idx_helper_functions_tenant_type 
ON public.helper_functions(tenant_id, function_type);

-- Create helper function for file cleanup
CREATE OR REPLACE FUNCTION public.cleanup_expired_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete expired file metadata
  DELETE FROM public.file_metadata 
  WHERE expires_at IS NOT NULL AND expires_at < now();
  
  -- Note: Storage files need to be cleaned up separately via edge function
END;
$$;