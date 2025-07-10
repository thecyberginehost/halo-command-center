-- Phase 4: Enterprise Features Database Schema

-- Enhanced Multi-tenant Isolation
-- Create table for tenant feature flags and limits
CREATE TABLE public.tenant_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  feature_config JSONB DEFAULT '{}'::jsonb,
  usage_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  reset_period TEXT DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'yearly'
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, feature_name)
);

-- Create table for tenant resource quotas
CREATE TABLE public.tenant_quotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'workflows', 'executions_per_month', 'storage_gb', 'api_calls_per_day'
  quota_limit BIGINT NOT NULL,
  current_usage BIGINT DEFAULT 0,
  soft_limit BIGINT, -- Warning threshold
  hard_limit BIGINT, -- Hard stop threshold
  reset_period TEXT DEFAULT 'monthly',
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, resource_type)
);

-- Marketplace Support
-- Create table for marketplace integration packages
CREATE TABLE public.marketplace_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'productivity', 'crm', 'marketing', 'analytics', etc.
  vendor_name TEXT NOT NULL,
  vendor_email TEXT,
  icon_url TEXT,
  package_version TEXT NOT NULL DEFAULT '1.0.0',
  min_halo_version TEXT DEFAULT '1.0.0',
  package_config JSONB NOT NULL, -- Integration definitions, endpoints, etc.
  installation_config JSONB NOT NULL, -- Setup requirements, credentials needed
  pricing_model TEXT DEFAULT 'free', -- 'free', 'paid', 'freemium', 'enterprise'
  price_per_month DECIMAL(10,2),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2), -- Average rating 0.00 to 5.00
  rating_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  documentation_url TEXT,
  support_url TEXT,
  changelog JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tenant marketplace installations
CREATE TABLE public.tenant_marketplace_installs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.marketplace_packages(id) ON DELETE CASCADE,
  installed_version TEXT NOT NULL,
  installation_config JSONB DEFAULT '{}'::jsonb,
  custom_settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, package_id)
);

-- Create table for marketplace package reviews
CREATE TABLE public.marketplace_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.marketplace_packages(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(package_id, tenant_id)
);

-- Enhanced Performance Monitoring
-- Create table for detailed execution metrics
CREATE TABLE public.execution_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  integration_id TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'execution_time', 'memory_usage', 'api_calls', 'data_processed'
  metric_value DECIMAL(20,6) NOT NULL,
  metric_unit TEXT NOT NULL, -- 'ms', 'mb', 'count', 'bytes'
  additional_data JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  INDEX (tenant_id, workflow_id, recorded_at),
  INDEX (execution_id, step_id),
  INDEX (metric_type, recorded_at)
);

-- Create table for performance benchmarks
CREATE TABLE public.performance_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  integration_id TEXT,
  benchmark_type TEXT NOT NULL, -- 'workflow_avg', 'integration_avg', 'tenant_avg', 'system_avg'
  metric_name TEXT NOT NULL,
  baseline_value DECIMAL(20,6) NOT NULL,
  current_value DECIMAL(20,6) NOT NULL,
  threshold_warning DECIMAL(20,6),
  threshold_critical DECIMAL(20,6),
  sample_size INTEGER NOT NULL,
  calculation_period TEXT NOT NULL, -- 'hour', 'day', 'week', 'month'
  last_calculated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, workflow_id, integration_id, benchmark_type, metric_name, calculation_period)
);

-- Create table for performance alerts
CREATE TABLE public.performance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'performance_degradation', 'quota_exceeded', 'error_rate_high'
  severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT, -- 'workflow', 'integration', 'tenant'
  related_entity_id TEXT,
  metric_data JSONB DEFAULT '{}'::jsonb,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  INDEX (tenant_id, severity, is_resolved),
  INDEX (created_at, is_resolved)
);

-- Migration Tools Support
-- Create table for integration migration tracking
CREATE TABLE public.integration_migrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  migration_batch_id UUID NOT NULL,
  source_integration_id TEXT NOT NULL,
  target_integration_id TEXT NOT NULL,
  migration_type TEXT NOT NULL, -- 'stub_to_full', 'version_upgrade', 'provider_change'
  workflow_count INTEGER DEFAULT 0,
  credentials_count INTEGER DEFAULT 0,
  migration_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'rolled_back'
  migration_config JSONB DEFAULT '{}'::jsonb,
  migration_log JSONB DEFAULT '[]'::jsonb,
  error_details JSONB,
  backup_data JSONB, -- For rollback purposes
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  INDEX (tenant_id, migration_status),
  INDEX (migration_batch_id, migration_status)
);

