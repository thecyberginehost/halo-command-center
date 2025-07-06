import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowGenerationRequest {
  prompt: string;
  tenantId?: string;
  context?: Record<string, any>;
  preferredIntegrations?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { prompt, tenantId, context, preferredIntegrations }: WorkflowGenerationRequest = await req.json();

    // Get tenant-specific knowledge base if tenantId is provided
    let knowledgeContext = '';
    if (tenantId) {
      const { data: knowledgeBase } = await supabase
        .from('tenant_knowledge_bases')
        .select('title, content, category')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (knowledgeBase && knowledgeBase.length > 0) {
        knowledgeContext = knowledgeBase
          .map(kb => `${kb.title} (${kb.category}): ${kb.content}`)
          .join('\n\n');
      }
    }

    const systemPrompt = `You are an expert automation engineer for HALO, a professional automation platform for MASP (Managed Automation Service Provider) certified professionals.

Your task is to analyze business requirements and generate sophisticated, enterprise-grade workflows with proper logic flow, error handling, and integration patterns.

TENANT KNOWLEDGE BASE:
${knowledgeContext || 'No tenant-specific knowledge provided. Use general automation best practices.'}

ADVANCED WORKFLOW GENERATION RULES:
1. TRIGGERS: Choose appropriate triggers (webhook, schedule, email, form_submit, file_upload, database_change)
2. LOGIC FLOW: Design proper sequential and parallel processing paths
3. CONDITIONS: Add branching logic with proper boolean conditions and fallback paths
4. ERROR HANDLING: Include try-catch patterns and failure notifications
5. DATA TRANSFORMATION: Add data validation, mapping, and formatting steps
6. INTEGRATIONS: Select optimal service connections based on business context
7. MONITORING: Include logging and success/failure tracking
8. SCALABILITY: Design for enterprise-level volume and reliability

STEP TYPES & CONFIGURATIONS:
- TRIGGERS: webhook (POST/GET), schedule (cron), email (IMAP/webhook), form_submit, file_upload, database_change
- ACTIONS: email (SMTP/API), slack (webhook/API), http_request, database_operation, file_operation, ai_process, crm_update
- CONDITIONS: if/else logic, data_validation, approval_gate, time_based, user_permission
- UTILITIES: delay, logger, data_transformer, error_handler, loop, parallel_processor

INTEGRATION ECOSYSTEM: 
Email (SMTP, SendGrid, Mailgun), Slack, Teams, CRM (Salesforce, HubSpot), Databases (PostgreSQL, MySQL), File Storage (S3, Google Drive), APIs (REST/GraphQL), AI Services (OpenAI, custom models)

RESPONSE FORMAT - Generate valid JSON with this exact structure:
{
  "workflow": {
    "name": "string (descriptive business name)",
    "description": "string (clear business purpose)", 
    "status": "draft",
    "steps": [
      {
        "id": "unique-step-id",
        "type": "trigger|action|condition|utility",
        "title": "Step Display Name",
        "description": "What this step does",
        "config": {
          // Step-specific configuration object
          "integration": "service_name",
          "parameters": {},
          "error_handling": {},
          "retry_policy": {}
        },
        "position": { "x": number, "y": number },
        "connections": ["next-step-id"],
        "conditions": [
          {
            "field": "data_field",
            "operator": "equals|contains|greater_than",
            "value": "comparison_value",
            "next_step": "conditional-step-id"
          }
        ]
      }
    ]
  },
  "explanation": "string explaining the workflow logic and business value",
  "suggestions": ["array of specific optimization and enhancement suggestions"],
  "complexity_analysis": {
    "estimated_execution_time": "string",
    "reliability_score": "high|medium|low",
    "maintenance_requirements": "string"
  }
}

TASK: Generate a complete, production-ready workflow for: "${prompt}"

Think through the business process step-by-step, considering all edge cases, error scenarios, and integration points. Design for enterprise reliability and maintainability.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'o3-2025-04-16',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2, // Lower temperature for more consistent reasoning
        max_tokens: 4000, // Higher token limit for complex workflows
        reasoning_effort: 'medium', // o3-specific parameter for reasoning depth
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(content);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      aiResponse = {
        workflow: {
          name: 'Generated Workflow',
          description: `Workflow generated from: ${prompt}`,
          status: 'draft',
          steps: [
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
          ]
        },
        explanation: 'Created a basic workflow with webhook trigger and data processing action.',
        suggestions: [
          'Add email notifications for completion',
          'Include error handling conditions',
          'Add data validation steps'
        ]
      };
    }

    // Optionally save the generated workflow to database if tenantId is provided
    if (tenantId && aiResponse.workflow) {
      await supabase
        .from('workflows')
        .insert({
          tenant_id: tenantId,
          name: aiResponse.workflow.name,
          description: aiResponse.workflow.description,
          status: aiResponse.workflow.status,
          steps: aiResponse.workflow.steps,
        });
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Error in generate-workflow function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});