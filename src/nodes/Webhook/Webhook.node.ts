import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const WebhookNode: HaloNodeDefinition = {
  displayName: 'Webhook',
  name: 'webhook',
  icon: 'webhook.svg',
  group: ['trigger'],
  version: 1,
  description: 'Receive HTTP webhooks to trigger workflows',
  defaults: {
    name: 'Webhook',
    color: '#885AF8',
  },
  inputs: [],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Webhook URL',
      name: 'webhookUrl',
      type: 'string',
      default: '',
      required: false,
      description: 'Auto-generated webhook URL (read-only)',
      placeholder: 'Will be auto-generated',
      typeOptions: {
        readOnly: true
      }
    },
    {
      displayName: 'HTTP Method',
      name: 'httpMethod',
      type: 'options',
      default: 'POST',
      required: true,
      options: [
        { name: 'POST', value: 'POST' },
        { name: 'GET', value: 'GET' },
        { name: 'PUT', value: 'PUT' },
        { name: 'PATCH', value: 'PATCH' },
        { name: 'DELETE', value: 'DELETE' }
      ]
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'options',
      default: 'none',
      required: true,
      options: [
        { name: 'None', value: 'none' },
        { name: 'Header Auth', value: 'headerAuth' },
        { name: 'Query Auth', value: 'queryAuth' }
      ]
    },
    {
      displayName: 'Auth Header Name',
      name: 'authHeaderName',
      type: 'string',
      default: 'Authorization',
      required: true,
      description: 'Header name for authentication',
      placeholder: 'Authorization',
      displayOptions: {
        show: {
          authentication: ['headerAuth']
        }
      }
    },
    {
      displayName: 'Auth Header Value',
      name: 'authHeaderValue',
      type: 'string',
      default: '',
      required: true,
      description: 'Expected header value',
      placeholder: 'Bearer your-secret-token',
      displayOptions: {
        show: {
          authentication: ['headerAuth']
        }
      }
    },
    {
      displayName: 'Auth Query Parameter',
      name: 'authQueryParam',
      type: 'string',
      default: 'token',
      required: true,
      description: 'Query parameter name for authentication',
      placeholder: 'token',
      displayOptions: {
        show: {
          authentication: ['queryAuth']
        }
      }
    },
    {
      displayName: 'Auth Query Value',
      name: 'authQueryValue',
      type: 'string',
      default: '',
      required: true,
      description: 'Expected query parameter value',
      placeholder: 'your-secret-token',
      displayOptions: {
        show: {
          authentication: ['queryAuth']
        }
      }
    },
    {
      displayName: 'Response Mode',
      name: 'responseMode',
      type: 'options',
      default: 'responseNode',
      required: true,
      options: [
        { name: 'Response Node', value: 'responseNode' },
        { name: 'No Response Body', value: 'noData' },
        { name: 'Last Node', value: 'lastNode' }
      ],
      description: 'What data should be returned as webhook response'
    }
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    // In a real implementation, this would be handled by the webhook infrastructure
    // For demo purposes, we'll return mock webhook data
    const httpMethod = context.getNodeParameter('httpMethod', 0) as string;
    const authentication = context.getNodeParameter('authentication', 0) as string;
    
    // Generate a mock webhook URL
    const webhookId = `wh_${Math.random().toString(36).substr(2, 9)}`;
    const webhookUrl = `https://hooks.halo.dev/${webhookId}`;
    
    const result = {
      webhookId,
      webhookUrl,
      httpMethod,
      authentication,
      timestamp: new Date().toISOString(),
      // Mock webhook payload - in reality this would come from the HTTP request
      headers: {
        'content-type': 'application/json',
        'user-agent': 'webhook-sender/1.0',
        'x-webhook-signature': 'sha256=example'
      },
      body: {
        event: 'webhook.triggered',
        data: {
          id: 'event_123',
          timestamp: new Date().toISOString(),
          payload: 'Sample webhook payload'
        }
      },
      query: {},
      method: httpMethod
    };

    console.log('Webhook would be configured with:', result);

    return [[{ json: result }]];
  }
};