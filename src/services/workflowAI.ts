import { AIGenerationRequest, AIGenerationResponse, WorkflowStep } from '@/types/workflow';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class WorkflowAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateWorkflow(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const systemPrompt = `You are an expert automation engineer for HALO, a professional automation platform. Generate executable workflows from natural language descriptions.

WORKFLOW GENERATION RULES:
1. Always start with a trigger (webhook, schedule, email, form_submit, or file_upload)
2. Include logical action steps (email, slack, webhook, database, file_operation, ai_process)
3. Add conditions when logic branching is needed
4. Ensure steps are properly connected
5. Generate realistic configurations for each step
6. Position steps in a logical flow layout

RESPONSE FORMAT: Return only valid JSON with this structure:
{
  "workflow": {
    "name": "string",
    "description": "string", 
    "status": "draft",
    "steps": [/* WorkflowStep array */]
  },
  "explanation": "string",
  "suggestions": ["string array"]
}

AVAILABLE INTEGRATIONS: Email, Slack, Webhooks, Databases, File Operations, AI Processing

Generate a complete, executable workflow for: "${request.prompt}"`;

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'o3-2025-01-31',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: request.prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return this.createFallbackWorkflow(request.prompt);
      }
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
      ]
    };
  }
}