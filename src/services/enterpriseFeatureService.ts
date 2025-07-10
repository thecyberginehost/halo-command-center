import { supabase } from '@/integrations/supabase/client';

export interface MASPProvider {
  id: string;
  tenantId: string;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  certificationDate: string; // ISO string for JSON compatibility
  expirationDate: string; // ISO string for JSON compatibility
  isActive: boolean;
  specializations: string[];
  clientCount: number;
  automationCount: number;
  successRate: number;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
    website?: string;
  };
  billing: {
    plan: 'starter' | 'professional' | 'enterprise' | 'white_label';
    monthlyRevenue: number;
    clientSeats: number;
    maxAutomations: number;
  };
}

export interface MarketplaceIntegration {
  id: string;
  name: string;
  description: string;
  category: string;
  providerId: string;
  providerName: string;
  version: string;
  price: number;
  pricingModel: 'free' | 'one_time' | 'monthly' | 'per_execution';
  downloads: number;
  rating: number;
  reviews: MarketplaceReview[];
  isVerified: boolean;
  isFeatured: boolean;
  tags: string[];
  screenshots: string[];
  documentation: string;
  supportEmail: string;
  lastUpdated: Date;
  integrationConfig: {
    nodes: any[];
    templates: any[];
    credentials: any[];
  };
}

export interface MarketplaceReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  verified: boolean;
}

export interface WhiteLabelConfig {
  tenantId: string;
  isEnabled: boolean;
  customDomain?: string;
  branding: {
    platformName: string;
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    font: string;
  };
  features: {
    hideHALOBranding: boolean;
    customLoginPage: boolean;
    customEmailTemplates: boolean;
    customDocumentation: boolean;
    customSupport: boolean;
  };
  sso: {
    enabled: boolean;
    provider: 'saml' | 'oauth' | 'oidc';
    config: Record<string, any>;
  };
  compliance: {
    dataResidency: string;
    encryptionLevel: 'standard' | 'enhanced' | 'military';
    auditLogging: boolean;
    gdprCompliant: boolean;
    hipaaCompliant: boolean;
    soc2Compliant: boolean;
  };
}

export class MASPCertificationService {
  async getMASPProvider(tenantId: string): Promise<MASPProvider | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, masp_provider_data')
        .eq('id', tenantId)
        .maybeSingle();

      if (error) throw error;

      if (data?.masp_provider_data && typeof data.masp_provider_data === 'object') {
        const providerData = data.masp_provider_data as any;
        return {
          ...providerData,
          tenantId: data.id
        } as MASPProvider;
      }
      return null;
    } catch (error) {
      console.error('Failed to get MASP provider:', error);
      return null;
    }
  }

  async updateCertificationLevel(
    tenantId: string, 
    level: MASPProvider['certificationLevel'],
    specializations: string[]
  ): Promise<void> {
    try {
      const provider = await this.getMASPProvider(tenantId);
      
      const updatedProvider = {
        ...provider,
        certificationLevel: level,
        specializations,
        certificationDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      };

      const { error } = await supabase
        .from('tenants')
        .update({
          masp_provider_data: updatedProvider as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (error) throw error;

      // Award certification badge
      await this.awardCertificationBadge(tenantId, level);
      
    } catch (error) {
      console.error('Failed to update certification:', error);
      throw error;
    }
  }

  async validateCertification(tenantId: string): Promise<{
    isValid: boolean;
    level?: string;
    expiresIn?: number;
    renewalRequired?: boolean;
  }> {
    try {
      const provider = await this.getMASPProvider(tenantId);
      
      if (!provider || !provider.isActive) {
        return { isValid: false };
      }

      const now = new Date();
      const expirationDate = new Date(provider.expirationDate);
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        isValid: expirationDate > now,
        level: provider.certificationLevel,
        expiresIn: daysUntilExpiration,
        renewalRequired: daysUntilExpiration < 30
      };
      
    } catch (error) {
      console.error('Failed to validate certification:', error);
      return { isValid: false };
    }
  }

  private async awardCertificationBadge(tenantId: string, level: string): Promise<void> {
    try {
      await supabase
        .from('system_knowledge_base')
        .insert({
          title: `MASP ${level.toUpperCase()} Certification Awarded`,
          content: JSON.stringify({
            tenantId,
            level,
            awardedAt: new Date().toISOString(),
            type: 'certification_badge'
          }),
          category: 'masp_certification',
          tags: ['masp', 'certification', level, tenantId],
          priority: 5
        });
    } catch (error) {
      console.error('Failed to award certification badge:', error);
    }
  }

  async getCertificationRequirements(targetLevel: string): Promise<{
    automationsRequired: number;
    clientsRequired: number;
    successRateRequired: number;
    specializations: string[];
    examRequired: boolean;
    practicalTestRequired: boolean;
  }> {
    const requirements = {
      bronze: {
        automationsRequired: 10,
        clientsRequired: 3,
        successRateRequired: 90,
        specializations: [],
        examRequired: true,
        practicalTestRequired: false
      },
      silver: {
        automationsRequired: 50,
        clientsRequired: 10,
        successRateRequired: 95,
        specializations: ['email', 'crm'],
        examRequired: true,
        practicalTestRequired: true
      },
      gold: {
        automationsRequired: 200,
        clientsRequired: 25,
        successRateRequired: 98,
        specializations: ['email', 'crm', 'ai', 'data'],
        examRequired: true,
        practicalTestRequired: true
      },
      platinum: {
        automationsRequired: 500,
        clientsRequired: 50,
        successRateRequired: 99,
        specializations: ['email', 'crm', 'ai', 'data', 'enterprise'],
        examRequired: true,
        practicalTestRequired: true
      }
    };

    return requirements[targetLevel as keyof typeof requirements] || requirements.bronze;
  }
}

