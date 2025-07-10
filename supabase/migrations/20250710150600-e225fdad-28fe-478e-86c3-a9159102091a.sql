-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('cloud', 'self_hosted')),
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  organization_limit INTEGER, -- null means unlimited
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  tenant_id UUID REFERENCES public.tenants(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create organization usage tracking
CREATE TABLE public.organization_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
  organization_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_code, plan_name, plan_type, price_monthly, price_yearly, organization_limit, features) VALUES
-- Cloud plans
('masp_starter', 'MASP Starter', 'cloud', 49.00, 490.00, 3, '{"unlimited_workflows": true, "unlimited_executions": true, "support": "standard"}'),
('masp_pro', 'MASP Pro', 'cloud', 149.00, 1490.00, 10, '{"unlimited_workflows": true, "unlimited_executions": true, "support": "priority", "advanced_analytics": true}'),
('masp_enterprise', 'MASP Enterprise', 'cloud', 399.00, 3990.00, null, '{"unlimited_workflows": true, "unlimited_executions": true, "support": "dedicated", "advanced_analytics": true, "white_labeling": true, "sso": true}'),
-- Self-hosted plans  
('self_hosted_free', 'Self-Hosted MASP', 'self_hosted', 0.00, 0.00, 1, '{"unlimited_workflows": true, "unlimited_executions": true, "support": "community"}'),
('self_hosted_enterprise', 'Self-Hosted MASP Enterprise', 'self_hosted', 999.00, 9990.00, null, '{"unlimited_workflows": true, "unlimited_executions": true, "support": "dedicated", "advanced_analytics": true, "audit_logging": true, "sso": true}');

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Plans are publicly readable" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their organization usage" ON public.organization_usage
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM public.user_subscriptions WHERE user_id = auth.uid()
  ));

-- Create function to check organization limits
CREATE OR REPLACE FUNCTION public.check_organization_limit(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_record public.user_subscriptions%ROWTYPE;
  plan_record public.subscription_plans%ROWTYPE;
  current_usage INTEGER;
  result JSONB;
BEGIN
  -- Get active subscription
  SELECT * INTO subscription_record 
  FROM public.user_subscriptions 
  WHERE tenant_id = p_tenant_id AND status = 'active'
  ORDER BY created_at DESC LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'No active subscription found',
      'current_usage', 0,
      'limit', 0
    );
  END IF;
  
  -- Get plan details
  SELECT * INTO plan_record
  FROM public.subscription_plans
  WHERE id = subscription_record.plan_id;
  
  -- Get current usage
  SELECT COALESCE(organization_count, 0) INTO current_usage
  FROM public.organization_usage
  WHERE tenant_id = p_tenant_id;
  
  -- Check if unlimited (null limit)
  IF plan_record.organization_limit IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'current_usage', current_usage,
      'limit', null,
      'unlimited', true
    );
  END IF;
  
  -- Check against limit
  RETURN jsonb_build_object(
    'allowed', current_usage < plan_record.organization_limit,
    'current_usage', current_usage,
    'limit', plan_record.organization_limit,
    'unlimited', false
  );
END;
$$;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions  
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();