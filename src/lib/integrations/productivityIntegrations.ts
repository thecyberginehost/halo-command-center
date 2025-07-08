import { IntegrationService, IntegrationNode } from '@/types/integrations';
import { FileSpreadsheet, Calendar, Book, Grid, Plus, Search, Edit, Trash2, CalendarPlus, CalendarCheck } from 'lucide-react';

export const googleSheetsService: IntegrationService = {
  id: 'google-sheets',
  name: 'Google Sheets',
  description: 'Google Sheets spreadsheet integration',
  category: 'productivity',
  icon: FileSpreadsheet,
  color: '#0F9D58',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {},
  actions: [
    {
      id: 'read_row',
      name: 'Read Row',
      description: 'Read data from a Google Sheets row',
      type: 'action',
      fields: [
        { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
        { name: 'range', label: 'Range', type: 'text', required: true, placeholder: 'Sheet1!A1:D5' }
      ],
      endpoint: { id: 'read', name: 'Read Row', description: 'Read row from Google Sheets', method: 'GET', path: '/googlesheets/read', parameters: {} }
    },
    {
      id: 'write_row',
      name: 'Write Row',
      description: 'Write data to a Google Sheets row',
      type: 'action',
      fields: [
        { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
        { name: 'range', label: 'Range', type: 'text', required: true, placeholder: 'Sheet1!A1:D1' },
        { name: 'values', label: 'Values', type: 'textarea', required: true, placeholder: '[["Name", "Age", "Email", "Status"]]', helpText: 'JSON array of row values' }
      ],
      endpoint: { id: 'write', name: 'Write Row', description: 'Write row to Google Sheets', method: 'POST', path: '/googlesheets/write', parameters: {} }
    },
    {
      id: 'append_row',
      name: 'Append Row',
      description: 'Append a new row to Google Sheets',
      type: 'action',
      fields: [
        { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
        { name: 'range', label: 'Range', type: 'text', required: true, placeholder: 'Sheet1!A:D' },
        { name: 'values', label: 'Values', type: 'textarea', required: true, placeholder: '[["John Doe", "30", "john@example.com", "Active"]]', helpText: 'JSON array of row values' }
      ],
      endpoint: { id: 'append', name: 'Append Row', description: 'Append row to Google Sheets', method: 'POST', path: '/googlesheets/append', parameters: {} }
    },
    {
      id: 'create_sheet',
      name: 'Create Sheet',
      description: 'Create a new sheet in the spreadsheet',
      type: 'action',
      fields: [
        { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
        { name: 'title', label: 'Sheet Title', type: 'text', required: true, placeholder: 'New Sheet' }
      ],
      endpoint: { id: 'create_sheet', name: 'Create Sheet', description: 'Create sheet in Google Sheets', method: 'POST', path: '/googlesheets/sheets', parameters: {} }
    },
    {
      id: 'clear_range',
      name: 'Clear Range',
      description: 'Clear data from a range in Google Sheets',
      type: 'action',
      fields: [
        { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
        { name: 'range', label: 'Range', type: 'text', required: true, placeholder: 'Sheet1!A1:D5' }
      ],
      endpoint: { id: 'clear', name: 'Clear Range', description: 'Clear range in Google Sheets', method: 'DELETE', path: '/googlesheets/clear', parameters: {} }
    }
  ]
};

export const googleSheetsReadRow: IntegrationNode = {
  ...googleSheetsService,
  id: 'google-sheets-read-row',
  name: 'Google Sheets - Read Row',
  type: 'action',
  icon: Search,
  serviceId: 'google-sheets',
  actionId: 'read_row',
  fields: googleSheetsService.actions[0].fields,
  endpoints: [googleSheetsService.actions[0].endpoint]
};

export const googleSheetsWriteRow: IntegrationNode = {
  ...googleSheetsService,
  id: 'google-sheets-write-row',
  name: 'Google Sheets - Write Row',
  type: 'action',
  icon: Edit,
  serviceId: 'google-sheets',
  actionId: 'write_row',
  fields: googleSheetsService.actions[1].fields,
  endpoints: [googleSheetsService.actions[1].endpoint]
};

export const googleSheetsAppendRow: IntegrationNode = {
  ...googleSheetsService,
  id: 'google-sheets-append-row',
  name: 'Google Sheets - Append Row',
  type: 'action',
  icon: Plus,
  serviceId: 'google-sheets',
  actionId: 'append_row',
  fields: googleSheetsService.actions[2].fields,
  endpoints: [googleSheetsService.actions[2].endpoint]
};

export const googleSheetsCreateSheet: IntegrationNode = {
  ...googleSheetsService,
  id: 'google-sheets-create-sheet',
  name: 'Google Sheets - Create Sheet',
  type: 'action',
  icon: FileSpreadsheet,
  serviceId: 'google-sheets',
  actionId: 'create_sheet',
  fields: googleSheetsService.actions[3].fields,
  endpoints: [googleSheetsService.actions[3].endpoint]
};

export const googleSheetsClearRange: IntegrationNode = {
  ...googleSheetsService,
  id: 'google-sheets-clear-range',
  name: 'Google Sheets - Clear Range',
  type: 'action',
  icon: Trash2,
  serviceId: 'google-sheets',
  actionId: 'clear_range',
  fields: googleSheetsService.actions[4].fields,
  endpoints: [googleSheetsService.actions[4].endpoint]
};

export const googleCalendarService: IntegrationService = {
  id: 'google-calendar',
  name: 'Google Calendar',
  description: 'Google Calendar event management integration',
  category: 'productivity',
  icon: Calendar,
  color: '#4285F4',
  requiresAuth: true,
  authType: 'oauth',
  configSchema: {},
  actions: [
    {
      id: 'create_event',
      name: 'Create Event',
      description: 'Create a new calendar event',
      type: 'action',
      fields: [
        { name: 'calendarId', label: 'Calendar ID', type: 'text', required: false, defaultValue: 'primary', placeholder: 'primary' },
        { name: 'summary', label: 'Event Title', type: 'text', required: true, placeholder: 'Team Meeting' },
        { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Meeting agenda and details' },
        { name: 'startDateTime', label: 'Start Date/Time', type: 'text', required: true, placeholder: '2024-01-01T10:00:00Z' },
        { name: 'endDateTime', label: 'End Date/Time', type: 'text', required: true, placeholder: '2024-01-01T11:00:00Z' },
        { name: 'attendees', label: 'Attendees', type: 'text', required: false, placeholder: 'john@example.com,jane@example.com', helpText: 'Comma-separated email addresses' }
      ],
      endpoint: { id: 'create', name: 'Create Event', description: 'Create calendar event', method: 'POST', path: '/googlecalendar/events', parameters: {} }
    },
    {
      id: 'list_events',
      name: 'List Events',
      description: 'List upcoming calendar events',
      type: 'action',
      fields: [
        { name: 'calendarId', label: 'Calendar ID', type: 'text', required: false, defaultValue: 'primary', placeholder: 'primary' },
        { name: 'timeMin', label: 'Start Time', type: 'text', required: false, placeholder: '2024-01-01T00:00:00Z' },
        { name: 'timeMax', label: 'End Time', type: 'text', required: false, placeholder: '2024-01-31T23:59:59Z' },
        { name: 'maxResults', label: 'Max Results', type: 'number', required: false, defaultValue: 10 }
      ],
      endpoint: { id: 'list', name: 'List Events', description: 'List calendar events', method: 'GET', path: '/googlecalendar/events', parameters: {} }
    }
  ]
};

export const googleCalendarCreateEvent: IntegrationNode = {
  ...googleCalendarService,
  id: 'google-calendar-create-event',
  name: 'Google Calendar - Create Event',
  type: 'action',
  icon: CalendarPlus,
  serviceId: 'google-calendar',
  actionId: 'create_event',
  fields: googleCalendarService.actions[0].fields,
  endpoints: [googleCalendarService.actions[0].endpoint]
};

export const googleCalendarListEvents: IntegrationNode = {
  ...googleCalendarService,
  id: 'google-calendar-list-events',
  name: 'Google Calendar - List Events',
  type: 'action',
  icon: Calendar,
  serviceId: 'google-calendar',
  actionId: 'list_events',
  fields: googleCalendarService.actions[1].fields,
  endpoints: [googleCalendarService.actions[1].endpoint]
};

export const notionService: IntegrationService = {
  id: 'notion',
  name: 'Notion',
  description: 'Notion workspace integration',
  category: 'productivity',
  icon: Book,
  color: '#000000',
  requiresAuth: true,
  authType: 'bearer',
  configSchema: {},
  actions: [
    {
      id: 'create_page',
      name: 'Create Page',
      description: 'Create a new Notion page',
      type: 'action',
      fields: [
        { name: 'parentId', label: 'Parent Page/Database ID', type: 'text', required: true, placeholder: '32facebc-c4fc-4ef8-bb88-ae31a5b3b2e4' },
        { name: 'title', label: 'Page Title', type: 'text', required: true, placeholder: 'My New Page' },
        { name: 'content', label: 'Content', type: 'textarea', required: false, placeholder: 'Page content in JSON format', helpText: 'Notion blocks as JSON' }
      ],
      endpoint: { id: 'create_page', name: 'Create Page', description: 'Create Notion page', method: 'POST', path: '/notion/pages', parameters: {} }
    },
    {
      id: 'update_page',
      name: 'Update Page',
      description: 'Update an existing Notion page',
      type: 'action',
      fields: [
        { name: 'pageId', label: 'Page ID', type: 'text', required: true, placeholder: '32facebc-c4fc-4ef8-bb88-ae31a5b3b2e4' },
        { name: 'properties', label: 'Properties', type: 'textarea', required: true, placeholder: '{"title": [{"text": {"content": "Updated Title"}}]}', helpText: 'Page properties as JSON' }
      ],
      endpoint: { id: 'update_page', name: 'Update Page', description: 'Update Notion page', method: 'PATCH', path: '/notion/pages', parameters: {} }
    },
    {
      id: 'create_database_entry',
      name: 'Create Database Entry',
      description: 'Create a new entry in a Notion database',
      type: 'action',
      fields: [
        { name: 'databaseId', label: 'Database ID', type: 'text', required: true, placeholder: '32facebc-c4fc-4ef8-bb88-ae31a5b3b2e4' },
        { name: 'properties', label: 'Properties', type: 'textarea', required: true, placeholder: '{"Name": {"title": [{"text": {"content": "Task 1"}}]}}', helpText: 'Entry properties as JSON' }
      ],
      endpoint: { id: 'create_entry', name: 'Create Database Entry', description: 'Create entry in Notion database', method: 'POST', path: '/notion/databases/entries', parameters: {} }
    },
    {
      id: 'query_database',
      name: 'Query Database',
      description: 'Query entries from a Notion database',
      type: 'action',
      fields: [
        { name: 'databaseId', label: 'Database ID', type: 'text', required: true, placeholder: '32facebc-c4fc-4ef8-bb88-ae31a5b3b2e4' },
        { name: 'filter', label: 'Filter', type: 'textarea', required: false, placeholder: '{"property": "Status", "select": {"equals": "In Progress"}}', helpText: 'Query filter as JSON' },
        { name: 'sorts', label: 'Sorts', type: 'textarea', required: false, placeholder: '[{"property": "Created", "direction": "descending"}]', helpText: 'Sort criteria as JSON' }
      ],
      endpoint: { id: 'query', name: 'Query Database', description: 'Query Notion database', method: 'POST', path: '/notion/databases/query', parameters: {} }
    }
  ]
};

export const notionCreatePage: IntegrationNode = {
  ...notionService,
  id: 'notion-create-page',
  name: 'Notion - Create Page',
  type: 'action',
  icon: Plus,
  serviceId: 'notion',
  actionId: 'create_page',
  fields: notionService.actions[0].fields,
  endpoints: [notionService.actions[0].endpoint]
};

export const notionUpdatePage: IntegrationNode = {
  ...notionService,
  id: 'notion-update-page',
  name: 'Notion - Update Page',
  type: 'action',
  icon: Edit,
  serviceId: 'notion',
  actionId: 'update_page',
  fields: notionService.actions[1].fields,
  endpoints: [notionService.actions[1].endpoint]
};

export const notionCreateDatabaseEntry: IntegrationNode = {
  ...notionService,
  id: 'notion-create-database-entry',
  name: 'Notion - Create Database Entry',
  type: 'action',
  icon: Plus,
  serviceId: 'notion',
  actionId: 'create_database_entry',
  fields: notionService.actions[2].fields,
  endpoints: [notionService.actions[2].endpoint]
};

export const notionQueryDatabase: IntegrationNode = {
  ...notionService,
  id: 'notion-query-database',
  name: 'Notion - Query Database',
  type: 'action',
  icon: Search,
  serviceId: 'notion',
  actionId: 'query_database',
  fields: notionService.actions[3].fields,
  endpoints: [notionService.actions[3].endpoint]
};

export const airtableService: IntegrationService = {
  id: 'airtable',
  name: 'Airtable',
  description: 'Airtable database integration',
  category: 'productivity',
  icon: Grid,
  color: '#18BFFF',
  requiresAuth: true,
  authType: 'bearer',
  configSchema: {},
  actions: [
    {
      id: 'create_record',
      name: 'Create Record',
      description: 'Create a new record in Airtable',
      type: 'action',
      fields: [
        { name: 'baseId', label: 'Base ID', type: 'text', required: true, placeholder: 'appXXXXXXXXXXXXXX' },
        { name: 'tableName', label: 'Table Name', type: 'text', required: true, placeholder: 'Tasks' },
        { name: 'fields', label: 'Fields', type: 'textarea', required: true, placeholder: '{"Name": "Task 1", "Status": "In Progress"}', helpText: 'JSON object with field values' }
      ],
      endpoint: { id: 'create', name: 'Create Record', description: 'Create record in Airtable', method: 'POST', path: '/airtable/records', parameters: {} }
    },
    {
      id: 'get_records',
      name: 'Get Records',
      description: 'Get records from Airtable table',
      type: 'action',
      fields: [
        { name: 'baseId', label: 'Base ID', type: 'text', required: true, placeholder: 'appXXXXXXXXXXXXXX' },
        { name: 'tableName', label: 'Table Name', type: 'text', required: true, placeholder: 'Tasks' },
        { name: 'filterByFormula', label: 'Filter Formula', type: 'text', required: false, placeholder: '{Status} = "In Progress"', helpText: 'Airtable formula for filtering' },
        { name: 'maxRecords', label: 'Max Records', type: 'number', required: false, defaultValue: 100 }
      ],
      endpoint: { id: 'get', name: 'Get Records', description: 'Get records from Airtable', method: 'GET', path: '/airtable/records', parameters: {} }
    },
    {
      id: 'update_record',
      name: 'Update Record',
      description: 'Update an existing record in Airtable',
      type: 'action',
      fields: [
        { name: 'baseId', label: 'Base ID', type: 'text', required: true, placeholder: 'appXXXXXXXXXXXXXX' },
        { name: 'tableName', label: 'Table Name', type: 'text', required: true, placeholder: 'Tasks' },
        { name: 'recordId', label: 'Record ID', type: 'text', required: true, placeholder: 'recXXXXXXXXXXXXXX' },
        { name: 'fields', label: 'Fields', type: 'textarea', required: true, placeholder: '{"Status": "Completed"}', helpText: 'JSON object with updated field values' }
      ],
      endpoint: { id: 'update', name: 'Update Record', description: 'Update record in Airtable', method: 'PATCH', path: '/airtable/records', parameters: {} }
    }
  ]
};

export const airtableCreateRecord: IntegrationNode = {
  ...airtableService,
  id: 'airtable-create-record',
  name: 'Airtable - Create Record',
  type: 'action',
  icon: Plus,
  serviceId: 'airtable',
  actionId: 'create_record',
  fields: airtableService.actions[0].fields,
  endpoints: [airtableService.actions[0].endpoint]
};

export const airtableGetRecords: IntegrationNode = {
  ...airtableService,
  id: 'airtable-get-records',
  name: 'Airtable - Get Records',
  type: 'action',
  icon: Search,
  serviceId: 'airtable',
  actionId: 'get_records',
  fields: airtableService.actions[1].fields,
  endpoints: [airtableService.actions[1].endpoint]
};

export const airtableUpdateRecord: IntegrationNode = {
  ...airtableService,
  id: 'airtable-update-record',
  name: 'Airtable - Update Record',
  type: 'action',
  icon: Edit,
  serviceId: 'airtable',
  actionId: 'update_record',
  fields: airtableService.actions[2].fields,
  endpoints: [airtableService.actions[2].endpoint]
};

// Keep backward compatibility
export const googleSheetsIntegration: IntegrationNode = googleSheetsReadRow;

export const googleCalendarIntegration: IntegrationNode = googleCalendarCreateEvent;
export const notionIntegration: IntegrationNode = notionCreatePage;
export const airtableIntegration: IntegrationNode = airtableCreateRecord;