export class MarketplaceService {
  async getMarketplaceIntegrations(
    category?: string,
    verified?: boolean,
    featured?: boolean
  ): Promise<MarketplaceIntegration[]> {
    try {
      let query = supabase
        .from('system_knowledge_base')
        .select('*')
        .eq('category', 'marketplace_integration');

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const integrations = data?.map(row => {
        try {
          return JSON.parse(row.content) as MarketplaceIntegration;
        } catch {
          return null;
        }
      }).filter(Boolean) || [];

      // Apply filters
      return integrations.filter(integration => {
        if (category && integration.category !== category) return false;
        if (verified !== undefined && integration.isVerified !== verified) return false;
        if (featured !== undefined && integration.isFeatured !== featured) return false;
        return true;
      });

    } catch (error) {
      console.error('Failed to get marketplace integrations:', error);
      return [];
    }
  }

  async submitIntegration(
    providerId: string,
    integration: Omit<MarketplaceIntegration, 'id' | 'downloads' | 'rating' | 'reviews' | 'isVerified' | 'isFeatured' | 'lastUpdated'>
  ): Promise<string> {
    try {
      const integrationId = `marketplace-${Date.now()}`;
      
      const fullIntegration: MarketplaceIntegration = {
        ...integration,
        id: integrationId,
        downloads: 0,
        rating: 0,
        reviews: [],
        isVerified: false,
        isFeatured: false,
        lastUpdated: new Date()
      };

      const { error } = await supabase
        .from('system_knowledge_base')
        .insert({
          title: `Marketplace Integration: ${integration.name}`,
          content: JSON.stringify(fullIntegration),
          category: 'marketplace_integration',
          tags: [integration.category, providerId, ...integration.tags],
          priority: 3
        });

      if (error) throw error;

      // Notify MASP team for review
      await this.notifyForReview(integrationId, providerId);

      return integrationId;
      
    } catch (error) {
      console.error('Failed to submit integration:', error);
      throw error;
    }
  }

  private async notifyForReview(integrationId: string, providerId: string): Promise<void> {
    try {
      await supabase
        .from('system_knowledge_base')
        .insert({
          title: `Integration Review Required: ${integrationId}`,
          content: JSON.stringify({
            integrationId,
            providerId,
            submittedAt: new Date().toISOString(),
            status: 'pending_review',
            type: 'review_request'
          }),
          category: 'admin_notification',
          tags: ['review', 'marketplace', providerId],
          priority: 4
        });
    } catch (error) {
      console.error('Failed to notify for review:', error);
    }
  }

