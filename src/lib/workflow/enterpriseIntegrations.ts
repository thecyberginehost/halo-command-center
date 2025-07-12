// Enterprise Integration Mapping for HALO Professional Automation Platform
export interface EnterpriseIntegration {
  id: string;
  name: string;
  category: string;
  processorType: string;
  description: string;
  icon: string;
  status: 'operational' | 'maintenance' | 'degraded';
  capabilities: string[];
  config: Record<string, any>;
}

export const enterpriseIntegrations: Record<string, EnterpriseIntegration> = {
  // Communication Processors
  slack: {
    id: 'slack',
    name: 'Slack Enterprise',
    category: 'communication',
    processorType: 'Communication Processor',
    description: 'Enterprise team messaging and notification hub',
    icon: 'MessageSquare',
    status: 'operational',
    capabilities: ['real_time_messaging', 'channel_management', 'bot_integration', 'workflow_notifications'],
    config: {
      channels: ['#sales', '#support', '#alerts'],
      templates: ['alert', 'notification', 'approval'],
      rate_limit: '100/minute'
    }
  },
  
  teams: {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication', 
    processorType: 'Communication Processor',
    description: 'Microsoft 365 integrated collaboration platform',
    icon: 'Users',
    status: 'operational',
    capabilities: ['team_messaging', 'file_sharing', 'video_integration', 'sharepoint_sync'],
    config: {
      teams: ['Sales Team', 'Support Team'],
      channels: ['General', 'Alerts'],
      integration_type: 'webhook'
    }
  },

  // CRM Processors
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce CRM',
    category: 'crm',
    processorType: 'CRM Processor',
    description: 'Enterprise customer relationship management',
    icon: 'Users2',
    status: 'operational',
    capabilities: ['lead_management', 'contact_sync', 'opportunity_tracking', 'custom_objects'],
    config: {
      api_version: 'v58.0',
      objects: ['Lead', 'Contact', 'Account', 'Opportunity'],
      sync_mode: 'bidirectional'
    }
  },

  hubspot: {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'crm',
    processorType: 'CRM Processor', 
    description: 'Inbound marketing and sales platform',
    icon: 'Target',
    status: 'operational',
    capabilities: ['contact_management', 'deal_tracking', 'marketing_automation', 'analytics'],
    config: {
      portal_id: 'auto_detect',
      objects: ['contacts', 'companies', 'deals'],
      sync_frequency: 'real_time'
    }
  },

  // Email Processors
  sendgrid: {
    id: 'sendgrid',
    name: 'SendGrid Email',
    category: 'email',
    processorType: 'Email Processor',
    description: 'Enterprise email delivery platform',
    icon: 'Mail',
    status: 'operational',
    capabilities: ['transactional_email', 'marketing_campaigns', 'analytics', 'template_engine'],
    config: {
      sender_verification: 'required',
      templates: ['welcome', 'notification', 'alert'],
      delivery_optimization: 'enabled'
    }
  },

  mailgun: {
    id: 'mailgun',
    name: 'Mailgun Email',
    category: 'email',
    processorType: 'Email Processor',
    description: 'Developer-focused email service',
    icon: 'Send',
    status: 'operational',
    capabilities: ['email_validation', 'routing', 'tracking', 'webhooks'],
    config: {
      domain_verification: 'required',
      tracking: 'enabled',
      validation: 'strict'
    }
  },

  // Database Processors
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    processorType: 'Database Processor',
    description: 'Enterprise relational database',
    icon: 'Database',
    status: 'operational',
    capabilities: ['complex_queries', 'transactions', 'json_support', 'full_text_search'],
    config: {
      connection_pool: 'enabled',
      ssl_mode: 'require',
      query_timeout: '30s'
    }
  },

  mongodb: {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    processorType: 'Database Processor',
    description: 'Document-oriented NoSQL database',
    icon: 'FileText',
    status: 'operational',
    capabilities: ['document_storage', 'aggregation', 'indexing', 'sharding'],
    config: {
      replica_set: 'enabled',
      write_concern: 'majority',
      read_preference: 'primary'
    }
  },

  // File Processors
  aws_s3: {
    id: 'aws_s3',
    name: 'AWS S3 Storage',
    category: 'storage',
    processorType: 'File Processor',
    description: 'Enterprise cloud object storage',
    icon: 'Cloud',
    status: 'operational',
    capabilities: ['object_storage', 'versioning', 'encryption', 'lifecycle_management'],
    config: {
      encryption: 'AES-256',
      versioning: 'enabled',
      lifecycle_rules: 'configured'
    }
  },

  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'storage',
    processorType: 'File Processor',
    description: 'Google Workspace file storage',
    icon: 'FolderOpen',
    status: 'operational',
    capabilities: ['file_sharing', 'collaboration', 'version_control', 'real_time_sync'],
    config: {
      sharing_permissions: 'controlled',
      sync_mode: 'selective',
      backup: 'enabled'
    }
  },

  // AI Processors
  openai: {
    id: 'openai',
    name: 'OpenAI GPT',
    category: 'ai',
    processorType: 'AI Processor',
    description: 'Advanced language model processing',
    icon: 'Brain',
    status: 'operational',
    capabilities: ['text_generation', 'analysis', 'classification', 'translation'],
    config: {
      model: 'gpt-4',
      temperature: 0.3,
      max_tokens: 2000,
      safety_filter: 'enabled'
    }
  },

  // Webhook Processors
  webhook: {
    id: 'webhook',
    name: 'Webhook Trigger',
    category: 'trigger',
    processorType: 'Webhook Processor',
    description: 'Real-time HTTP event processing',
    icon: 'Webhook',
    status: 'operational',
    capabilities: ['real_time_events', 'authentication', 'rate_limiting', 'payload_validation'],
    config: {
      authentication: ['bearer_token', 'api_key', 'hmac'],
      rate_limit: '1000/minute',
      payload_size_limit: '10MB'
    }
  }
};

export function getIntegrationByType(integrationType: string): EnterpriseIntegration | null {
  return enterpriseIntegrations[integrationType] || null;
}

export function getIntegrationsByCategory(category: string): EnterpriseIntegration[] {
  return Object.values(enterpriseIntegrations).filter(integration => 
    integration.category === category
  );
}

export function getProcessorTypeForIntegration(integrationId: string): string {
  const integration = enterpriseIntegrations[integrationId];
  return integration?.processorType || 'Generic Processor';
}

export const enterpriseCategories = [
  { id: 'communication', name: 'Communication', description: 'Team messaging and notifications' },
  { id: 'crm', name: 'CRM', description: 'Customer relationship management' },
  { id: 'email', name: 'Email', description: 'Email delivery and marketing' },
  { id: 'database', name: 'Database', description: 'Data storage and retrieval' },
  { id: 'storage', name: 'Storage', description: 'File and object storage' },
  { id: 'ai', name: 'AI', description: 'Artificial intelligence processing' },
  { id: 'trigger', name: 'Triggers', description: 'Event-driven automation' }
];