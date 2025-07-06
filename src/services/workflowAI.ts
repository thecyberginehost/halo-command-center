import { AIGenerationRequest, AIGenerationResponse, WorkflowStep } from '@/types/workflow';
import { supabase } from '@/integrations/supabase/client';

export interface TenantAwareRequest extends AIGenerationRequest {
  tenantId?: string;
}

export class WorkflowAIService {
  constructor() {
    // No API key needed - handled by edge function
  }

  async generateWorkflow(request: TenantAwareRequest): Promise<AIGenerationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-workflow', {
        body: {
          prompt: request.prompt,
          tenantId: request.tenantId,
          context: request.context,
          preferredIntegrations: request.preferredIntegrations
        }
      });

      if (error) {
        throw new Error(`Workflow generation error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Workflow generation error:', error);
      return this.createFallbackWorkflow(request.prompt);
    }
  }

  private createFallbackWorkflow(prompt: string): AIGenerationResponse {
    const steps: WorkflowStep[] = [
      {
        id: 'trigger-1',
        type: 'trigger',
        title: 'Webhook Trigger',
        description: 'Receives incoming data',
        config: { url: '/webhook/trigger', method: 'POST' },
        position: { x: 100, y: 100 },
        connections: ['action-1']
      },
      {
        id: 'action-1',
        type: 'action',
        title: 'Process Data',
        description: 'Process the incoming data',
        config: { action: 'process', data: '{{trigger.body}}' },
        position: { x: 300, y: 100 },
        connections: []
      }
    ];

    return {
      workflow: {
        name: 'Generated Workflow',
        description: `Workflow generated from: ${prompt}`,
        status: 'draft',
        steps
      },
      explanation: 'Created a basic workflow with webhook trigger and data processing action.',
      suggestions: [
        'Add email notifications for completion',
        'Include error handling conditions',
        'Add data validation steps'
      ],
      complexity_analysis: {
        estimated_execution_time: '< 30 seconds',
        reliability_score: 'medium',
        maintenance_requirements: 'Low - simple two-step workflow'
      }
    };
  }
}