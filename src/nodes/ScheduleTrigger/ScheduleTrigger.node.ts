import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const ScheduleTriggerNode: HaloNodeDefinition = {
  displayName: 'Schedule Trigger',
  name: 'scheduleTrigger',
  icon: 'scheduletrigger.svg',
  group: ['trigger'],
  version: 1,
  description: 'Triggers the workflow on a scheduled basis using cron expressions',
  defaults: {
    name: 'Schedule Trigger',
    color: '#10B981',
  },
  inputs: [],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Trigger Type',
      name: 'triggerType',
      type: 'options',
      default: 'interval',
      required: true,
      options: [
        {
          name: 'Interval',
          value: 'interval'
        },
        {
          name: 'Cron Expression',
          value: 'cron'
        }
      ]
    },
    {
      displayName: 'Interval',
      name: 'interval',
      type: 'number',
      default: 60,
      required: true,
      description: 'Interval in seconds between triggers',
      placeholder: '60'
    },
    {
      displayName: 'Cron Expression', 
      name: 'cronExpression',
      type: 'string',
      default: '0 */1 * * *',
      required: false,
      description: 'Cron expression for schedule (e.g., "0 */1 * * *" for every hour)',
      placeholder: '0 */1 * * *'
    },
    {
      displayName: 'Timezone',
      name: 'timezone',
      type: 'string',
      default: 'UTC',
      required: false,
      description: 'Timezone for the schedule',
      placeholder: 'UTC'
    }
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    const triggerType = context.getNodeParameter('triggerType', 0) as string;
    const interval = context.getNodeParameter('interval', 0) as number;
    const cronExpression = context.getNodeParameter('cronExpression', 0) as string;
    const timezone = context.getNodeParameter('timezone', 0) as string;

    const now = new Date();
    
    return [[{
      json: {
        timestamp: now.toISOString(),
        scheduledTime: now.toISOString(),
        timezone,
        triggerType,
        interval: triggerType === 'interval' ? interval : undefined,
        cronExpression: triggerType === 'cron' ? cronExpression : undefined,
        message: `Workflow triggered at ${now.toISOString()}`
      }
    }]];
  }
};