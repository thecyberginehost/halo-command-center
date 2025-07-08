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
    currentWorkflow?: {
      id: string;
      name: string;
      description?: string;
      steps: any[];
    };
    currentWorkflowNodes?: any[];
    currentWorkflowEdges?: any[];
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
  requestType?: 'chat' | 'build_workflow' | 'analyze_workflow' | 'suggest_optimization';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API Key found:', !!openAIApiKey);
    console.log('API Key length:', openAIApiKey?.length || 0);
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { message, tenantId, context, conversationHistory = [], requestType = 'chat' }: ChatRequest = await req.json();

    // Detect workflow building intents and search queries first
    const isWorkflowRequest = requestType === 'build_workflow' || 
                             message.toLowerCase().includes("create") ||
                             message.toLowerCase().includes("build") ||
                             message.toLowerCase().includes("make") ||
                             message.toLowerCase().includes("add") ||
                             message.toLowerCase().includes("workflow") ||
                             message.toLowerCase().includes("automation") ||
                             message.toLowerCase().includes("when") ||
                             message.toLowerCase().includes("if") ||
                             message.toLowerCase().includes("trigger");

    const isSearchQuery = message.toLowerCase().includes("find") || 
                          message.toLowerCase().includes("search") || 
                          message.toLowerCase().includes("locate") ||
                          message.toLowerCase().includes("where is") ||
                          message.toLowerCase().includes("can't find") ||
                          message.toLowerCase().includes("cannot find");

    // Get current workflow context for analysis
    let currentWorkflowAnalysis = '';
    if (context?.currentWorkflow) {
      const workflow = context.currentWorkflow;
      const nodeCount = context.currentWorkflowNodes?.length || 0;
      const connectionCount = context.currentWorkflowEdges?.length || 0;
      
      currentWorkflowAnalysis = `
CURRENT WORKFLOW ANALYSIS:
- Name: ${workflow.name}
- Description: ${workflow.description || 'No description'}
- Nodes: ${nodeCount} (${context.currentWorkflowNodes?.map(n => n.data?.integration?.name).join(', ') || 'none'})
- Connections: ${connectionCount}
- Steps in database: ${Array.isArray(workflow.steps) ? workflow.steps.length : 0}
`;
    }

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

    const systemPrompt = `You are Resonant Directive, the advanced AI workflow builder for HALO - superior to make.com's AI builder in every way.

${systemKnowledge}

CURRENT SESSION CONTEXT:
${tenantContext}${pageContext}${workflowStats}${currentWorkflowAnalysis}${searchResults}

PERSONALITY & ROLE:
- Master automation architect with comprehensive knowledge of HALO platform
- Expert at analyzing existing workflows and building new ones from natural language
- Can generate complete workflow nodes with proper configurations
- Proactive in suggesting optimizations and best practices
- Professional consultant for MASP providers managing enterprise automation
- Deep understanding of integration patterns, triggers, and data flow

WORKFLOW BUILDING CAPABILITIES:
- Generate complete workflow JSON with nodes and connections based on user prompts
- Analyze existing workflows to understand their purpose and suggest improvements
- Recommend optimal integration sequences and data transformations
- Create complex branching logic and error handling patterns
- Suggest trigger conditions and scheduling configurations

AVAILABLE INTEGRATIONS (for building workflows):
- Triggers: webhook, form_submit, schedule, email_received, file_upload
- Communication: email, slack, teams, sms, discord
- CRM: salesforce, hubspot, pipedrive, airtable
- Database: mysql, postgresql, mongodb, supabase
- File Storage: google_drive, dropbox, aws_s3, sharepoint
- AI & ML: openai, anthropic, azure_cognitive, google_ai
- Analytics: google_analytics, mixpanel, amplitude
- Payments: stripe, paypal, square
- Productivity: google_sheets, microsoft_office, notion, trello
- Developer Tools: github, gitlab, jenkins, docker

WORKFLOW BUILDING INSTRUCTIONS:
When user requests workflow creation, respond with:
1. A clear explanation of what the workflow will do
2. **IMPORTANT**: Include a JSON structure with this EXACT format:

\`\`\`json
{
  "action": "build_workflow",
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger",
      "integration": "webhook",
      "name": "Form Submission",
      "position": { "x": 100, "y": 100 },
      "config": {
        "webhook_url": "auto-generated",
        "method": "POST"
      }
    },
    {
      "id": "node_2", 
      "type": "action",
      "integration": "email",
      "name": "Send Welcome Email",
      "position": { "x": 300, "y": 100 },
      "config": {
        "to": "{{form.email}}",
        "subject": "Welcome!",
        "template": "welcome_template"
      }
    }
  ],
  "connections": [
    {
      "source": "node_1",
      "target": "node_2"
    }
  ]
}
\`\`\`

RESPONSE GUIDELINES:
- Always provide specific, actionable workflow solutions
- When building workflows, include the JSON structure AND explanation
- Analyze current workflows and suggest specific improvements with examples
- Reference available integrations when recommending solutions  
- Consider error handling, data validation, and performance optimization
- Provide step-by-step implementation guidance
- Format navigation help like: "Here's the direct link: [CLICK TO GO TO AUTOMATIONS](/automations)"
- Available pages: /automations, /, /credentials, /ai-assist, /docs

CAPABILITIES I EXCEL AT:
- Building complete workflows from natural language descriptions
- Analyzing workflow performance and suggesting optimizations
- Designing enterprise-grade automation patterns with proper error handling
- Recommending optimal integration combinations for specific use cases
- Troubleshooting automation issues with systematic debugging approaches
- MASP provider guidance for client automation strategies

Current user context: ${context ? JSON.stringify(context, null, 2) : 'General consultation mode'}

REQUEST TYPE: ${requestType}`;
    

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
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Parse workflow building instructions
    let workflowData = null;
    const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        workflowData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.log('Failed to parse workflow JSON:', e);
      }
    }

    // Log the conversation for analytics (optional)
    if (tenantId) {
      console.log(`Chat interaction for tenant ${tenantId}: ${message.substring(0, 50)}...`);
    }

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      workflowData: workflowData,
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