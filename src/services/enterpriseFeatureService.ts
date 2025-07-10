import { supabase } from '@/integrations/supabase/client';

export interface TenantFeature {
  id: string;
  tenant_id: string;
  feature_name: string;
  is_enabled: boolean;
  feature_config: any;
  usage_limit?: number;
  current_usage: number;
  reset_period: string;
  last_reset: string;
  created_at: string;
  updated_at: string;
}

export interface TenantQuota {
  id: string;
  tenant_id: string;
  resource_type: string;
  quota_limit: number;
  current_usage: number;
  soft_limit?: number;
  hard_limit?: number;
  reset_period: string;
  last_reset: string;
  created_at: string;
  updated_at: string;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  current_usage: number;
  quota_limit: number;
  remaining?: number;
}

export class EnterpriseFeatureService {
  
  /**
   * Get tenant features with current usage
   */
  async getTenantFeatures(tenantId: string): Promise<TenantFeature[]> {
    const { data, error } = await supabase
      .from('tenant_features')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('feature_name');

    if (error) {
      console.error('Error fetching tenant features:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Check if a feature is enabled for tenant
   */
  async isFeatureEnabled(tenantId: string, featureName: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('tenant_features')
      .select('is_enabled')
      .eq('tenant_id', tenantId)
      .eq('feature_name', featureName)
      .single();

    if (error) {
      console.error('Error checking feature status:', error);
      return false; // Default to disabled
    }

    return data?.is_enabled || false;
  }

  /**
   * Enable/disable a feature for tenant
   */
  async toggleFeature(
    tenantId: string, 
    featureName: string, 
    enabled: boolean,
    config?: any
  ): Promise<TenantFeature> {
    const { data, error } = await supabase
      .from('tenant_features')
      .upsert({
        tenant_id: tenantId,
        feature_name: featureName,
        is_enabled: enabled,
        feature_config: config || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error toggling feature:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get tenant quotas
   */
  async getTenantQuotas(tenantId: string): Promise<TenantQuota[]> {
    const { data, error } = await supabase
      .from('tenant_quotas')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('resource_type');

    if (error) {
      console.error('Error fetching tenant quotas:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Check quota before resource usage
   */
  async checkQuota(
    tenantId: string, 
    resourceType: string, 
    usageIncrement: number = 1
  ): Promise<QuotaCheckResult> {
    const { data, error } = await supabase.rpc(
      'check_tenant_quota',
      {
        _tenant_id: tenantId,
        _resource_type: resourceType,
        _usage_increment: usageIncrement
      }
    );

    if (error) {
      console.error('Error checking quota:', error);
      throw error;
    }

    return data as unknown as QuotaCheckResult;
  }

  /**
   * Update quota usage
   */
  async updateQuotaUsage(
    tenantId: string, 
    resourceType: string, 
    usageChange: number
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc(
      'update_tenant_quota_usage',
      {
        _tenant_id: tenantId,
        _resource_type: resourceType,
        _usage_change: usageChange
      }
    );

    if (error) {
      console.error('Error updating quota usage:', error);
      throw error;
    }

    return data;
  }

  /**
   * Set up default quotas for new tenant
   */
  async initializeTenantQuotas(tenantId: string): Promise<void> {
    const defaultQuotas = [
      { resource_type: 'workflows', quota_limit: 50, soft_limit: 40, hard_limit: 50 },
      { resource_type: 'executions_per_month', quota_limit: 10000, soft_limit: 8000, hard_limit: 10000 },
      { resource_type: 'storage_gb', quota_limit: 5, soft_limit: 4, hard_limit: 5 },
      { resource_type: 'api_calls_per_day', quota_limit: 100000, soft_limit: 80000, hard_limit: 100000 },
    ];

    const { error } = await supabase
      .from('tenant_quotas')
      .insert(
        defaultQuotas.map(quota => ({
          tenant_id: tenantId,
          ...quota
        }))
      );

    if (error) {
      console.error('Error initializing tenant quotas:', error);
      throw error;
    }
  }

  /**
   * Set up default features for new tenant
   */
  async initializeTenantFeatures(tenantId: string, plan: string = 'basic'): Promise<void> {
    const featureConfigs = {
      basic: [
        { feature_name: 'visual_workflow_builder', is_enabled: true },
        { feature_name: 'basic_integrations', is_enabled: true },
        { feature_name: 'webhook_triggers', is_enabled: true },
        { feature_name: 'advanced_integrations', is_enabled: false },
        { feature_name: 'marketplace_access', is_enabled: false },
        { feature_name: 'performance_monitoring', is_enabled: false },
        { feature_name: 'white_label', is_enabled: false },
        { feature_name: 'sso_authentication', is_enabled: false },
      ],
      professional: [
        { feature_name: 'visual_workflow_builder', is_enabled: true },
        { feature_name: 'basic_integrations', is_enabled: true },
        { feature_name: 'webhook_triggers', is_enabled: true },
        { feature_name: 'advanced_integrations', is_enabled: true },
        { feature_name: 'marketplace_access', is_enabled: true },
        { feature_name: 'performance_monitoring', is_enabled: true },
        { feature_name: 'white_label', is_enabled: false },
        { feature_name: 'sso_authentication', is_enabled: false },
      ],
      enterprise: [
        { feature_name: 'visual_workflow_builder', is_enabled: true },
        { feature_name: 'basic_integrations', is_enabled: true },
        { feature_name: 'webhook_triggers', is_enabled: true },
        { feature_name: 'advanced_integrations', is_enabled: true },
        { feature_name: 'marketplace_access', is_enabled: true },
        { feature_name: 'performance_monitoring', is_enabled: true },
        { feature_name: 'white_label', is_enabled: true },
        { feature_name: 'sso_authentication', is_enabled: true },
      ]
    };

    const features = featureConfigs[plan as keyof typeof featureConfigs] || featureConfigs.basic;

    const { error } = await supabase
      .from('tenant_features')
      .insert(
        features.map(feature => ({
          tenant_id: tenantId,
          ...feature,
          feature_config: {}
        }))
      );

    if (error) {
      console.error('Error initializing tenant features:', error);
      throw error;
    }
  }

  /**
   * Get quota usage summary
   */
  async getQuotaUsageSummary(tenantId: string): Promise<{
    quotas: TenantQuota[];
    warningThresholds: string[];
    criticalThresholds: string[];
  }> {
    const quotas = await this.getTenantQuotas(tenantId);
    
    const warningThresholds: string[] = [];
    const criticalThresholds: string[] = [];

    quotas.forEach(quota => {
      const usagePercent = (quota.current_usage / quota.quota_limit) * 100;
      
      if (quota.soft_limit && quota.current_usage >= quota.soft_limit) {
        warningThresholds.push(quota.resource_type);
      }
      
      if (quota.hard_limit && quota.current_usage >= quota.hard_limit) {
        criticalThresholds.push(quota.resource_type);
      } else if (usagePercent >= 90) {
        criticalThresholds.push(quota.resource_type);
      }
    });

    return {
      quotas,
      warningThresholds,
      criticalThresholds
    };
  }
}

export const enterpriseFeatureService = new EnterpriseFeatureService();