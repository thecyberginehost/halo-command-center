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

Generate executable workflows from natural language descriptions using the tenant's specific knowledge base and requirements.

TENANT KNOWLEDGE BASE:
${knowledgeContext || 'No tenant-specific knowledge provided. Use general automation best practices.'}

WORKFLOW GENERATION RULES:
1. Always start with a trigger (webhook, schedule, email, form_submit, or file_upload)
2. Include logical action steps (email, slack, webhook, database, file_operation, ai_process)
3. Add conditions when logic branching is needed
4. Ensure steps are properly connected with realistic configurations
5. Position steps in a logical flow layout
6. Consider tenant-specific integrations and preferences
7. Generate enterprise-grade workflows suitable for MASP providers

AVAILABLE INTEGRATIONS: Email, Slack, Webhooks, Databases, File Operations, AI Processing, CRM Systems, Marketing Tools

RESPONSE FORMAT: Return only valid JSON with this structure:
{
  "workflow": {
    "name": "string",
    "description": "string", 
    "status": "draft",
    "steps": [/* WorkflowStep array with proper positioning */]
  },
  "explanation": "string explaining how this workflow addresses the tenant's needs",
  "suggestions": ["string array of optimization suggestions"]
}

Generate a complete, executable workflow for: "${prompt}"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
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