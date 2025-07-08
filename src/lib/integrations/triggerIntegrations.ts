import { IntegrationNode } from '@/types/integrations';
import { Clock, Mail, FileUp, FormInput, Calendar } from 'lucide-react';

export const scheduleTrigger: IntegrationNode = {
  id: 'schedule_trigger',
  name: 'Schedule Trigger',
  description: 'Trigger workflow on a schedule (cron)',
  category: 'triggers',
  icon: Clock,
  color: '#10B981',
  requiresAuth: false,
  type: 'trigger',
  configSchema: {
    schedule_type: {
      type: 'select',
      label: 'Schedule Type',
      required: true,
      options: [
        { label: 'Every minute', value: '* * * * *' },
        { label: 'Every hour', value: '0 * * * *' },
        { label: 'Daily at midnight', value: '0 0 * * *' },
        { label: 'Weekly (Sundays)', value: '0 0 * * 0' },
        { label: 'Monthly (1st)', value: '0 0 1 * *' },
        { label: 'Custom cron', value: 'custom' }
      ]
    },
    cron_expression: {
      type: 'text',
      label: 'Cron Expression',
      placeholder: '0 9 * * 1-5',
      required: false
    },
    timezone: {
      type: 'select',
      label: 'Timezone',
      required: true,
      options: [
        { label: 'UTC', value: 'UTC' },
        { label: 'America/New_York', value: 'America/New_York' },
        { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
        { label: 'Europe/London', value: 'Europe/London' },
        { label: 'Asia/Tokyo', value: 'Asia/Tokyo' }
      ]
    }
  },
  fields: [
    {
      name: 'schedule_type',
      label: 'Schedule Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Every minute', value: '* * * * *' },
        { label: 'Every hour', value: '0 * * * *' },
        { label: 'Daily at midnight', value: '0 0 * * *' },
        { label: 'Weekly (Sundays)', value: '0 0 * * 0' },
        { label: 'Monthly (1st)', value: '0 0 1 * *' },
        { label: 'Custom cron', value: 'custom' }
      ]
    },
    {
      name: 'cron_expression',
      label: 'Custom Cron Expression',
      type: 'text',
      required: false,
      placeholder: '0 9 * * 1-5',
      helpText: 'Required when using custom schedule'
    },
    {
      name: 'timezone',
      label: 'Timezone',
      type: 'select',
      required: true,
      defaultValue: 'UTC',
      options: [
        { label: 'UTC', value: 'UTC' },
        { label: 'America/New_York', value: 'America/New_York' },
        { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
        { label: 'Europe/London', value: 'Europe/London' },
        { label: 'Asia/Tokyo', value: 'Asia/Tokyo' }
      ]
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Scheduled Task',
      description: 'Execute the scheduled workflow',
      method: 'POST',
      path: '/schedule/execute',
      parameters: {
        timestamp: {
          type: 'text',
          label: 'Execution Timestamp',
          required: true
        }
      }
    }
  ]
};

export const emailTrigger: IntegrationNode = {
  id: 'email_trigger',
  name: 'Email Trigger',
  description: 'Trigger workflow when receiving emails',
  category: 'triggers',
  icon: Mail,
  color: '#3B82F6',
  requiresAuth: true,
  authType: 'oauth',
  type: 'trigger',
  configSchema: {
    email_address: {
      type: 'email',
      label: 'Email Address to Monitor',
      required: true
    },
    filter_sender: {
      type: 'text',
      label: 'Filter by Sender',
      required: false
    },
    filter_subject: {
      type: 'text',
      label: 'Filter by Subject',
      required: false
    },
    mark_as_read: {
      type: 'boolean',
      label: 'Mark as Read',
      required: false
    }
  },
  fields: [
    {
      name: 'email_address',
      label: 'Email Address to Monitor',
      type: 'text',
      required: true,
      placeholder: 'user@example.com'
    },
    {
      name: 'filter_sender',
      label: 'Filter by Sender Email',
      type: 'text',
      required: false,
      placeholder: 'notifications@service.com',
      helpText: 'Only trigger for emails from this sender'
    },
    {
      name: 'filter_subject',
      label: 'Filter by Subject Keywords',
      type: 'text',
      required: false,
      placeholder: 'urgent, invoice',
      helpText: 'Comma-separated keywords to look for in subject'
    },
    {
      name: 'mark_as_read',
      label: 'Mark Emails as Read',
      type: 'boolean',
      required: false,
      defaultValue: false,
      helpText: 'Automatically mark triggered emails as read'
    }
  ],
  endpoints: [
    {
      id: 'monitor',
      name: 'Monitor Email',
      description: 'Monitor incoming emails',
      method: 'POST',
      path: '/email/monitor',
      parameters: {
        email_data: {
          type: 'textarea',
          label: 'Email Data',
          required: true
        }
      }
    }
  ]
};

