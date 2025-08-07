import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const SlackNode: HaloNodeDefinition = {
  displayName: 'Slack',
  name: 'slack',
  icon: 'slack.svg',
  group: ['communication'],
  version: 1,
  description: 'Send messages and notifications to Slack',
  defaults: {
    name: 'Slack',
    color: '#4A154B',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'slackCredentials',
      required: true
    }
  ],
  properties: [
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      default: 'sendMessage',
      required: true,
      options: [
        { name: 'Send Message', value: 'sendMessage' },
        { name: 'Send Direct Message', value: 'sendDM' },
        { name: 'Upload File', value: 'uploadFile' }
      ]
    },
    {
      displayName: 'Channel',
      name: 'channel',
      type: 'string',
      default: '',
      required: true,
      description: 'Channel name or ID (e.g., #general)',
      placeholder: '#general',
      displayOptions: {
        show: {
          operation: ['sendMessage', 'uploadFile']
        }
      }
    },
    {
      displayName: 'User',
      name: 'user',
      type: 'string',
      default: '',
      required: true,
      description: 'Username or User ID for direct message',
      placeholder: '@username',
      displayOptions: {
        show: {
          operation: ['sendDM']
        }
      }
    },
    {
      displayName: 'Message',
      name: 'message',
      type: 'string',
      default: '',
      required: true,
      description: 'Message content',
      placeholder: 'Hello from HALO automation!',
      typeOptions: {
        rows: 3
      },
      displayOptions: {
        show: {
          operation: ['sendMessage', 'sendDM']
        }
      }
    },
    {
      displayName: 'Username (Bot Name)',
      name: 'username',
      type: 'string',
      default: 'HALO Bot',
      required: false,
      description: 'Custom username for the bot',
      placeholder: 'HALO Bot'
    },
    {
      displayName: 'Emoji Icon',
      name: 'icon_emoji',
      type: 'string',
      default: ':robot_face:',
      required: false,
      description: 'Emoji to use as bot icon',
      placeholder: ':robot_face:'
    }
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    const operation = context.getNodeParameter('operation', 0) as string;
    const message = context.getNodeParameter('message', 0) as string;
    const username = context.getNodeParameter('username', 0) as string;
    const icon_emoji = context.getNodeParameter('icon_emoji', 0) as string;
    
    const inputData = context.getInputData();
    const previousData = inputData[0]?.json || {};

    try {
      let result: any = {
        timestamp: new Date().toISOString(),
        service: 'slack',
        username,
        icon_emoji,
        previousNodeData: previousData
      };

      if (operation === 'sendMessage') {
        const channel = context.getNodeParameter('channel', 0) as string;
        
        result = {
          ...result,
          messageId: `slack-${Date.now()}`,
          channel,
          message,
          status: 'sent',
          operation: 'channel_message'
        };

        console.log('Slack channel message would be sent:', result);
      } else if (operation === 'sendDM') {
        const user = context.getNodeParameter('user', 0) as string;
        
        result = {
          ...result,
          messageId: `slack-dm-${Date.now()}`,
          user,
          message,
          status: 'sent',
          operation: 'direct_message'
        };

        console.log('Slack DM would be sent:', result);
      } else if (operation === 'uploadFile') {
        const channel = context.getNodeParameter('channel', 0) as string;
        
        result = {
          ...result,
          fileId: `slack-file-${Date.now()}`,
          channel,
          status: 'uploaded',
          operation: 'file_upload'
        };

        console.log('Slack file would be uploaded:', result);
      }

      return [[{ json: result }]];
    } catch (error) {
      throw new Error(`Failed to execute Slack operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};