  async installIntegration(tenantId: string, integrationId: string): Promise<void> {
    try {
      // Record installation
      await supabase
        .from('tenant_knowledge_bases')
        .insert({
          tenant_id: tenantId,
          title: `Installed Integration: ${integrationId}`,
          content: JSON.stringify({
            integrationId,
            installedAt: new Date().toISOString(),
            type: 'installed_integration'
          }),
          category: 'installed_integrations',
          tags: ['marketplace', 'installed', integrationId]
        });

      // Update download count
      await this.incrementDownloadCount(integrationId);
      
    } catch (error) {
      console.error('Failed to install integration:', error);
      throw error;
    }
  }

  private async incrementDownloadCount(integrationId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('system_knowledge_base')
        .select('*')
        .eq('category', 'marketplace_integration')
        .like('content', `%"id":"${integrationId}"%`)
        .single();

      if (error || !data) return;

      const integration = JSON.parse(data.content);
      integration.downloads += 1;

      await supabase
        .from('system_knowledge_base')
        .update({
          content: JSON.stringify(integration),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
        
    } catch (error) {
      console.error('Failed to increment download count:', error);
    }
  }
}

export class WhiteLabelService {
  async getWhiteLabelConfig(tenantId: string): Promise<WhiteLabelConfig | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, white_label_config')
        .eq('id', tenantId)
        .maybeSingle();

      if (error) throw error;

      return data?.white_label_config ? (data.white_label_config as unknown as WhiteLabelConfig) : null;
    } catch (error) {
      console.error('Failed to get white label config:', error);
      return null;
    }
  }

  async updateWhiteLabelConfig(
    tenantId: string,
    config: Partial<WhiteLabelConfig>
  ): Promise<void> {
    try {
      const currentConfig = await this.getWhiteLabelConfig(tenantId);
      
      const updatedConfig: WhiteLabelConfig = {
        ...currentConfig,
        ...config,
        tenantId
      };

      const { error } = await supabase
        .from('tenants')
        .update({
          white_label_config: updatedConfig as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (error) throw error;

      // Apply configuration changes
      await this.applyWhiteLabelConfig(updatedConfig);
      
    } catch (error) {
      console.error('Failed to update white label config:', error);
      throw error;
    }
  }

  private async applyWhiteLabelConfig(config: WhiteLabelConfig): Promise<void> {
    try {
      // This would integrate with CDN/DNS services to apply custom domains
      // For now, we'll store the configuration for the frontend to use
      
      console.log('Applying white label configuration:', {
        tenant: config.tenantId,
        domain: config.customDomain,
        branding: config.branding.platformName
      });

      // In a real implementation, this would:
      // 1. Configure custom domain DNS
      // 2. Update CDN settings
      // 3. Generate custom CSS files
      // 4. Configure SSO providers
      // 5. Set up compliance monitoring
      
    } catch (error) {
      console.error('Failed to apply white label config:', error);
    }
  }

  async validateWhiteLabelEligibility(tenantId: string): Promise<{
    eligible: boolean;
    reasons?: string[];
    requirements?: string[];
  }> {
    try {
      const maspService = new MASPCertificationService();
      const provider = await maspService.getMASPProvider(tenantId);
      const certification = await maspService.validateCertification(tenantId);

      const reasons: string[] = [];
      const requirements: string[] = [];

      if (!provider) {
        reasons.push('MASP provider registration required');
        requirements.push('Register as a MASP provider');
      }

      if (!certification.isValid || certification.level === 'bronze') {
        reasons.push('Minimum Silver MASP certification required');
        requirements.push('Achieve Silver MASP certification or higher');
      }

      if (provider && provider.clientCount < 10) {
        reasons.push('Minimum 10 active clients required');
        requirements.push('Serve at least 10 active clients');
      }

      if (provider && provider.billing.plan !== 'enterprise' && provider.billing.plan !== 'white_label') {
        reasons.push('Enterprise or White Label plan required');
        requirements.push('Upgrade to Enterprise or White Label plan');
      }

      return {
        eligible: reasons.length === 0,
        reasons: reasons.length > 0 ? reasons : undefined,
        requirements: requirements.length > 0 ? requirements : undefined
      };
      
    } catch (error) {
      console.error('Failed to validate white label eligibility:', error);
      return {
        eligible: false,
        reasons: ['Validation error occurred'],
        requirements: ['Contact support for assistance']
      };
    }
  }
}