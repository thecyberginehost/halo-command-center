import { supabase } from '@/integrations/supabase/client';
import { CredentialsService, TenantCredential, CreateCredentialRequest } from './credentialsService';

export interface CredentialTest {
  integrationId: string;
  serviceType: string;
  testEndpoint?: string;
  testMethod?: 'GET' | 'POST';
  testPayload?: Record<string, any>;
  successIndicator?: (response: any) => boolean;
}

export interface CredentialTemplate {
  serviceType: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    placeholder?: string;
    description?: string;
    options?: Array<{ label: string; value: string }>;
  }>;
  documentation?: {
    setupUrl?: string;
    apiDocsUrl?: string;
    videoUrl?: string;
  };
}

export class EnterpriseCredentialsService extends CredentialsService {
  private credentialTemplates: Map<string, CredentialTemplate> = new Map();
  private credentialTests: Map<string, CredentialTest> = new Map();

  constructor() {
    super();
    this.initializeCredentialTemplates();
    this.initializeCredentialTests();
  }

  private initializeCredentialTemplates() {
    // OpenAI Credentials
    this.credentialTemplates.set('openai', {
      serviceType: 'openai',
      name: 'OpenAI',
      description: 'Connect to OpenAI GPT models and services',
      color: '#10A37F',
      fields: [
        {
          key: 'api_key',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'sk-...',
          description: 'Your OpenAI API key from platform.openai.com'
        },
        {
          key: 'organization_id',
          label: 'Organization ID',
          type: 'text',
          required: false,
          placeholder: 'org-...',
          description: 'Optional: Your OpenAI organization ID'
        }
      ],
      documentation: {
        setupUrl: 'https://platform.openai.com/api-keys',
        apiDocsUrl: 'https://platform.openai.com/docs/api-reference',
        videoUrl: 'https://www.youtube.com/watch?v=example'
      }
    });

    // Anthropic Credentials
    this.credentialTemplates.set('anthropic', {
      serviceType: 'anthropic',
      name: 'Anthropic (Claude)',
      description: 'Connect to Anthropic Claude AI models',
      color: '#D4A574',
      fields: [
        {
          key: 'api_key',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'sk-ant-...',
          description: 'Your Anthropic API key from console.anthropic.com'
        }
      ],
      documentation: {
        setupUrl: 'https://console.anthropic.com/account/keys',
        apiDocsUrl: 'https://docs.anthropic.com/claude/reference/getting-started',
      }
    });

    // Gmail Credentials
    this.credentialTemplates.set('gmail', {
      serviceType: 'gmail',
      name: 'Gmail',
      description: 'Connect to Gmail for email automation',
      color: '#EA4335',
      fields: [
        {
          key: 'auth_type',
          label: 'Authentication Type',
          type: 'select',
          required: true,
          options: [
            { label: 'OAuth2', value: 'oauth2' },
            { label: 'Service Account', value: 'service_account' }
          ],
          description: 'Choose your preferred authentication method'
        },
        {
          key: 'client_id',
          label: 'Client ID',
          type: 'text',
          required: true,
          placeholder: 'your-client-id.googleusercontent.com',
          description: 'OAuth2 Client ID from Google Cloud Console'
        },
        {
          key: 'client_secret',
          label: 'Client Secret',
          type: 'password',
          required: true,
          description: 'OAuth2 Client Secret from Google Cloud Console'
        },
        {
          key: 'refresh_token',
          label: 'Refresh Token',
          type: 'password',
          required: true,
          description: 'OAuth2 Refresh Token (obtained during OAuth flow)'
        }
      ],
      documentation: {
        setupUrl: 'https://console.cloud.google.com/apis/credentials',
        apiDocsUrl: 'https://developers.google.com/gmail/api',
      }
    });

    // Slack Credentials
    this.credentialTemplates.set('slack', {
      serviceType: 'slack',
      name: 'Slack',
      description: 'Connect to Slack for team communication automation',
      color: '#4A154B',
      fields: [
        {
          key: 'token_type',
          label: 'Token Type',
          type: 'select',
          required: true,
          options: [
            { label: 'Bot Token', value: 'bot' },
            { label: 'User Token', value: 'user' },
            { label: 'App Token', value: 'app' }
          ],
          description: 'Type of Slack token'
        },
        {
          key: 'access_token',
          label: 'Access Token',
          type: 'password',
          required: true,
          placeholder: 'xoxb-...',
          description: 'Your Slack access token'
        },
        {
          key: 'workspace_url',
          label: 'Workspace URL',
          type: 'url',
          required: false,
          placeholder: 'https://your-workspace.slack.com',
          description: 'Your Slack workspace URL'
        }
      ],
      documentation: {
        setupUrl: 'https://api.slack.com/apps',
        apiDocsUrl: 'https://api.slack.com/web',
      }
    });

    // Salesforce Credentials
    this.credentialTemplates.set('salesforce', {
      serviceType: 'salesforce',
      name: 'Salesforce',
      description: 'Connect to Salesforce CRM',
      color: '#00A1E0',
      fields: [
        {
          key: 'auth_type',
          label: 'Authentication Type',
          type: 'select',
          required: true,
          options: [
            { label: 'OAuth2', value: 'oauth2' },
            { label: 'Username/Password', value: 'username_password' }
          ]
        },
        {
          key: 'instance_url',
          label: 'Instance URL',
          type: 'url',
          required: true,
          placeholder: 'https://your-instance.salesforce.com',
          description: 'Your Salesforce instance URL'
        },
        {
          key: 'client_id',
          label: 'Consumer Key',
          type: 'text',
          required: true,
          description: 'Connected App Consumer Key'
        },
        {
          key: 'client_secret',
          label: 'Consumer Secret',
          type: 'password',
          required: true,
          description: 'Connected App Consumer Secret'
        },
        {
          key: 'username',
          label: 'Username',
          type: 'text',
          required: false,
          description: 'Salesforce username (for username/password flow)'
        },
        {
          key: 'password',
          label: 'Password',
          type: 'password',
          required: false,
          description: 'Salesforce password + security token'
        }
      ],
      documentation: {
        setupUrl: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm',
        apiDocsUrl: 'https://developer.salesforce.com/docs/api-explorer',
      }
    });

    // Generic Webhook Credentials
    this.credentialTemplates.set('webhook', {
      serviceType: 'webhook',
      name: 'Custom Webhook',
      description: 'Generic webhook credentials for custom integrations',
      color: '#6B7280',
      fields: [
        {
          key: 'auth_type',
          label: 'Authentication Type',
          type: 'select',
          required: true,
          options: [
            { label: 'None', value: 'none' },
            { label: 'API Key (Header)', value: 'api_key_header' },
            { label: 'API Key (Query)', value: 'api_key_query' },
            { label: 'Bearer Token', value: 'bearer' },
            { label: 'Basic Auth', value: 'basic' }
          ]
        },
        {
          key: 'base_url',
          label: 'Base URL',
          type: 'url',
          required: false,
          placeholder: 'https://api.example.com',
          description: 'Base URL for the API'
        },
        {
          key: 'api_key',
          label: 'API Key',
          type: 'password',
          required: false,
          description: 'API key for authentication'
        },
        {
          key: 'api_key_header',
          label: 'API Key Header Name',
          type: 'text',
          required: false,
          placeholder: 'X-API-Key',
          description: 'Header name for API key authentication'
        },
        {
          key: 'username',
          label: 'Username',
          type: 'text',
          required: false,
          description: 'Username for basic authentication'
        },
        {
          key: 'password',
          label: 'Password',
          type: 'password',
          required: false,
          description: 'Password for basic authentication'
        }
      ]
    });
  }

