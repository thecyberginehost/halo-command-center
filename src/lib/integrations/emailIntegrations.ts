import { IntegrationNode } from '@/types/integrations';
import { Mail } from 'lucide-react';

export const gmailIntegration: IntegrationNode = {
  id: 'gmail',
  name: 'Gmail',
  description: 'Send and receive emails using Gmail',
  category: 'communication',
  icon: Mail,
  color: '#EA4335',
  type: 'action',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {},
  fields: [
    {
      name: 'to',
      label: 'To',
      type: 'text',
      required: true,
      placeholder: 'recipient@example.com'
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      required: true,
      placeholder: 'Email subject'
    },
    {
      name: 'body',
      label: 'Body',
      type: 'textarea',
      required: true,
      placeholder: 'Email content'
    },
    {
      name: 'cc',
      label: 'CC',
      type: 'text',
      required: false,
      placeholder: 'cc@example.com'
    },
    {
      name: 'bcc',
      label: 'BCC',
      type: 'text',
      required: false,
      placeholder: 'bcc@example.com'
    }
  ],
  endpoints: [
    {
      id: 'send',
      name: 'Send Email',
      description: 'Send an email via Gmail',
      method: 'POST',
      path: '/gmail/send',
      parameters: {}
    }
  ]
};

export const sesIntegration: IntegrationNode = {
  id: 'aws-ses',
  name: 'Amazon SES',
  description: 'Send emails using Amazon Simple Email Service',
  category: 'communication',
  icon: Mail,
  color: '#FF9900',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  fields: [
    {
      name: 'region',
      label: 'AWS Region',
      type: 'select',
      required: true,
      options: [
        { label: 'US East (N. Virginia)', value: 'us-east-1' },
        { label: 'US West (Oregon)', value: 'us-west-2' },
        { label: 'Europe (Ireland)', value: 'eu-west-1' }
      ]
    },
    {
      name: 'to',
      label: 'To',
      type: 'text',
      required: true,
      placeholder: 'recipient@example.com'
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      required: true,
      placeholder: 'Email subject'
    },
    {
      name: 'body',
      label: 'Body',
      type: 'textarea',
      required: true,
      placeholder: 'Email content'
    }
  ],
  endpoints: [
    {
      id: 'send',
      name: 'Send Email',
      description: 'Send an email via Amazon SES',
      method: 'POST',
      path: '/ses/send',
      parameters: {}
    }
  ]
};

export const sendgridIntegration: IntegrationNode = {
  id: 'sendgrid',
  name: 'SendGrid',
  description: 'Send emails using SendGrid',
  category: 'communication',
  icon: Mail,
  color: '#1A73E8',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  fields: [
    {
      name: 'from',
      label: 'From Email',
      type: 'text',
      required: true,
      placeholder: 'sender@example.com'
    },
    {
      name: 'to',
      label: 'To',
      type: 'text',
      required: true,
      placeholder: 'recipient@example.com'
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      required: true,
      placeholder: 'Email subject'
    },
    {
      name: 'body',
      label: 'Body',
      type: 'textarea',
      required: true,
      placeholder: 'Email content'
    }
  ],
  endpoints: [
    {
      id: 'send',
      name: 'Send Email',
      description: 'Send an email via SendGrid',
      method: 'POST',
      path: '/sendgrid/send',
      parameters: {}
    }
  ]
};