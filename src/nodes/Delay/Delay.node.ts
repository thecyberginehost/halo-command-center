import { HaloNodeDefinition, HaloNodeExecuteContext, HaloNodeExecutionData } from '../../types/haloNode';

export const DelayNode: HaloNodeDefinition = {
  displayName: 'Delay',
  name: 'delay',
  icon: 'delay.svg',
  group: ['logic'],
  version: 1,
  description: 'Wait for a specified amount of time before continuing',
  defaults: {
    name: 'Delay',
    color: '#9333EA',
  },
  inputs: ['main'],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Wait Time',
      name: 'waitTime',
      type: 'number',
      default: 1,
      required: true,
      description: 'Time to wait',
      placeholder: '1'
    },
    {
      displayName: 'Time Unit',
      name: 'timeUnit',
      type: 'options',
      default: 'seconds',
      required: true,
      options: [
        { name: 'Seconds', value: 'seconds' },
        { name: 'Minutes', value: 'minutes' },
        { name: 'Hours', value: 'hours' },
        { name: 'Days', value: 'days' }
      ]
    },
    {
      displayName: 'Resume Mode',
      name: 'resumeMode',
      type: 'options',
      default: 'immediately',
      required: true,
      options: [
        { name: 'Immediately', value: 'immediately' },
        { name: 'Next Full Hour', value: 'nextHour' },
        { name: 'Next Full Day', value: 'nextDay' },
        { name: 'Specific Time', value: 'specificTime' }
      ],
      description: 'When to resume after the delay'
    },
    {
      displayName: 'Resume Time',
      name: 'resumeTime',
      type: 'string',
      default: '09:00',
      required: true,
      description: 'Time to resume (HH:MM format)',
      placeholder: '09:00',
      displayOptions: {
        show: {
          resumeMode: ['specificTime']
        }
      }
    }
  ],
  async execute(context: HaloNodeExecuteContext): Promise<HaloNodeExecutionData[][]> {
    const waitTime = context.getNodeParameter('waitTime', 0) as number;
    const timeUnit = context.getNodeParameter('timeUnit', 0) as string;
    const resumeMode = context.getNodeParameter('resumeMode', 0) as string;
    const resumeTime = context.getNodeParameter('resumeTime', 0) as string;
    
    const inputData = context.getInputData();
    const previousData = inputData[0]?.json || {};

    // Calculate delay duration in milliseconds
    let delayMs = waitTime * 1000; // Default to seconds
    switch (timeUnit) {
      case 'minutes':
        delayMs = waitTime * 60 * 1000;
        break;
      case 'hours':
        delayMs = waitTime * 60 * 60 * 1000;
        break;
      case 'days':
        delayMs = waitTime * 24 * 60 * 60 * 1000;
        break;
    }

    const startTime = new Date();
    let resumeAt = new Date(startTime.getTime() + delayMs);

    // Adjust resume time based on mode
    if (resumeMode === 'nextHour') {
      resumeAt = new Date(startTime.getTime() + delayMs);
      resumeAt.setMinutes(0, 0, 0);
      resumeAt.setHours(resumeAt.getHours() + 1);
    } else if (resumeMode === 'nextDay') {
      resumeAt = new Date(startTime.getTime() + delayMs);
      resumeAt.setHours(0, 0, 0, 0);
      resumeAt.setDate(resumeAt.getDate() + 1);
    } else if (resumeMode === 'specificTime') {
      const [hours, minutes] = resumeTime.split(':').map(Number);
      resumeAt = new Date(startTime.getTime() + delayMs);
      resumeAt.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (resumeAt <= startTime) {
        resumeAt.setDate(resumeAt.getDate() + 1);
      }
    }

    const result = {
      delayStarted: startTime.toISOString(),
      delayDuration: delayMs,
      waitTime,
      timeUnit,
      resumeMode,
      resumeAt: resumeAt.toISOString(),
      estimatedDelayMs: resumeAt.getTime() - startTime.getTime(),
      previousNodeData: previousData
    };

    // In a real implementation, this would schedule the workflow to resume
    console.log('Delay would be scheduled:', result);

    // For demo purposes, we immediately return the data
    // In production, this would pause the workflow execution
    return [[{ json: result }]];
  }
};