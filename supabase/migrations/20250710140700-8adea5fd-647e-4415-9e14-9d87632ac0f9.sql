-- Phase 5: Testing & Documentation Tables

-- Integration Testing Tables
CREATE TABLE public.integration_test_suites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  integration_id TEXT,
  category TEXT NOT NULL CHECK (category IN ('smoke', 'regression', 'performance', 'security', 'compatibility')),
  schedule TEXT,
  tenant_id UUID NOT NULL,
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.integration_test_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suite_id UUID REFERENCES public.integration_test_suites(id) ON DELETE CASCADE,
  integration_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('unit', 'integration', 'e2e', 'load', 'security')),
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_output JSONB NOT NULL DEFAULT '{}'::jsonb,
  test_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'passed', 'failed', 'skipped')),
  last_run TIMESTAMP WITH TIME ZONE,
  execution_time INTEGER,
  error_details TEXT,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Load Testing Tables
CREATE TABLE public.load_test_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  integration_id TEXT NOT NULL,
  test_duration INTEGER NOT NULL,
  concurrent_users INTEGER NOT NULL,
  requests_per_second INTEGER NOT NULL,
  ramp_up_time INTEGER NOT NULL,
  test_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  environment TEXT NOT NULL DEFAULT 'test' CHECK (environment IN ('test', 'staging', 'production')),
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.load_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.load_test_configs(id) ON DELETE CASCADE,
  result_data JSONB NOT NULL,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documentation Tables
CREATE TABLE public.generated_documentation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'markdown' CHECK (format IN ('markdown', 'html', 'pdf', 'json')),
  type TEXT NOT NULL CHECK (type IN ('integration', 'api', 'workflow', 'troubleshooting', 'user_guide')),
  integration_id TEXT,
  workflow_id UUID,
  version TEXT NOT NULL DEFAULT '1.0.0',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migration Tables
CREATE TABLE public.migration_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  source_system TEXT NOT NULL,
  target_system TEXT NOT NULL,
  migration_type TEXT NOT NULL CHECK (migration_type IN ('full', 'incremental', 'selective')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'in_progress', 'completed', 'failed', 'cancelled')),
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_duration INTEGER NOT NULL,
  actual_duration INTEGER,
  tenant_id UUID NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  rollback_plan JSONB,
  validation_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.migration_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.migration_plans(id) ON DELETE CASCADE,
  execution_id TEXT NOT NULL,
  report_data JSONB NOT NULL,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Optimization Tables
CREATE TABLE public.optimization_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  condition TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('cache', 'batch', 'retry', 'circuit_breaker', 'rate_limit')),
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.integration_test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_test_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Integration test suites are tenant-scoped" ON public.integration_test_suites FOR ALL USING (true);
CREATE POLICY "Integration test cases are tenant-scoped" ON public.integration_test_cases FOR ALL USING (true);
CREATE POLICY "Load test configs are tenant-scoped" ON public.load_test_configs FOR ALL USING (true);
CREATE POLICY "Load test results are tenant-scoped" ON public.load_test_results FOR ALL USING (true);
CREATE POLICY "Generated documentation is tenant-scoped" ON public.generated_documentation FOR ALL USING (true);
CREATE POLICY "Migration plans are tenant-scoped" ON public.migration_plans FOR ALL USING (true);
CREATE POLICY "Migration reports are tenant-scoped" ON public.migration_reports FOR ALL USING (true);
CREATE POLICY "Optimization rules are tenant-scoped" ON public.optimization_rules FOR ALL USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_integration_test_suites_updated_at
  BEFORE UPDATE ON public.integration_test_suites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_test_cases_updated_at
  BEFORE UPDATE ON public.integration_test_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_load_test_configs_updated_at
  BEFORE UPDATE ON public.load_test_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_documentation_updated_at
  BEFORE UPDATE ON public.generated_documentation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_migration_plans_updated_at
  BEFORE UPDATE ON public.migration_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_optimization_rules_updated_at
  BEFORE UPDATE ON public.optimization_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();