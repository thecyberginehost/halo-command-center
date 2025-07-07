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

    // Check if this is a search query
    const isSearchQuery = message.toLowerCase().includes("find") || 
                         message.toLowerCase().includes("search") || 
                         message.toLowerCase().includes("locate") ||
                         message.toLowerCase().includes("where is") ||
                         message.toLowerCase().includes("can't find") ||
                         message.toLowerCase().includes("cannot find");

    // Get tenant-specific data for context
    let tenantContext = '';
    let workflowStats = '';
    let systemKnowledge = '';
    let searchResults = '';
    
    // Get system knowledge base (general HALO/MASP knowledge)
    const { data: systemKB } = await supabase
      .from('system_knowledge_base')
      .select('category, title, content, priority')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(15); // Get top 15 most important knowledge entries

    if (systemKB && systemKB.length > 0) {
      systemKnowledge = `
HALO SYSTEM KNOWLEDGE BASE:
${systemKB.map(kb => `[${kb.category.toUpperCase()}] ${kb.title}: ${kb.content}`).join('\n\n')}
`;
    }
    
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

        // Perform search if this is a search query
        if (isSearchQuery) {
          const searchTerms = message.toLowerCase()
            .replace(/find|search|locate|where is|can't find|cannot find|the|a|an/g, '')
            .trim();

          if (searchTerms) {
            // Search workflows
            const { data: foundWorkflows } = await supabase
              .from('workflows')
              .select('id, name, description, status')
              .eq('tenant_id', tenantId)
              .or(`name.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%`)
              .limit(5);

            // Search knowledge base entries
            const { data: foundKnowledge } = await supabase
              .from('tenant_knowledge_bases')
              .select('id, title, content, category')
              .eq('tenant_id', tenantId)
              .or(`title.ilike.%${searchTerms}%,content.ilike.%${searchTerms}%`)
              .limit(3);

            if (foundWorkflows && foundWorkflows.length > 0) {
              searchResults += `\nFOUND WORKFLOWS:\n`;
              foundWorkflows.forEach(workflow => {
                searchResults += `- "${workflow.name}" (${workflow.status}) - [CLICK TO GO TO AUTOMATIONS](/automations)\n`;
                if (workflow.description) {
                  searchResults += `  Description: ${workflow.description.substring(0, 100)}...\n`;
                }
              });
            }

            if (foundKnowledge && foundKnowledge.length > 0) {
              searchResults += `\nFOUND KNOWLEDGE ENTRIES:\n`;
              foundKnowledge.forEach(kb => {
                searchResults += `- "${kb.title}" (${kb.category}) - Available in knowledge base\n`;
                searchResults += `  Content: ${kb.content.substring(0, 100)}...\n`;
              });
            }

            if (!foundWorkflows?.length && !foundKnowledge?.length) {
              searchResults = `\nSEARCH RESULTS: No items found matching "${searchTerms}" in workflows or knowledge base.`;
            }
          }
        }
      }
    }

    const pageContext = context?.currentPage ? `CURRENT PAGE: ${context.currentPage}\n` : '';

    const systemPrompt = `You are Resonant Directive, the AI automation assistant for HALO - a professional automation platform for MASP (Managed Automation Service Provider) certified professionals.

${systemKnowledge}

CURRENT SESSION CONTEXT:
${tenantContext}${pageContext}${workflowStats}${searchResults}

PERSONALITY & ROLE:
- Expert automation engineer with deep knowledge of HALO platform capabilities
- Proactive in identifying automation opportunities and optimization potential
- Professional consultant tone suitable for enterprise MASP providers
- Comprehensive understanding of multi-tenant architecture and client management
- Expert in integration ecosystem and workflow design patterns

RESPONSE GUIDELINES:
- Provide specific, actionable advice based on HALO's actual capabilities
- Reference system knowledge when explaining platform features or limitations
- Suggest workflows using available integrations and proven patterns
- Offer troubleshooting guidance based on common issues database
- Consider industry-specific requirements when relevant (healthcare, finance, etc.)
- Keep responses focused and professional (2-4 sentences for quick questions, longer for complex topics)
- When users search for items, provide direct navigation links to help them find what they need
- For found workflows, direct users to "/automations" page and mention they can search for the specific workflow name
- If items don't exist, clearly state this and offer to help create them

CAPABILITIES I EXCEL AT:
- Analyzing workflow performance using HALO's monitoring capabilities
- Designing enterprise-grade automation workflows with proper error handling
- Recommending optimal integration patterns from HALO's ecosystem
- Troubleshooting automation issues using systematic problem-solving approaches
- Providing MASP provider guidance for client management and billing optimization
- Industry-specific automation advice (healthcare, financial, e-commerce compliance)

Current user context: ${context ? JSON.stringify(context) : 'General consultation mode'}`;
    

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
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
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