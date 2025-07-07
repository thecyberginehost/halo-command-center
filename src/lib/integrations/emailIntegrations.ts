import { IntegrationNode } from '@/types/integrations';

export const gmailIntegration: IntegrationNode = {
  id: 'gmail',
  name: 'Gmail',
  description: 'Send and receive emails using Gmail',
  category: 'communication',
  icon: 'Mail',
  color: 'bg-red-500',
  type: 'action',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {
    to: {
      type: 'email',
      label: 'To',
      placeholder: 'recipient@example.com',
      required: true
    },
    subject: {
      type: 'text',
      label: 'Subject',
      placeholder: 'Email subject',
      required: true
    },
    body: {
      type: 'textarea',
      label: 'Body',
      placeholder: 'Email content',
      required: true
    },
    cc: {
      type: 'text',
      label: 'CC',
      placeholder: 'cc@example.com',
      required: false
    },
    bcc: {
      type: 'text',
      label: 'BCC',
      placeholder: 'bcc@example.com',
      required: false
    }
  },
  endpoints: [
    {
      id: 'send',
      name: 'Send Email',
      description: 'Send an email via Gmail',
      method: 'POST',
      path: '/gmail/send',
      parameters: {
        to: {
          type: 'email',
          label: 'To',
          required: true
        },
        subject: {
          type: 'text',
          label: 'Subject',
          required: true
        },
        body: {
          type: 'textarea',
          label: 'Body',
          required: true
        }
      }
    }
  ]
};

export const sesIntegration: IntegrationNode = {
  id: 'aws-ses',
  name: 'Amazon SES',
  description: 'Send emails using Amazon Simple Email Service',
  category: 'communication',
  icon: 'Mail',
  color: 'bg-orange-500',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {
    accessKeyId: {
      type: 'text',
      label: 'AWS Access Key ID',
      required: true
    },
    secretAccessKey: {
      type: 'password',
      label: 'AWS Secret Access Key',
      required: true
    },
    region: {
      type: 'select',
      label: 'AWS Region',
      required: true,
      options: [
        { label: 'US East (N. Virginia)', value: 'us-east-1' },
        { label: 'US West (Oregon)', value: 'us-west-2' },
        { label: 'Europe (Ireland)', value: 'eu-west-1' }
      ]
    },
    to: {
      type: 'email',
      label: 'To',
      placeholder: 'recipient@example.com',
      required: true
    },
    subject: {
      type: 'text',
      label: 'Subject',
      placeholder: 'Email subject',
      required: true
    },
    body: {
      type: 'textarea',
      label: 'Body',
      placeholder: 'Email content',
      required: true
    }
  },
  endpoints: [
    {
      id: 'send',
      name: 'Send Email',
      description: 'Send an email via Amazon SES',
      method: 'POST',
      path: '/ses/send',
      parameters: {
        to: {
          type: 'email',
          label: 'To',
          required: true
        },
        subject: {
          type: 'text',
          label: 'Subject',
          required: true
        },
        body: {
          type: 'textarea',
          label: 'Body',
          required: true
        }
      }
    }
  ]
};

export const sendgridIntegration: IntegrationNode = {
  id: 'sendgrid',
  name: 'SendGrid',
  description: 'Send emails using SendGrid',
  category: 'communication',
  icon: 'Mail',
  color: 'bg-blue-500',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {
    apiKey: {
      type: 'password',
      label: 'SendGrid API Key',
      required: true
    },
    from: {
      type: 'email',
      label: 'From Email',
      placeholder: 'sender@example.com',
      required: true
    },
    to: {
      type: 'email',
      label: 'To',
      placeholder: 'recipient@example.com',
      required: true
    },
    subject: {
      type: 'text',
      label: 'Subject',
      placeholder: 'Email subject',
      required: true
    },
    body: {
      type: 'textarea',
      label: 'Body',
      placeholder: 'Email content',
      required: true
    }
  },
  endpoints: [
    {
      id: 'send',
      name: 'Send Email',
      description: 'Send an email via SendGrid',
      method: 'POST',
      path: '/sendgrid/send',
      parameters: {
        to: {
          type: 'email',
          label: 'To',
          required: true
        },
        subject: {
          type: 'text',
          label: 'Subject',
          required: true
        },
        body: {
          type: 'textarea',
          label: 'Body',
          required: true
        }
      }
    }
  ]
};