import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const SESEmailNode: HaloNodeDefinition = {
  displayName: 'Amazon SES',
  name: 'sesEmail',
  icon: 'sesemail.svg',
  group: ['communication'],
  version: 1,
  description: 'Send emails using Amazon Simple Email Service (SES)',
  defaults: {
    name: 'Amazon SES',
    color: '#FF9900',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'awsCredentials',
      required: true
    }
  ],
  properties: [
    {
      displayName: 'AWS Region',
      name: 'region',
      type: 'options',
      default: 'us-east-1',
      required: true,
      options: [
        { name: 'US East (N. Virginia)', value: 'us-east-1' },
        { name: 'US West (Oregon)', value: 'us-west-2' },
        { name: 'EU (Ireland)', value: 'eu-west-1' },
        { name: 'EU (Frankfurt)', value: 'eu-central-1' }
      ]
    },
    {
      displayName: 'From Email',
      name: 'fromEmail',
      type: 'string',
      default: '',
      required: true,
      description: 'The sender email address (must be verified in SES)',
      placeholder: 'noreply@example.com'
    },
    {
      displayName: 'To Email',
      name: 'toEmail',
      type: 'string',
      default: '',
      required: true,
      description: 'The recipient email address',
      placeholder: 'user@example.com'
    },
    {
      displayName: 'Subject',
      name: 'subject',
      type: 'string',
      default: '',
      required: true,
      description: 'Email subject line',
      placeholder: 'Scheduled notification'
    },
    {
      displayName: 'Message Body',
      name: 'body',
      type: 'string',
      default: '',
      required: true,
      description: 'Email message content',
      placeholder: 'This is a scheduled email notification...',
      typeOptions: {
        rows: 4
      }
    },
    {
      displayName: 'Body Type',
      name: 'bodyType',
      type: 'options',
      default: 'text',
      options: [
        { name: 'Plain Text', value: 'text' },
        { name: 'HTML', value: 'html' }
      ]
    }
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    const region = context.getNodeParameter('region', 0) as string;
    const fromEmail = context.getNodeParameter('fromEmail', 0) as string;
    const toEmail = context.getNodeParameter('toEmail', 0) as string;
    const subject = context.getNodeParameter('subject', 0) as string;
    const body = context.getNodeParameter('body', 0) as string;
    const bodyType = context.getNodeParameter('bodyType', 0) as string;
    
    // Get input data from previous node
    const inputData = context.getInputData();
    const previousData = inputData[0]?.json || {};

    try {
      // In a real implementation, this would make actual SES API calls
      // For demo purposes, we'll simulate the response
      const messageId = `ses-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const result = {
        messageId,
        status: 'sent',
        timestamp: new Date().toISOString(),
        from: fromEmail,
        to: toEmail,
        subject,
        region,
        bodyType,
        previousNodeData: previousData
      };

      console.log('SES Email would be sent:', result);

      return [[{
        json: result
      }]];
    } catch (error) {
      throw new Error(`Failed to send email via SES: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};