  private initializeCredentialTests() {
    // OpenAI Test
    this.credentialTests.set('openai', {
      integrationId: 'openai',
      serviceType: 'openai',
      testEndpoint: 'https://api.openai.com/v1/models',
      testMethod: 'GET',
      successIndicator: (response) => response.data && Array.isArray(response.data)
    });

    // Gmail Test
    this.credentialTests.set('gmail', {
      integrationId: 'gmail',
      serviceType: 'gmail',
      testEndpoint: 'https://gmail.googleapis.com/gmail/v1/users/me/profile',
      testMethod: 'GET',
      successIndicator: (response) => response.emailAddress !== undefined
    });

    // Slack Test
    this.credentialTests.set('slack', {
      integrationId: 'slack',
      serviceType: 'slack',
      testEndpoint: 'https://slack.com/api/auth.test',
      testMethod: 'POST',
      successIndicator: (response) => response.ok === true
    });

    // Salesforce Test
    this.credentialTests.set('salesforce', {
      integrationId: 'salesforce',
      serviceType: 'salesforce',
      testEndpoint: '/services/data/v57.0/sobjects/',
      testMethod: 'GET',
      successIndicator: (response) => Array.isArray(response.sobjects)
    });
  }

  getCredentialTemplates(): CredentialTemplate[] {
    return Array.from(this.credentialTemplates.values());
  }

