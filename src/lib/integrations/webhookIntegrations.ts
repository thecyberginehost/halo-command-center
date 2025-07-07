import { IntegrationNode } from '@/types/integrations';

export const webhookTrigger: IntegrationNode = {
  id: 'webhook-trigger',
  name: 'Webhook Trigger',
  description: 'Trigger workflow when webhook receives data',
  category: 'webhook',
  icon: 'Zap',
  color: 'bg-purple-500',
  type: 'trigger',
  requiresAuth: false,
  configSchema: {
    path: {
      type: 'text',
      label: 'Webhook Path',
      placeholder: '/webhook/my-automation',
      required: true,
      validation: {
        pattern: '^/[a-zA-Z0-9-_/]+$'
      }
    },
    method: {
      type: 'select',
      label: 'HTTP Method',
      required: true,
      options: [
        { label: 'POST', value: 'POST' },
        { label: 'GET', value: 'GET' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' }
      ]
    },
    secretKey: {
      type: 'password',
      label: 'Secret Key (Optional)',
      placeholder: 'For webhook validation',
      required: false
    }
  },
  endpoints: [
    {
      id: 'receive',
      name: 'Receive Webhook',
      description: 'Receive and process webhook data',
      method: 'POST',
      path: '/webhook/receive',
      parameters: {}
    }
  ]
};

export const httpRequestAction: IntegrationNode = {
  id: 'http-request',
  name: 'HTTP Request',
  description: 'Make HTTP requests to any API',
  category: 'webhook',
  icon: 'Globe',
  color: 'bg-gray-600',
  type: 'action',
  requiresAuth: false,
  configSchema: {
    url: {
      type: 'text',
      label: 'URL',
      placeholder: 'https://api.example.com/endpoint',
      required: true,
      validation: {
        pattern: '^https?://.+'
      }
    },
    method: {
      type: 'select',
      label: 'HTTP Method',
      required: true,
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' }
      ]
    },
    headers: {
      type: 'textarea',
      label: 'Headers (JSON)',
      placeholder: '{"Authorization": "Bearer token", "Content-Type": "application/json"}',
      required: false
    },
    body: {
      type: 'textarea',
      label: 'Request Body (JSON)',
      placeholder: '{"key": "value"}',
      required: false
    }
  },
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Request',
      description: 'Execute the HTTP request',
      method: 'POST',
      path: '/http/request',
      parameters: {
        url: {
          type: 'text',
          label: 'URL',
          required: true
        },
        method: {
          type: 'select',
          label: 'Method',
          required: true,
          options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' }
          ]
        }
      }
    }
  ]
};

export const slackIntegration: IntegrationNode = {
  id: 'slack',
  name: 'Slack',
  description: 'Send messages to Slack channels',
  category: 'communication',
  icon: 'MessageSquare',
  color: 'bg-purple-600',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {
    webhookUrl: {
      type: 'text',
      label: 'Slack Webhook URL',
      placeholder: 'https://hooks.slack.com/services/...',
      required: true,
      validation: {
        pattern: '^https://hooks\\.slack\\.com/services/.+'
      }
    },
    channel: {
      type: 'text',
      label: 'Channel',
      placeholder: '#general',
      required: false
    },
    message: {
      type: 'textarea',
      label: 'Message',
      placeholder: 'Your message here',
      required: true
    },
    username: {
      type: 'text',
      label: 'Bot Username',
      placeholder: 'Automation Bot',
      required: false
    }
  },
  endpoints: [
    {
      id: 'send-message',
      name: 'Send Message',
      description: 'Send a message to Slack channel',
      method: 'POST',
      path: '/slack/message',
      parameters: {
        message: {
          type: 'textarea',
          label: 'Message',
          required: true
        },
        channel: {
          type: 'text',
          label: 'Channel',
          required: false
        }
      }
    }
  ]
};