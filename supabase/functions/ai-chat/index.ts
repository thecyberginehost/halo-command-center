import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  tenantId?: string;
  context?: {
    currentPage?: string;
    workflowCount?: number;
    recentWorkflows?: Array<{
      id: string;
      name: string;
      status: string;
      last_executed?: string;
    }>;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
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

    const { message, tenantId, context, conversationHistory = [] }: ChatRequest = await req.json();

    // Get tenant-specific data for context
    let tenantContext = '';
    let workflowStats = '';
    
    if (tenantId) {
      // Get tenant info
      const { data: tenant } = await supabase
        .from('tenants')
        .select('name, settings')
        .eq('id', tenantId)
        .single();

      if (tenant) {
        tenantContext = `TENANT: ${tenant.name}\n`;
      }

      // Get workflow statistics
      const { data: workflows } = await supabase
        .from('workflows')
        .select('id, name, status, execution_count, last_executed, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (workflows && workflows.length > 0) {
        const activeCount = workflows.filter(w => w.status === 'active').length;
        const totalExecutions = workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0);
        
        workflowStats = `
WORKFLOW STATISTICS:
- Total workflows: ${workflows.length}
- Active workflows: ${activeCount}
- Total executions: ${totalExecutions}
- Recent workflows: ${workflows.slice(0, 3).map(w => `${w.name} (${w.status})`).join(', ')}
`;

        // Get knowledge base
        const { data: knowledgeBase } = await supabase
          .from('tenant_knowledge_bases')
          .select('title, content, category')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (knowledgeBase && knowledgeBase.length > 0) {
          tenantContext += `KNOWLEDGE BASE:\n${knowledgeBase
            .map(kb => `- ${kb.title} (${kb.category}): ${kb.content.substring(0, 200)}...`)
            .join('\n')}\n`;
        }
      }
    }

    const pageContext = context?.currentPage ? `CURRENT PAGE: ${context.currentPage}\n` : '';

    const systemPrompt = `You are Resonant Directive, the AI automation assistant for HALO - a professional automation platform for MASP (Managed Automation Service Provider) certified professionals.

${tenantContext}${pageContext}${workflowStats}

PERSONALITY & CAPABILITIES:
- Expert in workflow automation, process optimization, and system integration
- Proactive in suggesting automation opportunities and optimizations
- Professional but friendly tone suitable for enterprise users
- Can analyze workflow performance and suggest improvements
- Monitors automations and provides insights
- Helps create new workflows and optimize existing ones

RESPONSE GUIDELINES:
- Keep responses concise but informative (2-4 sentences typically)
- Provide actionable insights based on tenant's current automation state
- Suggest specific improvements when relevant
- Offer to help create workflows when automation opportunities are mentioned
- Reference actual workflow data when available
- Use professional language appropriate for business automation context

CAPABILITIES I CAN HELP WITH:
- Analyzing workflow performance and suggesting optimizations
- Creating new automation workflows from natural language descriptions
- Troubleshooting automation issues and debugging workflows
- Recommending integration opportunities and process improvements
- Monitoring system health and automation metrics
- Providing insights on automation best practices for MASP providers

Current user context: ${context ? JSON.stringify(context) : 'No specific context provided'}`;

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Log the conversation for analytics (optional)
    if (tenantId) {
      console.log(`Chat interaction for tenant ${tenantId}: ${message.substring(0, 50)}...`);
    }

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      context: {
        workflowCount: context?.workflowCount || 0,
        currentPage: context?.currentPage || 'unknown'
      }
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallbackMessage: "I'm having trouble connecting right now. Let me help you with workflow automation - what would you like to work on?"
      }),
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