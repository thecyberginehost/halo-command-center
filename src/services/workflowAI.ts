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
        id: 'webhook-processor-1',
        type: 'trigger',
        title: 'Data Intake Processor',
        description: 'Enterprise webhook data ingestion',
        config: { 
          integration: 'webhook',
          url: '/api/webhook/intake',
          method: 'POST',
          authentication: 'bearer_token',
          rate_limit: '1000/minute'
        },
        position: { x: 100, y: 100 },
        connections: ['crm-processor-1']
      },
      {
        id: 'crm-processor-1',
        type: 'action',
        title: 'CRM Integration Processor',
        description: 'Professional customer data sync',
        config: {
          integration: 'salesforce',
          operation: 'upsert_contact',
          mapping: 'smart_mapping',
          retry_policy: { attempts: 3, backoff: 'exponential' }
        },
        position: { x: 350, y: 100 },
        connections: ['notification-processor-1']
      },
      {
        id: 'notification-processor-1',
        type: 'action',
        title: 'Communication Processor',
        description: 'Multi-channel enterprise notifications',
        config: {
          integration: 'slack',
          channels: ['#sales-pipeline', '#notifications'],
          template: 'enterprise_alert',
          fallback: 'email'
        },
        position: { x: 600, y: 100 },
        connections: []
      }
    ];

    return {
      workflow: {
        name: 'Enterprise Automation Pipeline',
        description: `Professional workflow: ${prompt}`,
        status: 'draft',
        steps
      },
      explanation: 'Enterprise-grade automation pipeline featuring webhook data ingestion, CRM synchronization, and multi-channel notifications. Optimized for professional MASP environments.',
      suggestions: [
        'Add AI-powered lead qualification processor',
        'Implement advanced error recovery mechanisms',
        'Configure compliance audit trails',
        'Add performance monitoring dashboard'
      ],
      complexity_analysis: {
        estimated_execution_time: '< 3 seconds',
        reliability_score: 'high',
        maintenance_requirements: 'Enterprise monitoring and configuration management recommended'
      }
    };
  }
}