export const formTrigger: IntegrationNode = {
  id: 'form_trigger',
  name: 'Form Submission',
  description: 'Trigger workflow on form submission',
  category: 'triggers',
  icon: FormInput,
  color: '#8B5CF6',
  requiresAuth: false,
  type: 'trigger',
  configSchema: {
    form_name: {
      type: 'text',
      label: 'Form Name',
      required: true
    },
    required_fields: {
      type: 'textarea',
      label: 'Required Fields',
      required: false
    },
    validate_email: {
      type: 'boolean',
      label: 'Validate Email Fields',
      required: false
    }
  },
  fields: [
    {
      name: 'form_name',
      label: 'Form Name/ID',
      type: 'text',
      required: true,
      placeholder: 'contact_form',
      helpText: 'Unique identifier for this form'
    },
    {
      name: 'required_fields',
      label: 'Required Fields',
      type: 'textarea',
      required: false,
      placeholder: 'name, email, message',
      helpText: 'Comma-separated list of required field names'
    },
    {
      name: 'validate_email',
      label: 'Validate Email Format',
      type: 'boolean',
      required: false,
      defaultValue: true,
      helpText: 'Automatically validate email field format'
    }
  ],
  endpoints: [
    {
      id: 'submit',
      name: 'Form Submission',
      description: 'Handle form submission data',
      method: 'POST',
      path: '/form/submit',
      parameters: {
        form_data: {
          type: 'textarea',
          label: 'Form Data',
          required: true
        }
      }
    }
  ]
};

export const fileUploadTrigger: IntegrationNode = {
  id: 'file_upload_trigger',
  name: 'File Upload',
  description: 'Trigger workflow when files are uploaded',
  category: 'triggers',
  icon: FileUp,
  color: '#F59E0B',
  requiresAuth: false,
  type: 'trigger',
  configSchema: {
    allowed_types: {
      type: 'select',
      label: 'Allowed File Types',
      required: true,
      options: [
        { label: 'Images (jpg, png, gif)', value: 'images' },
        { label: 'Documents (pdf, doc, txt)', value: 'documents' },
        { label: 'Spreadsheets (csv, xlsx)', value: 'spreadsheets' },
        { label: 'All files', value: 'all' }
      ]
    },
    max_file_size: {
      type: 'number',
      label: 'Max File Size (MB)',
      required: true
    },
    auto_process: {
      type: 'boolean',
      label: 'Auto Process Files',
      required: false
    }
  },
  fields: [
    {
      name: 'allowed_types',
      label: 'Allowed File Types',
      type: 'select',
      required: true,
      options: [
        { label: 'Images (jpg, png, gif)', value: 'images' },
        { label: 'Documents (pdf, doc, txt)', value: 'documents' },
        { label: 'Spreadsheets (csv, xlsx)', value: 'spreadsheets' },
        { label: 'All files', value: 'all' }
      ]
    },
    {
      name: 'max_file_size',
      label: 'Maximum File Size (MB)',
      type: 'number',
      required: true,
      defaultValue: 10,
      helpText: 'Maximum allowed file size in megabytes'
    },
    {
      name: 'auto_process',
      label: 'Automatically Process Files',
      type: 'boolean',
      required: false,
      defaultValue: true,
      helpText: 'Immediately process uploaded files'
    }
  ],
  endpoints: [
    {
      id: 'upload',
      name: 'File Upload',
      description: 'Handle file upload events',
      method: 'POST',
      path: '/file/upload',
      parameters: {
        file_data: {
          type: 'textarea',
          label: 'File Metadata',
          required: true
        }
      }
    }
  ]
};