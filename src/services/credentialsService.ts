import { supabase } from '@/integrations/supabase/client';

export interface TenantCredential {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  service_type: string;
  credentials: any; // Use any to match the database Json type
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCredentialRequest {
  name: string;
  description?: string;
  service_type: string;
  credentials: Record<string, string>;
}

export class CredentialsService {
  async getCredentialsForTenant(tenantId: string): Promise<TenantCredential[]> {
    const { data, error } = await supabase
      .from('tenant_credentials')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Failed to fetch credentials:', error);
      throw error;
    }

    return data || [];
  }

  async getCredentialsByService(tenantId: string, serviceType: string): Promise<TenantCredential[]> {
    const { data, error } = await supabase
      .from('tenant_credentials')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('service_type', serviceType)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Failed to fetch credentials by service:', error);
      throw error;
    }

    return data || [];
  }

  async createCredential(tenantId: string, credential: CreateCredentialRequest): Promise<TenantCredential> {
    const { data, error } = await supabase
      .from('tenant_credentials')
      .insert({
        tenant_id: tenantId,
        ...credential
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create credential:', error);
      throw error;
    }

    return data;
  }

  async updateCredential(credentialId: string, updates: Partial<CreateCredentialRequest>): Promise<TenantCredential> {
    const { data, error } = await supabase
      .from('tenant_credentials')
      .update(updates)
      .eq('id', credentialId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update credential:', error);
      throw error;
    }

    return data;
  }

  async deleteCredential(credentialId: string): Promise<void> {
    const { error } = await supabase
      .from('tenant_credentials')
      .update({ is_active: false })
      .eq('id', credentialId);

    if (error) {
      console.error('Failed to delete credential:', error);
      throw error;
    }
  }

  async testCredential(credential: TenantCredential): Promise<{ success: boolean; error?: string }> {
    try {
      // Test the credential based on service type
      switch (credential.service_type) {
        case 'openai':
          const openaiResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${credential.credentials.api_key}`,
            },
          });
          return { success: openaiResponse.ok };

        case 'anthropic':
          // Claude doesn't have a simple test endpoint, so we'll just check if the key exists
          return { success: !!credential.credentials.api_key };

        default:
          return { success: true }; // Default to success for unknown services
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}