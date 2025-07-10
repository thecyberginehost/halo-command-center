import { IntegrationField, IntegrationNode } from '@/types/integrations';

export interface DynamicProperty {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'dropdown' | 'multiselect' | 'json';
  description?: string;
  required?: boolean;
  default?: any;
  options?: Array<{ name: string; value: string; description?: string }>;
  dependsOn?: string[];
  displayOptions?: {
    show?: Record<string, any[]>;
    hide?: Record<string, any[]>;
  };
  placeholder?: string;
  routing?: {
    request?: {
      property: string;
      value: string;
    };
    output?: {
      postReceive?: Array<{
        type: string;
        properties: Record<string, any>;
      }>;
    };
  };
}

export interface DynamicResourceMapping {
  [resource: string]: {
    operations: {
      [operation: string]: {
        properties: DynamicProperty[];
        endpoint?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      };
    };
  };
}

export class DynamicPropertiesService {
  private resourceMappings = new Map<string, DynamicResourceMapping>();

  constructor() {
    this.initializeDefaultMappings();
  }

  private initializeDefaultMappings() {
    // Gmail Integration Dynamic Properties
    this.resourceMappings.set('gmail', {
      email: {
        operations: {
          send: {
            properties: [
              {
                name: 'to',
                displayName: 'To',
                type: 'string',
                required: true,
                description: 'Recipients email addresses (comma separated)',
                placeholder: 'user@example.com, another@example.com'
              },
              {
                name: 'subject',
                displayName: 'Subject',
                type: 'string',
                required: true,
                placeholder: 'Email subject'
              },
              {
                name: 'message',
                displayName: 'Message',
                type: 'string',
                required: true,
                placeholder: 'Email content (HTML supported)'
              },
              {
                name: 'attachments',
                displayName: 'Attachments',
                type: 'json',
                description: 'Array of attachment objects with name and data',
                placeholder: '[{"name": "file.pdf", "data": "base64data"}]'
              },
              {
                name: 'cc',
                displayName: 'CC',
                type: 'string',
                placeholder: 'CC recipients (comma separated)'
              },
              {
                name: 'bcc',
                displayName: 'BCC',
                type: 'string',
                placeholder: 'BCC recipients (comma separated)'
              }
            ]
          },
          search: {
            properties: [
              {
                name: 'query',
                displayName: 'Search Query',
                type: 'string',
                required: true,
                description: 'Gmail search syntax supported',
                placeholder: 'from:sender@example.com has:attachment'
              },
              {
                name: 'maxResults',
                displayName: 'Max Results',
                type: 'number',
                default: 10,
                placeholder: '10'
              },
              {
                name: 'format',
                displayName: 'Format',
                type: 'dropdown',
                options: [
                  { name: 'Minimal', value: 'minimal' },
                  { name: 'Full', value: 'full' },
                  { name: 'Raw', value: 'raw' },
                  { name: 'Metadata', value: 'metadata' }
                ],
                default: 'minimal'
              }
            ]
          }
        }
      }
    });

    // Slack Integration Dynamic Properties
    this.resourceMappings.set('slack', {
      message: {
        operations: {
          send: {
            properties: [
              {
                name: 'channel',
                displayName: 'Channel',
                type: 'dropdown',
                required: true,
                description: 'Select the channel to send message to',
                // Dynamic options loaded from Slack API
                routing: {
                  request: {
                    property: 'channels.list',
                    value: ''
                  }
                }
              },
              {
                name: 'text',
                displayName: 'Message Text',
                type: 'string',
                required: true,
                placeholder: 'Your message content'
              },
              {
                name: 'blocks',
                displayName: 'Blocks',
                type: 'json',
                description: 'Rich message blocks (JSON format)',
                displayOptions: {
                  show: {
                    messageType: ['blocks']
                  }
                }
              },
              {
                name: 'messageType',
                displayName: 'Message Type',
                type: 'dropdown',
                options: [
                  { name: 'Simple Text', value: 'text' },
                  { name: 'Rich Blocks', value: 'blocks' }
                ],
                default: 'text'
              }
            ]
          }
        }
      }
    });

    // OpenAI Integration Dynamic Properties
    this.resourceMappings.set('openai', {
      completion: {
        operations: {
          create: {
            properties: [
              {
                name: 'model',
                displayName: 'Model',
                type: 'dropdown',
                required: true,
                options: [
                  { name: 'GPT-4o', value: 'gpt-4o', description: 'Most capable model' },
                  { name: 'GPT-4o Mini', value: 'gpt-4o-mini', description: 'Fast and efficient' },
                  { name: 'GPT-4 Turbo', value: 'gpt-4-turbo', description: 'Previous generation' }
                ],
                default: 'gpt-4o-mini'
              },
              {
                name: 'prompt',
                displayName: 'Prompt',
                type: 'string',
                required: true,
                placeholder: 'Enter your prompt or question'
              },
              {
                name: 'temperature',
                displayName: 'Temperature',
                type: 'number',
                description: 'Controls randomness (0.0 to 2.0)',
                default: 0.7,
                placeholder: '0.7'
              },
              {
                name: 'maxTokens',
                displayName: 'Max Tokens',
                type: 'number',
                description: 'Maximum number of tokens to generate',
                default: 1000,
                placeholder: '1000'
              },
              {
                name: 'systemMessage',
                displayName: 'System Message',
                type: 'string',
                description: 'Sets the behavior/role of the assistant',
                placeholder: 'You are a helpful assistant...'
              }
            ]
          }
        }
      }
    });

    // Salesforce Dynamic Properties
    this.resourceMappings.set('salesforce', {
      lead: {
        operations: {
          create: {
            properties: [
              {
                name: 'firstName',
                displayName: 'First Name',
                type: 'string',
                placeholder: 'John'
              },
              {
                name: 'lastName',
                displayName: 'Last Name',
                type: 'string',
                required: true,
                placeholder: 'Doe'
              },
              {
                name: 'email',
                displayName: 'Email',
                type: 'string',
                required: true,
                placeholder: 'john.doe@example.com'
              },
              {
                name: 'company',
                displayName: 'Company',
                type: 'string',
                required: true,
                placeholder: 'Acme Corp'
              },
              {
                name: 'phone',
                displayName: 'Phone',
                type: 'string',
                placeholder: '+1234567890'
              },
              {
                name: 'leadSource',
                displayName: 'Lead Source',
                type: 'dropdown',
                options: [
                  { name: 'Web', value: 'Web' },
                  { name: 'Phone Inquiry', value: 'Phone Inquiry' },
                  { name: 'Partner Referral', value: 'Partner Referral' },
                  { name: 'Purchased List', value: 'Purchased List' },
                  { name: 'Other', value: 'Other' }
                ]
              }
            ]
          },
          update: {
            properties: [
              {
                name: 'leadId',
                displayName: 'Lead ID',
                type: 'string',
                required: true,
                description: 'Salesforce Lead ID to update',
                placeholder: '00Q000000000000AAA'
              },
              {
                name: 'status',
                displayName: 'Status',
                type: 'dropdown',
                options: [
                  { name: 'Open - Not Contacted', value: 'Open - Not Contacted' },
                  { name: 'Working - Contacted', value: 'Working - Contacted' },
                  { name: 'Closed - Converted', value: 'Closed - Converted' },
                  { name: 'Closed - Not Converted', value: 'Closed - Not Converted' }
                ]
              }
            ]
          }
        }
      }
    });
  }

