import { supabase } from '@/integrations/supabase/client';
import { integrationExecutionEngine } from './integrationExecutionEngine';
import { IntegrationNode } from '@/types/integrations';

export interface IntegrationExecution {
  id: string;
  integrationId: string;
  tenantId: string;
  workflowId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  retryCount: number;
}

export interface WebhookEnvironment {
  id: string;
  name: string;
  url: string;
  isProduction: boolean;
  isActive: boolean;
}

export interface IntegrationCredential {
  id: string;
  tenantId: string;
  serviceId: string;
  name: string;
  authType: 'oauth' | 'api_key' | 'basic' | 'bearer' | 'custom';
  credentials: Record<string, any>;
  isActive: boolean;
  expiresAt?: Date;
  scopes?: string[];
}

export class AdvancedIntegrationService {
  
  /**
   * Execute integration with full functionality
   */
  async executeIntegration(
    integrationId: string,
    action: string,
    parameters: Record<string, any>,
    credentialId: string,
    tenantId: string,
    workflowId?: string
  ): Promise<IntegrationExecution> {
    const executionId = crypto.randomUUID();
    
    // Create execution record
    const execution: IntegrationExecution = {
      id: executionId,
      integrationId,
      tenantId,
      workflowId,
      status: 'pending',
      input: parameters,
      startedAt: new Date(),
      retryCount: 0
    };

    try {
      // Get credentials
      const credential = await this.getCredential(credentialId, tenantId);
      if (!credential) {
        throw new Error('Credential not found');
      }

      // Update status to running
      execution.status = 'running';
      await this.saveExecution(execution);

      // Execute via edge function for better performance and security
      const response = await supabase.functions.invoke('execute-integration', {
        body: {
          integrationId,
          action,
          parameters,
          credentials: credential.credentials,
          tenantId,
          workflowId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update execution with results
      execution.status = 'completed';
      execution.output = response.data.data;
      execution.completedAt = new Date();
      execution.duration = Date.now() - execution.startedAt.getTime();

      await this.saveExecution(execution);

      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date();
      execution.duration = Date.now() - execution.startedAt.getTime();

      await this.saveExecution(execution);
      throw error;
    }
  }

  /**
   * Set up webhook environments (test/production)
   */
  async createWebhookEnvironment(
    tenantId: string,
    workflowId: string,
    config: {
      name: string;
      isProduction: boolean;
      webhookUrl?: string;
    }
  ): Promise<WebhookEnvironment> {
    const environment: WebhookEnvironment = {
      id: crypto.randomUUID(),
      name: config.name,
      url: config.webhookUrl || `https://hooks.halo.masp/webhook/${tenantId}/${workflowId}/${config.isProduction ? 'prod' : 'test'}`,
      isProduction: config.isProduction,
      isActive: true
    };

    // Store environment configuration
    await supabase.from('webhook_environments').insert({
      id: environment.id,
      tenant_id: tenantId,
      workflow_id: workflowId,
      name: environment.name,
      url: environment.url,
      is_production: environment.isProduction,
      is_active: environment.isActive
    });

    return environment;
  }

  /**
   * OAuth2 flow implementation
   */
  async initiateOAuth2Flow(
    serviceId: string,
    tenantId: string,
    scopes: string[] = [],
    redirectUri?: string
  ): Promise<{ authUrl: string; state: string }> {
    const state = crypto.randomUUID();
    const clientId = await this.getOAuthClientId(serviceId);
    
    if (!clientId) {
      throw new Error(`OAuth not configured for service: ${serviceId}`);
    }

    const authUrls: Record<string, string> = {
      salesforce: 'https://login.salesforce.com/services/oauth2/authorize',
      hubspot: 'https://app.hubspot.com/oauth/authorize',
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      slack: 'https://slack.com/oauth/v2/authorize',
      shopify: 'https://shopify.com/oauth/authorize',
      stripe: 'https://connect.stripe.com/oauth/authorize'
    };

    const baseUrl = authUrls[serviceId];
    if (!baseUrl) {
      throw new Error(`OAuth not supported for service: ${serviceId}`);
    }

    const defaultRedirectUri = redirectUri || `${window.location.origin}/oauth/callback/${serviceId}`;
    const scopeString = scopes.length > 0 ? scopes.join(' ') : this.getDefaultScopes(serviceId);

    const authUrl = new URL(baseUrl);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', defaultRedirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopeString);
    authUrl.searchParams.set('state', state);

    // Store state for verification
    await supabase.from('oauth_states').insert({
      state,
      service_id: serviceId,
      tenant_id: tenantId,
      expires_at: new Date(Date.now() + 600000).toISOString() // 10 minutes
    });

    return {
      authUrl: authUrl.toString(),
      state
    };
  }

  /**
   * Complete OAuth2 flow
   */
  async completeOAuth2Flow(
    serviceId: string,
    code: string,
    state: string,
    tenantId: string
  ): Promise<IntegrationCredential> {
    // Verify state
    const { data: stateRecord } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('service_id', serviceId)
      .eq('tenant_id', tenantId)
      .single();

    if (!stateRecord) {
      throw new Error('Invalid OAuth state');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(serviceId, code);

    // Create credential
    const credential: IntegrationCredential = {
      id: crypto.randomUUID(),
      tenantId,
      serviceId,
      name: `${serviceId} OAuth Connection`,
      authType: 'oauth',
      credentials: tokens,
      isActive: true,
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : undefined,
      scopes: tokens.scope ? tokens.scope.split(' ') : undefined
    };

    await this.saveCredential(credential);

    // Clean up state
    await supabase.from('oauth_states').delete().eq('state', state);

    return credential;
  }

  /**
   * Test integration credentials
   */
  async testCredential(credentialId: string, tenantId: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const credential = await this.getCredential(credentialId, tenantId);
      if (!credential) {
        return { valid: false, error: 'Credential not found' };
      }

      // Test based on service type
      switch (credential.serviceId) {
        case 'salesforce':
          return await this.testSalesforceCredential(credential);
        case 'hubspot':
          return await this.testHubSpotCredential(credential);
        case 'slack':
          return await this.testSlackCredential(credential);
        case 'gmail':
          return await this.testGmailCredential(credential);
        default:
          return { valid: false, error: 'Credential testing not implemented for this service' };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get integration execution history
   */
  async getExecutionHistory(
    tenantId: string,
    filters: {
      integrationId?: string;
      workflowId?: string;
      status?: string;
      limit?: number;
    } = {}
  ): Promise<IntegrationExecution[]> {
    let query = supabase
      .from('integration_executions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('started_at', { ascending: false })
      .limit(filters.limit || 50);

    if (filters.integrationId) {
      query = query.eq('integration_id', filters.integrationId);
    }

    if (filters.workflowId) {
      query = query.eq('workflow_id', filters.workflowId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to get execution history: ${error.message}`);
    }

    return data.map(row => ({
      id: row.id,
      integrationId: row.integration_id,
      tenantId: row.tenant_id,
      workflowId: row.workflow_id,
      status: row.status as 'pending' | 'running' | 'completed' | 'failed',
      input: row.input as Record<string, any>,
      output: row.output as Record<string, any>,
      error: row.error || undefined,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      duration: row.duration || undefined,
      retryCount: row.retry_count || 0
    }));
  }

  /**
   * Enhanced data mapping and transformation
   */
  async createDataMapping(
    tenantId: string,
    sourceIntegration: string,
    targetIntegration: string,
    mappings: Array<{
      sourcePath: string;
      targetPath: string;
      transformation?: string;
    }>
  ): Promise<string> {
    const mappingId = crypto.randomUUID();

    await supabase.from('data_mappings').insert({
      id: mappingId,
      tenant_id: tenantId,
      source_integration: sourceIntegration,
      target_integration: targetIntegration,
      mappings: mappings
    });

    return mappingId;
  }

  // Private helper methods

  private async saveExecution(execution: IntegrationExecution): Promise<void> {
    await supabase.from('integration_executions').upsert({
      id: execution.id,
      integration_id: execution.integrationId,
      tenant_id: execution.tenantId,
      workflow_id: execution.workflowId,
      status: execution.status,
      input: execution.input,
      output: execution.output,
      error: execution.error,
      started_at: execution.startedAt.toISOString(),
      completed_at: execution.completedAt?.toISOString(),
      duration: execution.duration,
      retry_count: execution.retryCount
    });
  }

  private async getCredential(credentialId: string, tenantId: string): Promise<IntegrationCredential | null> {
    const { data, error } = await supabase
      .from('tenant_credentials')
      .select('*')
      .eq('id', credentialId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      tenantId: data.tenant_id,
      serviceId: data.service_type,
      name: data.name,
      authType: (data.auth_type || 'api_key') as 'oauth' | 'api_key' | 'basic' | 'bearer' | 'custom',
      credentials: typeof data.credentials === 'object' ? data.credentials as Record<string, any> : {},
      isActive: data.is_active,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      scopes: data.scopes
    };
  }

  private async saveCredential(credential: IntegrationCredential): Promise<void> {
    await supabase.from('tenant_credentials').insert({
      id: credential.id,
      tenant_id: credential.tenantId,
      service_type: credential.serviceId,
      name: credential.name,
      auth_type: credential.authType,
      credentials: credential.credentials,
      is_active: credential.isActive,
      expires_at: credential.expiresAt?.toISOString(),
      scopes: credential.scopes
    });
  }

  private async getOAuthClientId(serviceId: string): Promise<string | null> {
    const { data } = await supabase
      .from('oauth_configs')
      .select('client_id')
      .eq('service_id', serviceId)
      .single();

    return data?.client_id || null;
  }

  private getDefaultScopes(serviceId: string): string {
    const defaultScopes: Record<string, string> = {
      salesforce: 'api refresh_token',
      hubspot: 'crm.objects.contacts.write crm.objects.deals.write',
      google: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
      microsoft: 'https://graph.microsoft.com/mail.send https://graph.microsoft.com/mail.read',
      slack: 'chat:write channels:read',
      shopify: 'read_orders write_orders read_customers write_customers',
      stripe: 'read_write'
    };

    return defaultScopes[serviceId] || '';
  }

  private async exchangeCodeForTokens(serviceId: string, code: string): Promise<any> {
    // This would implement the actual token exchange for each service
    // For now, return mock tokens
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600,
      token_type: 'Bearer'
    };
  }

  private async testSalesforceCredential(credential: IntegrationCredential): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
        headers: {
          'Authorization': `Bearer ${credential.credentials.access_token}`
        }
      });

      if (response.ok) {
        return { valid: true };
      } else {
        return { valid: false, error: 'Invalid Salesforce credentials' };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  private async testHubSpotCredential(credential: IntegrationCredential): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/me', {
        headers: {
          'Authorization': `Bearer ${credential.credentials.access_token}`
        }
      });

      if (response.ok) {
        return { valid: true };
      } else {
        return { valid: false, error: 'Invalid HubSpot credentials' };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  private async testSlackCredential(credential: IntegrationCredential): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${credential.credentials.bot_token}`
        }
      });

      const result = await response.json();
      if (result.ok) {
        return { valid: true };
      } else {
        return { valid: false, error: result.error };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  private async testGmailCredential(credential: IntegrationCredential): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${credential.credentials.access_token}`
        }
      });

      if (response.ok) {
        return { valid: true };
      } else {
        return { valid: false, error: 'Invalid Gmail credentials' };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

export const advancedIntegrationService = new AdvancedIntegrationService();