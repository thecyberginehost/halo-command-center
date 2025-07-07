import { IntegrationNode } from '@/types/integrations';
import { Zap, Globe, MessageSquare } from 'lucide-react';

export const webhookTrigger: IntegrationNode = {
  id: 'webhook-trigger',
  name: 'Webhook Trigger',
  description: 'Trigger workflow when webhook receives data',
  category: 'webhook',
  icon: Zap,
  color: '#9C27B0',
  type: 'trigger',
  requiresAuth: false,
  configSchema: {},
  fields: [
    {
      name: 'path',
      label: 'Webhook Path',
      type: 'text',
      required: true,
      placeholder: '/webhook/my-automation',
      helpText: 'The URL path where your webhook will be accessible'
    },
    {
      name: 'method',
      label: 'HTTP Method',
      type: 'select',
      required: true,
      options: [
        { label: 'POST', value: 'POST' },
        { label: 'GET', value: 'GET' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' }
      ]
    },
    {
      name: 'secretKey',
      label: 'Secret Key (Optional)',
      type: 'password',
      required: false,
      placeholder: 'For webhook validation'
    }
  ],
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
  icon: Globe,
  color: '#607D8B',
  type: 'action',
  requiresAuth: false,
  configSchema: {},
  fields: [
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      placeholder: 'https://api.example.com/endpoint'
    },
    {
      name: 'method',
      label: 'HTTP Method',
      type: 'select',
      required: true,
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' }
      ]
    },
    {
      name: 'headers',
      label: 'Headers (JSON)',
      type: 'textarea',
      required: false,
      placeholder: '{"Authorization": "Bearer token", "Content-Type": "application/json"}'
    },
    {
      name: 'body',
      label: 'Request Body (JSON)',
      type: 'textarea',
      required: false,
      placeholder: '{"key": "value"}'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Request',
      description: 'Execute the HTTP request',
      method: 'POST',
      path: '/http/request',
      parameters: {}
    }
  ]
};

export const slackIntegration: IntegrationNode = {
  id: 'slack',
  name: 'Slack',
  description: 'Send messages to Slack channels',
  category: 'communication',
  icon: MessageSquare,
  color: '#4A154B',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  fields: [
    {
      name: 'webhookUrl',
      label: 'Slack Webhook URL',
      type: 'text',
      required: true,
      placeholder: 'https://hooks.slack.com/services/...'
    },
    {
      name: 'channel',
      label: 'Channel',
      type: 'text',
      required: false,
      placeholder: '#general'
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      placeholder: 'Your message here'
    },
    {
      name: 'username',
      label: 'Bot Username',
      type: 'text',
      required: false,
      placeholder: 'Automation Bot'
    }
  ],
  endpoints: [
    {
      id: 'send-message',
      name: 'Send Message',
      description: 'Send a message to Slack channel',
      method: 'POST',
      path: '/slack/message',
      parameters: {}
    }
  ]
};