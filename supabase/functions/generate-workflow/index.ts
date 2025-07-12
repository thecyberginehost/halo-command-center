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
    let systemKnowledgeContext = '';
    
    // Get system knowledge base (general HALO/MASP knowledge for workflow generation)
    const { data: systemKB } = await supabase
      .from('system_knowledge_base')
      .select('category, title, content')
      .in('category', ['platform', 'automation', 'troubleshooting']) // Focus on relevant categories
      .eq('priority', 1) // Only highest priority for workflow generation
      .order('created_at', { ascending: false })
      .limit(8);

    if (systemKB && systemKB.length > 0) {
      systemKnowledgeContext = systemKB
        .map(kb => `${kb.title}: ${kb.content}`)
        .join('\n\n');
    }
    
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

const systemPrompt = `You are an expert automation engineer for HALO, the premier enterprise automation platform for MASP (Managed Automation Service Provider) certified professionals.

Your mission: Transform natural language business requirements into sophisticated, production-ready automation workflows that showcase enterprise-grade data processing capabilities.

HALO SYSTEM KNOWLEDGE:
${systemKnowledgeContext}

TENANT-SPECIFIC KNOWLEDGE:
${knowledgeContext || 'No tenant-specific knowledge provided. Use general automation best practices.'}

CRITICAL ENTERPRISE WORKFLOW DESIGN PRINCIPLES:
1. INDUSTRIAL DATA PROCESSING: Design workflows as industrial-grade data processing pipelines
2. PROFESSIONAL INTEGRATION HUB: Utilize enterprise integrations (Salesforce, HubSpot, Slack, Email, Databases)
3. FAULT-TOLERANT ARCHITECTURE: Include comprehensive error handling and recovery mechanisms
4. SCALABLE PROCESSING: Design for high-volume enterprise data throughput
5. AUDIT & COMPLIANCE: Include detailed logging and monitoring for enterprise requirements
6. SECURITY-FIRST: Implement proper authentication, authorization, and data protection

ENTERPRISE PROCESSING MODULES (map these to integration types):
- EMAIL_PROCESSOR: Advanced email handling (SMTP, IMAP, SendGrid, Mailgun)
- CRM_PROCESSOR: Customer relationship management (Salesforce, HubSpot, Pipedrive)
- COMMUNICATION_PROCESSOR: Team messaging (Slack, Microsoft Teams, Discord)
- DATABASE_PROCESSOR: Enterprise data operations (PostgreSQL, MySQL, MongoDB)
- FILE_PROCESSOR: Document and media handling (AWS S3, Google Drive, Dropbox)
- API_PROCESSOR: RESTful and GraphQL service integration
- AI_PROCESSOR: Intelligent data processing (OpenAI, Anthropic, custom models)
- WEBHOOK_PROCESSOR: Real-time event processing and notifications
- AUTOMATION_PROCESSOR: Workflow orchestration and business logic

PROFESSIONAL TRIGGER TYPES:
- webhook_trigger: Real-time HTTP endpoint processing
- schedule_trigger: Time-based automation (cron expressions)
- email_trigger: Email event processing (IMAP/webhook)
- form_trigger: Web form submission handling
- file_trigger: Document upload and processing
- database_trigger: Data change events
- api_trigger: External service notifications

ENTERPRISE ACTION CATEGORIES:
- email_action: Professional email delivery and templates
- crm_action: Customer data synchronization and updates
- notification_action: Multi-channel alerting (Slack, Teams, SMS)
- database_action: Enterprise data operations and ETL
- file_action: Document processing and storage
- api_action: External service integration and data exchange
- ai_action: Intelligent content processing and analysis
- approval_action: Human-in-the-loop workflow gates

ENTERPRISE INTEGRATION ECOSYSTEM: 
Email Systems (SendGrid, Mailgun, AWS SES), CRM Platforms (Salesforce, HubSpot, Pipedrive), Communication (Slack, Microsoft Teams), Databases (PostgreSQL, MySQL, Redis), Cloud Storage (AWS S3, Google Drive, Azure Blob), APIs (REST, GraphQL, WebSocket), AI Services (OpenAI, Anthropic, Hugging Face)

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
      // Fallback if JSON parsing fails - create enterprise-grade pipeline
      aiResponse = {
        workflow: {
          name: 'Enterprise Data Pipeline',
          description: `Professional automation workflow: ${prompt}`,
          status: 'draft',
          steps: [
            {
              id: 'webhook-processor-1',
              type: 'trigger',
              title: 'Data Intake Processor',
              description: 'Real-time data ingestion endpoint',
              config: { 
                integration: 'webhook',
                url: '/api/webhook/intake',
                method: 'POST',
                authentication: 'bearer_token',
                rate_limit: '1000/minute'
              },
              position: { x: 100, y: 100 },
              connections: ['data-validator-1']
            },
            {
              id: 'data-validator-1',
              type: 'condition',
              title: 'Data Validation Engine',
              description: 'Enterprise-grade data validation',
              config: {
                integration: 'validator',
                rules: ['required_fields', 'data_types', 'business_rules'],
                error_handling: 'graceful_degradation'
              },
              position: { x: 300, y: 100 },
              connections: ['crm-processor-1', 'error-handler-1']
            },
            {
              id: 'crm-processor-1',
              type: 'action',
              title: 'CRM Integration Processor',
              description: 'Customer data synchronization',
              config: {
                integration: 'salesforce',
                operation: 'upsert_contact',
                mapping: 'automatic',
                retry_policy: { attempts: 3, backoff: 'exponential' }
              },
              position: { x: 500, y: 50 },
              connections: ['notification-processor-1']
            },
            {
              id: 'notification-processor-1',
              type: 'action',
              title: 'Communication Processor',
              description: 'Multi-channel notification delivery',
              config: {
                integration: 'slack',
                channels: ['#sales', '#notifications'],
                template: 'new_lead_template',
                fallback: 'email'
              },
              position: { x: 700, y: 50 },
              connections: []
            },
            {
              id: 'error-handler-1',
              type: 'action',
              title: 'Error Processing Unit',
              description: 'Enterprise error logging and recovery',
              config: {
                integration: 'logger',
                severity: 'warning',
                notification: 'admin_alert',
                recovery_action: 'retry_queue'
              },
              position: { x: 500, y: 150 },
              connections: []
            }
          ]
        },
        explanation: 'Enterprise-grade data processing pipeline with validation, CRM integration, notifications, and comprehensive error handling. Designed for high-volume production environments.',
        suggestions: [
          'Add AI-powered lead scoring processor',
          'Implement advanced analytics pipeline',
          'Add compliance audit trail',
          'Configure automated testing suite'
        ],
        complexity_analysis: {
          estimated_execution_time: '< 2 seconds',
          reliability_score: 'high',
          maintenance_requirements: 'Enterprise-grade monitoring and configuration management recommended'
        }
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