  getDynamicProperties(integrationId: string, resource?: string, operation?: string): DynamicProperty[] {
    const mapping = this.resourceMappings.get(integrationId);
    if (!mapping) return [];

    if (resource && operation && mapping[resource]?.operations[operation]) {
      return mapping[resource].operations[operation].properties;
    }

    // Return all properties for the integration if no specific resource/operation
    const allProperties: DynamicProperty[] = [];
    Object.values(mapping).forEach(resourceDef => {
      Object.values(resourceDef.operations).forEach(operation => {
        allProperties.push(...operation.properties);
      });
    });

    return allProperties;
  }

  getResourceOperations(integrationId: string): { resource: string; operations: string[] }[] {
    const mapping = this.resourceMappings.get(integrationId);
    if (!mapping) return [];

    return Object.entries(mapping).map(([resource, resourceDef]) => ({
      resource,
      operations: Object.keys(resourceDef.operations)
    }));
  }

  convertToIntegrationFields(properties: DynamicProperty[]): IntegrationField[] {
    return properties.map(prop => ({
      name: prop.name,
      label: prop.displayName,
      type: this.mapPropertyTypeToFieldType(prop.type),
      required: prop.required || false,
      placeholder: prop.placeholder,
      helpText: prop.description,
      options: prop.options?.map(opt => ({ label: opt.name, value: opt.value })),
      defaultValue: prop.default
    }));
  }

  private mapPropertyTypeToFieldType(type: string): IntegrationField['type'] {
    switch (type) {
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'dropdown':
      case 'multiselect': return 'select';
      case 'json': return 'textarea';
      default: return 'text';
    }
  }

  enhanceIntegrationWithDynamicProperties(integration: IntegrationNode): IntegrationNode {
    const resourceOps = this.getResourceOperations(integration.id);
    
    if (resourceOps.length === 0) {
      return integration;
    }

    // Add resource and operation selection fields
    const enhancedFields: IntegrationField[] = [
      {
        name: 'resource',
        label: 'Resource',
        type: 'select',
        required: true,
        options: resourceOps.map(r => ({ label: r.resource, value: r.resource })),
        helpText: 'Select the resource to work with'
      },
      {
        name: 'operation',
        label: 'Operation',
        type: 'select',
        required: true,
        options: [], // Will be populated dynamically based on resource selection
        helpText: 'Select the operation to perform'
      },
      ...integration.fields
    ];

    return {
      ...integration,
      fields: enhancedFields
    };
  }
}