  getCredentialTemplate(serviceType: string): CredentialTemplate | undefined {
    return this.credentialTemplates.get(serviceType);
  }

  async testCredentialAdvanced(credential: TenantCredential): Promise<{ success: boolean; message?: string; details?: any }> {
    const test = this.credentialTests.get(credential.service_type);
    if (!test) {
      return { success: true, message: 'No test available for this service type' };
    }

    try {
      // Use the edge function for secure credential testing
      const { data, error } = await supabase.functions.invoke('execute-integration', {
        body: {
          action: 'test_credential',
          credential,
          test
        }
      });

      if (error) throw error;

      return {
        success: data.success,
        message: data.message,
        details: data.details
      };
    } catch (error) {
      return {
        success: false,
        message: `Test failed: ${error.message}`,
        details: error
      };
    }
  }

  async createCredentialFromTemplate(
    tenantId: string,
    serviceType: string,
    name: string,
    values: Record<string, string>
  ): Promise<TenantCredential> {
    const template = this.getCredentialTemplate(serviceType);
    if (!template) {
      throw new Error(`No template found for service type: ${serviceType}`);
    }

    // Validate required fields
    const missingFields = template.fields
      .filter(field => field.required && !values[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const credentialRequest: CreateCredentialRequest = {
      name,
      description: template.description,
      service_type: serviceType,
      credentials: values
    };

    return this.createCredential(tenantId, credentialRequest);
  }

  async getCredentialUsage(credentialId: string): Promise<{
    workflows: Array<{ id: string; name: string; status: string }>;
    lastUsed?: string;
    usageCount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('id, name, status, steps')
        .contains('steps', [{ credential: credentialId }]);

      if (error) throw error;

      // Parse usage data
      const workflows = data || [];
      const usageCount = workflows.length;
      
      // Get last execution time for workflows using this credential
      const workflowIds = workflows.map(w => w.id);
      let lastUsed: string | undefined;

      if (workflowIds.length > 0) {
        const { data: executions } = await supabase
          .from('workflow_executions')
          .select('started_at')
          .in('workflow_id', workflowIds)
          .order('started_at', { ascending: false })
          .limit(1);

        lastUsed = executions?.[0]?.started_at;
      }

      return {
        workflows: workflows.map(w => ({
          id: w.id,
          name: w.name,
          status: w.status || 'draft'
        })),
        lastUsed,
        usageCount
      };
    } catch (error) {
      console.error('Failed to get credential usage:', error);
      return { workflows: [], usageCount: 0 };
    }
  }

  async rotateCredential(credentialId: string, newValues: Record<string, string>): Promise<TenantCredential> {
    try {
      // Get current credential
      const { data: currentCred, error: fetchError } = await supabase
        .from('tenant_credentials')
        .select('*')
        .eq('id', credentialId)
        .single();

      if (fetchError) throw fetchError;

      // Update with new values using encryption
      const { data, error } = await supabase.functions.invoke('encrypt-credentials', {
        body: {
          action: 'rotate',
          credentialId,
          newCredentials: newValues
        }
      });

      if (error) throw error;

      return data.data;
    } catch (error) {
      console.error('Failed to rotate credential:', error);
      throw error;
    }
  }
}