-- Create table for workflow conversion tracking
CREATE TABLE public.workflow_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  migration_id UUID NOT NULL REFERENCES public.integration_migrations(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  original_steps JSONB NOT NULL, -- Backup of original workflow
  converted_steps JSONB, -- New workflow structure
  conversion_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'converted', 'failed', 'verified'
  conversion_notes TEXT,
  validation_results JSONB,
  manual_review_required BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced RLS Policies
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_marketplace_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_conversions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Tenant features are tenant-scoped" ON public.tenant_features FOR ALL USING (true);
CREATE POLICY "Tenant quotas are tenant-scoped" ON public.tenant_quotas FOR ALL USING (true);
CREATE POLICY "Marketplace packages are publicly readable" ON public.marketplace_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Marketplace packages are admin manageable" ON public.marketplace_packages FOR ALL USING (true);
CREATE POLICY "Marketplace installs are tenant-scoped" ON public.tenant_marketplace_installs FOR ALL USING (true);
CREATE POLICY "Marketplace reviews are tenant-scoped" ON public.marketplace_reviews FOR ALL USING (true);
CREATE POLICY "Execution metrics are tenant-scoped" ON public.execution_metrics FOR ALL USING (true);
CREATE POLICY "Performance benchmarks are tenant-scoped" ON public.performance_benchmarks FOR ALL USING (true);
CREATE POLICY "Performance alerts are tenant-scoped" ON public.performance_alerts FOR ALL USING (true);
CREATE POLICY "Integration migrations are tenant-scoped" ON public.integration_migrations FOR ALL USING (true);
CREATE POLICY "Workflow conversions are tenant-scoped" ON public.workflow_conversions FOR ALL USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_tenant_features_updated_at BEFORE UPDATE ON public.tenant_features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenant_quotas_updated_at BEFORE UPDATE ON public.tenant_quotas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketplace_packages_updated_at BEFORE UPDATE ON public.marketplace_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenant_marketplace_installs_updated_at BEFORE UPDATE ON public.tenant_marketplace_installs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketplace_reviews_updated_at BEFORE UPDATE ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_benchmarks_updated_at BEFORE UPDATE ON public.performance_benchmarks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_alerts_updated_at BEFORE UPDATE ON public.performance_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integration_migrations_updated_at BEFORE UPDATE ON public.integration_migrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflow_conversions_updated_at BEFORE UPDATE ON public.workflow_conversions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions for enterprise features
-- Function to check tenant quota
CREATE OR REPLACE FUNCTION public.check_tenant_quota(
  _tenant_id UUID,
  _resource_type TEXT,
  _usage_increment INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quota_record public.tenant_quotas%ROWTYPE;
  result JSONB;
BEGIN
  SELECT * INTO quota_record 
  FROM public.tenant_quotas 
  WHERE tenant_id = _tenant_id AND resource_type = _resource_type;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'No quota configuration found',
      'current_usage', 0,
      'quota_limit', 0
    );
  END IF;
  
  IF (quota_record.current_usage + _usage_increment) > quota_record.quota_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Quota exceeded',
      'current_usage', quota_record.current_usage,
      'quota_limit', quota_record.quota_limit
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'current_usage', quota_record.current_usage,
    'quota_limit', quota_record.quota_limit,
    'remaining', quota_record.quota_limit - quota_record.current_usage
  );
END;
$$;

-- Function to update tenant quota usage
CREATE OR REPLACE FUNCTION public.update_tenant_quota_usage(
  _tenant_id UUID,
  _resource_type TEXT,
  _usage_change INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tenant_quotas 
  SET current_usage = current_usage + _usage_change,
      updated_at = now()
  WHERE tenant_id = _tenant_id AND resource_type = _resource_type;
  
  RETURN FOUND;
END;
$$;

-- Function to calculate performance metrics
CREATE OR REPLACE FUNCTION public.calculate_performance_metrics(
  _tenant_id UUID,
  _time_period INTERVAL DEFAULT '24 hours'::INTERVAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_execution_time DECIMAL;
  total_executions INTEGER;
  error_rate DECIMAL;
  result JSONB;
BEGIN
  -- Calculate average execution time
  SELECT AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000)
  INTO avg_execution_time
  FROM public.workflow_executions
  WHERE tenant_id = _tenant_id 
    AND created_at > (now() - _time_period)
    AND status = 'completed';
  
  -- Calculate total executions
  SELECT COUNT(*)
  INTO total_executions
  FROM public.workflow_executions
  WHERE tenant_id = _tenant_id 
    AND created_at > (now() - _time_period);
  
  -- Calculate error rate
  SELECT (COUNT(*) FILTER (WHERE status = 'failed') * 100.0) / NULLIF(COUNT(*), 0)
  INTO error_rate
  FROM public.workflow_executions
  WHERE tenant_id = _tenant_id 
    AND created_at > (now() - _time_period);
  
  RETURN jsonb_build_object(
    'avg_execution_time_ms', COALESCE(avg_execution_time, 0),
    'total_executions', COALESCE(total_executions, 0),
    'error_rate_percent', COALESCE(error_rate, 0),
    'period_hours', EXTRACT(EPOCH FROM _time_period) / 3600
  );
END;
$$;