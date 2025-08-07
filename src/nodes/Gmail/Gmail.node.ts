import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const GmailNode: HaloNodeDefinition = {
  displayName: 'Gmail',
  name: 'gmail',
  icon: 'gmail.svg',
  group: ['communication'],
  version: 1,
  description: 'Send emails via Gmail',
  defaults: {
    name: 'Gmail',
    color: '#EA4335',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'googleCredentials',
      required: true
    }
  ],
  properties: [
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      default: 'send',
      required: true,
      options: [
        { name: 'Send Email', value: 'send' },
        { name: 'Search Emails', value: 'search' },
        { name: 'Reply to Email', value: 'reply' }
      ]
    },
    {
      displayName: 'To',
      name: 'to',
      type: 'string',
      default: '',
      required: true,
      description: 'Recipient email address',
      placeholder: 'recipient@example.com',
      displayOptions: {
        show: {
          operation: ['send', 'reply']
        }
      }
    },
    {
      displayName: 'Subject',
      name: 'subject',
      type: 'string',
      default: '',
      required: true,
      description: 'Email subject',
      placeholder: 'Subject line',
      displayOptions: {
        show: {
          operation: ['send', 'reply']
        }
      }
    },
    {
      displayName: 'Body',
      name: 'body',
      type: 'string',
      default: '',
      required: true,
      description: 'Email body content',
      placeholder: 'Email message content...',
      typeOptions: {
        rows: 4
      },
      displayOptions: {
        show: {
          operation: ['send', 'reply']
        }
      }
    },
    {
      displayName: 'CC',
      name: 'cc',
      type: 'string',
      default: '',
      required: false,
      description: 'CC recipients (comma separated)',
      placeholder: 'cc1@example.com, cc2@example.com',
      displayOptions: {
        show: {
          operation: ['send']
        }
      }
    },
    {
      displayName: 'Search Query',
      name: 'searchQuery',
      type: 'string',
      default: '',
      required: true,
      description: 'Gmail search query',
      placeholder: 'from:example@gmail.com',
      displayOptions: {
        show: {
          operation: ['search']
        }
      }
    }
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    const operation = context.getNodeParameter('operation', 0) as string;
    const inputData = context.getInputData();
    const previousData = inputData[0]?.json || {};

    try {
      if (operation === 'send') {
        const to = context.getNodeParameter('to', 0) as string;
        const subject = context.getNodeParameter('subject', 0) as string;
        const body = context.getNodeParameter('body', 0) as string;
        const cc = context.getNodeParameter('cc', 0) as string;

        const messageId = `gmail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const result = {
          messageId,
          status: 'sent',
          timestamp: new Date().toISOString(),
          from: 'user@gmail.com', // Would be from authenticated user
          to,
          cc: cc || undefined,
          subject,
          service: 'gmail',
          previousNodeData: previousData
        };

        console.log('Gmail email would be sent:', result);

        return [[{ json: result }]];
      } else if (operation === 'search') {
        const searchQuery = context.getNodeParameter('searchQuery', 0) as string;
        
        const result = {
          query: searchQuery,
          results: [
            {
              id: 'msg_123',
              subject: 'Sample Email 1',
              from: 'sender@example.com',
              to: 'user@gmail.com',
              body: 'Sample email content...',
              date: new Date().toISOString(),
              read: false
            }
          ],
          total: 1,
          service: 'gmail',
          previousNodeData: previousData
        };

        console.log('Gmail search would return:', result);

        return [[{ json: result }]];
      }

      throw new Error(`Unsupported operation: ${operation}`);
    } catch (error) {
      throw new Error(`Failed to execute Gmail operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};