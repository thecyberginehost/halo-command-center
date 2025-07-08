import { IntegrationNode } from '@/types/integrations';
import { FileSpreadsheet, Calendar, Book, Grid } from 'lucide-react';

export const googleSheetsIntegration: IntegrationNode = {
  id: 'google_sheets',
  name: 'Google Sheets',
  description: 'Manage Google Sheets spreadsheets',
  category: 'productivity',
  icon: FileSpreadsheet,
  color: '#0F9D58',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  configSchema: {
    client_id: {
      type: 'text',
      label: 'Client ID',
      required: true
    },
    client_secret: {
      type: 'password',
      label: 'Client Secret',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Read Range', value: 'read' },
        { label: 'Write Range', value: 'write' },
        { label: 'Append Row', value: 'append' },
        { label: 'Create Sheet', value: 'create' },
        { label: 'Clear Range', value: 'clear' },
        { label: 'Update Cell', value: 'update_cell' }
      ]
    },
    {
      name: 'spreadsheet_id',
      label: 'Spreadsheet ID',
      type: 'text',
      required: true,
      placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
    },
    {
      name: 'range',
      label: 'Range',
      type: 'text',
      required: true,
      placeholder: 'Sheet1!A1:C10',
      helpText: 'Cell range in A1 notation'
    },
    {
      name: 'values',
      label: 'Values',
      type: 'textarea',
      required: false,
      placeholder: '[["Name", "Email"], ["John", "john@example.com"]]',
      helpText: 'JSON array of row data'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Sheets Operation',
      description: 'Execute Google Sheets operation',
      method: 'POST',
      path: '/googlesheets/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        spreadsheet_id: {
          type: 'text',
          label: 'Spreadsheet ID',
          required: true
        },
        range: {
          type: 'text',
          label: 'Range',
          required: true
        }
      }
    }
  ]
};

export const googleCalendarIntegration: IntegrationNode = {
  id: 'google_calendar',
  name: 'Google Calendar',
  description: 'Manage Google Calendar events',
  category: 'productivity',
  icon: Calendar,
  color: '#4285F4',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  configSchema: {
    client_id: {
      type: 'text',
      label: 'Client ID',
      required: true
    },
    client_secret: {
      type: 'password',
      label: 'Client Secret',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Calendar Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Create Event', value: 'create' },
        { label: 'Update Event', value: 'update' },
        { label: 'Delete Event', value: 'delete' },
        { label: 'List Events', value: 'list' },
        { label: 'Get Event', value: 'get' }
      ]
    },
    {
      name: 'calendar_id',
      label: 'Calendar ID',
      type: 'text',
      required: false,
      defaultValue: 'primary',
      placeholder: 'primary'
    },
    {
      name: 'event_title',
      label: 'Event Title',
      type: 'text',
      required: false,
      placeholder: 'Team Meeting'
    },
    {
      name: 'start_datetime',
      label: 'Start Date/Time',
      type: 'text',
      required: false,
      placeholder: '2024-01-01T10:00:00Z'
    },
    {
      name: 'end_datetime',
      label: 'End Date/Time',
      type: 'text',
      required: false,
      placeholder: '2024-01-01T11:00:00Z'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Meeting agenda and details'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Calendar Operation',
      description: 'Execute Google Calendar operation',
      method: 'POST',
      path: '/googlecalendar/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        calendar_id: {
          type: 'text',
          label: 'Calendar ID',
          required: false
        }
      }
    }
  ]
};

export const notionIntegration: IntegrationNode = {
  id: 'notion',
  name: 'Notion',
  description: 'Manage Notion pages and databases',
  category: 'productivity',
  icon: Book,
  color: '#000000',
  requiresAuth: true,
  authType: 'bearer',
  type: 'action',
  configSchema: {
    api_token: {
      type: 'password',
      label: 'API Token',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Notion Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Create Page', value: 'create_page' },
        { label: 'Update Page', value: 'update_page' },
        { label: 'Query Database', value: 'query_database' },
        { label: 'Create Database Item', value: 'create_item' },
        { label: 'Update Database Item', value: 'update_item' }
      ]
    },
    {
      name: 'database_id',
      label: 'Database ID',
      type: 'text',
      required: false,
      placeholder: '32facebc-c4fc-4ef8-bb88-ae31a5b3b2e4'
    },
    {
      name: 'page_id',
      label: 'Page ID',
      type: 'text',
      required: false,
      placeholder: '32facebc-c4fc-4ef8-bb88-ae31a5b3b2e4'
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: false,
      placeholder: 'My New Page'
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      required: false,
      placeholder: 'Page content in JSON format'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Notion Operation',
      description: 'Execute Notion operation',
      method: 'POST',
      path: '/notion/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        database_id: {
          type: 'text',
          label: 'Database ID',
          required: false
        }
      }
    }
  ]
};

export const airtableIntegration: IntegrationNode = {
  id: 'airtable',
  name: 'Airtable',
  description: 'Manage Airtable bases and records',
  category: 'productivity',
  icon: Grid,
  color: '#18BFFF',
  requiresAuth: true,
  authType: 'bearer',
  type: 'action',
  configSchema: {
    api_key: {
      type: 'password',
      label: 'API Key',
      required: true
    },
    base_id: {
      type: 'text',
      label: 'Base ID',
      required: true
    }
  },
  fields: [
    {
      name: 'operation',
      label: 'Airtable Operation',
      type: 'select',
      required: true,
      options: [
        { label: 'List Records', value: 'list' },
        { label: 'Create Record', value: 'create' },
        { label: 'Update Record', value: 'update' },
        { label: 'Delete Record', value: 'delete' },
        { label: 'Get Record', value: 'get' }
      ]
    },
    {
      name: 'table_name',
      label: 'Table Name',
      type: 'text',
      required: true,
      placeholder: 'Tasks'
    },
    {
      name: 'record_id',
      label: 'Record ID',
      type: 'text',
      required: false,
      placeholder: 'recXXXXXXXXXXXXXX'
    },
    {
      name: 'fields',
      label: 'Fields',
      type: 'textarea',
      required: false,
      placeholder: '{"Name": "Task 1", "Status": "In Progress"}',
      helpText: 'JSON object with field values'
    },
    {
      name: 'filter_formula',
      label: 'Filter Formula',
      type: 'text',
      required: false,
      placeholder: '{Status} = "In Progress"',
      helpText: 'Airtable formula for filtering records'
    }
  ],
  endpoints: [
    {
      id: 'execute',
      name: 'Execute Airtable Operation',
      description: 'Execute Airtable operation',
      method: 'POST',
      path: '/airtable/execute',
      parameters: {
        operation: {
          type: 'text',
          label: 'Operation',
          required: true
        },
        table: {
          type: 'text',
          label: 'Table Name',
          required: true
        }
      }
    }
  ]
};