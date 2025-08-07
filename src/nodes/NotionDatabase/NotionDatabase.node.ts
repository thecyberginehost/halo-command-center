import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const NotionDatabaseNode: HaloNodeDefinition = {
  displayName: 'Notion Database',
  name: 'notionDatabase',
  icon: 'notiondatabase.svg',
  group: ['databases'],
  version: 1,
  description: 'Create entries in a Notion database',
  defaults: {
    name: 'Notion Database',
    color: '#000000',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'notionCredentials',
      required: true
    }
  ],
  properties: [
    {
      displayName: 'Database ID',
      name: 'databaseId',
      type: 'string',
      default: '',
      required: true,
      description: 'The ID of the Notion database to add entries to',
      placeholder: '32-character database ID'
    },
    {
      displayName: 'Page Title',
      name: 'pageTitle',
      type: 'string',
      default: '',
      required: true,
      description: 'Title for the new page/entry',
      placeholder: 'Email Log Entry'
    },
    {
      displayName: 'Properties',
      name: 'properties',
      type: 'collection',
      default: [],
      description: 'Database properties to set',
      typeOptions: {
        multipleValues: true
      }
    },
    {
      displayName: 'Email Status',
      name: 'emailStatus',
      type: 'string',
      default: '',
      required: false,
      description: 'Status of the email (from previous node)',
      placeholder: 'Will be populated from previous node'
    },
    {
      displayName: 'Message ID',
      name: 'messageId',
      type: 'string',
      default: '',
      required: false,
      description: 'Email message ID (from previous node)',
      placeholder: 'Will be populated from previous node'
    },
    {
      displayName: 'Log Timestamp',
      name: 'logTimestamp',
      type: 'string',
      default: '',
      required: false,
      description: 'Timestamp for the log entry',
      placeholder: 'Will use current time if empty'
    }
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    const databaseId = context.getNodeParameter('databaseId', 0) as string;
    const pageTitle = context.getNodeParameter('pageTitle', 0) as string;
    
    // Get input data from previous node (SES email results)
    const inputData = context.getInputData();
    const previousData = inputData[0]?.json || {};
    
    // Extract email data from previous node
    const emailStatus = previousData.status || 'unknown';
    const messageId = previousData.messageId || 'no-id';
    const emailTimestamp = previousData.timestamp || new Date().toISOString();
    const fromEmail = previousData.from || 'unknown';
    const toEmail = previousData.to || 'unknown';
    const subject = previousData.subject || 'No subject';

    try {
      // In a real implementation, this would make actual Notion API calls
      // For demo purposes, we'll simulate the response
      const pageId = `notion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const result = {
        pageId,
        url: `https://notion.so/${pageId}`,
        created: new Date().toISOString(),
        databaseId,
        title: pageTitle,
        properties: {
          'Email Status': emailStatus,
          'Message ID': messageId,
          'From': fromEmail,
          'To': toEmail,
          'Subject': subject,
          'Sent At': emailTimestamp,
          'Logged At': new Date().toISOString()
        },
        previousNodeData: previousData
      };

      console.log('Notion database entry would be created:', result);

      return [[{
        json: result
      }]];
    } catch (error) {
      throw new Error(`Failed to create Notion database entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};