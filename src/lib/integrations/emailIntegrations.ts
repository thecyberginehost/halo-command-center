import { IntegrationService, IntegrationNode } from '@/types/integrations';
import { Mail, MailSearch, Trash2, Archive, Reply, Forward } from 'lucide-react';

export const gmailService: IntegrationService = {
  id: 'gmail',
  name: 'Gmail',
  description: 'Google email service integration',
  category: 'communication',
  icon: Mail,
  color: '#EA4335',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {},
  actions: [
    {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send an email via Gmail',
      type: 'action',
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
      endpoint: {
        id: 'send',
        name: 'Send Email',
        description: 'Send an email via Gmail',
        method: 'POST',
        path: '/gmail/send',
        parameters: {}
      }
    },
    {
      id: 'search_emails',
      name: 'Search Emails',
      description: 'Search for emails in Gmail',
      type: 'action',
      fields: [
        {
          name: 'query',
          label: 'Search Query',
          type: 'text',
          required: true,
          placeholder: 'from:example@gmail.com subject:important'
        },
        {
          name: 'maxResults',
          label: 'Max Results',
          type: 'number',
          required: false,
          defaultValue: 10
        }
      ],
      endpoint: {
        id: 'search',
        name: 'Search Emails',
        description: 'Search emails in Gmail',
        method: 'GET',
        path: '/gmail/search',
        parameters: {}
      }
    },
    {
      id: 'delete_email',
      name: 'Delete Email',
      description: 'Delete an email from Gmail',
      type: 'action',
      fields: [
        {
          name: 'messageId',
          label: 'Message ID',
          type: 'text',
          required: true,
          placeholder: '1234567890abcdef'
        }
      ],
      endpoint: {
        id: 'delete',
        name: 'Delete Email',
        description: 'Delete an email from Gmail',
        method: 'DELETE',
        path: '/gmail/delete',
        parameters: {}
      }
    },
    {
      id: 'archive_email',
      name: 'Archive Email',
      description: 'Archive an email in Gmail',
      type: 'action',
      fields: [
        {
          name: 'messageId',
          label: 'Message ID',
          type: 'text',
          required: true,
          placeholder: '1234567890abcdef'
        }
      ],
      endpoint: {
        id: 'archive',
        name: 'Archive Email',
        description: 'Archive an email in Gmail',
        method: 'POST',
        path: '/gmail/archive',
        parameters: {}
      }
    },
    {
      id: 'reply_email',
      name: 'Reply to Email',
      description: 'Reply to an email in Gmail',
      type: 'action',
      fields: [
        {
          name: 'messageId',
          label: 'Message ID',
          type: 'text',
          required: true,
          placeholder: '1234567890abcdef'
        },
        {
          name: 'body',
          label: 'Reply Body',
          type: 'textarea',
          required: true,
          placeholder: 'Your reply message'
        }
      ],
      endpoint: {
        id: 'reply',
        name: 'Reply to Email',
        description: 'Reply to an email in Gmail',
        method: 'POST',
        path: '/gmail/reply',
        parameters: {}
      }
    },
    {
      id: 'new_email_trigger',
      name: 'New Email Received',
      description: 'Triggers when a new email is received',
      type: 'trigger',
      fields: [
        {
          name: 'label',
          label: 'Label Filter',
          type: 'text',
          required: false,
          placeholder: 'INBOX, IMPORTANT'
        },
        {
          name: 'from',
          label: 'From Filter',
          type: 'text',
          required: false,
          placeholder: 'sender@example.com'
        }
      ],
      endpoint: {
        id: 'new_email_trigger',
        name: 'New Email Trigger',
        description: 'Webhook for new emails',
        method: 'POST',
        path: '/gmail/webhook',
        parameters: {}
      }
    }
  ]
};

// Generate individual IntegrationNode objects for each action
export const gmailSendEmail: IntegrationNode = {
  ...gmailService,
  id: 'gmail-send-email',
  name: 'Gmail - Send Email',
  type: 'action',
  serviceId: 'gmail',
  actionId: 'send_email',
  fields: gmailService.actions[0].fields,
  endpoints: [gmailService.actions[0].endpoint]
};

export const gmailSearchEmails: IntegrationNode = {
  ...gmailService,
  id: 'gmail-search-emails',
  name: 'Gmail - Search Emails',
  type: 'action',
  serviceId: 'gmail',
  actionId: 'search_emails',
  icon: MailSearch,
  fields: gmailService.actions[1].fields,
  endpoints: [gmailService.actions[1].endpoint]
};

export const gmailDeleteEmail: IntegrationNode = {
  ...gmailService,
  id: 'gmail-delete-email',
  name: 'Gmail - Delete Email',
  type: 'action',
  serviceId: 'gmail',
  actionId: 'delete_email',
  icon: Trash2,
  fields: gmailService.actions[2].fields,
  endpoints: [gmailService.actions[2].endpoint]
};

export const gmailArchiveEmail: IntegrationNode = {
  ...gmailService,
  id: 'gmail-archive-email',
  name: 'Gmail - Archive Email',
  type: 'action',
  serviceId: 'gmail',
  actionId: 'archive_email',
  icon: Archive,
  fields: gmailService.actions[3].fields,
  endpoints: [gmailService.actions[3].endpoint]
};

export const gmailReplyEmail: IntegrationNode = {
  ...gmailService,
  id: 'gmail-reply-email',
  name: 'Gmail - Reply to Email',
  type: 'action',
  serviceId: 'gmail',
  actionId: 'reply_email',
  icon: Reply,
  fields: gmailService.actions[4].fields,
  endpoints: [gmailService.actions[4].endpoint]
};

export const gmailNewEmailTrigger: IntegrationNode = {
  ...gmailService,
  id: 'gmail-new-email-trigger',
  name: 'Gmail - New Email Received',
  type: 'trigger',
  serviceId: 'gmail',
  actionId: 'new_email_trigger',
  fields: gmailService.actions[5].fields,
  endpoints: [gmailService.actions[5].endpoint]
};

// Keep the old integration for backward compatibility
export const gmailIntegration: IntegrationNode = gmailSendEmail;

export const sesIntegration: IntegrationNode = {
  id: 'aws-ses-send-email',
  name: 'Amazon SES - Send Email',
  description: 'Send emails using Amazon Simple Email Service',
  category: 'communication',
  icon: Mail,
  color: '#FF9900',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  serviceId: 'aws-ses',
  actionId: 'send_email',
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
  id: 'sendgrid-send-email',
  name: 'SendGrid - Send Email',
  description: 'Send emails using SendGrid',
  category: 'communication',
  icon: Mail,
  color: '#1A73E8',
  type: 'action',
  requiresAuth: true,
  authType: 'api_key',
  configSchema: {},
  serviceId: 'sendgrid',
  actionId: 'send_email',
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