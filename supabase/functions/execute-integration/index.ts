import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { integrationId, action, parameters, credentials, tenantId } = body;

    console.log(`Executing integration: ${integrationId}, action: ${action} for tenant: ${tenantId}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log execution start
    const executionId = crypto.randomUUID();
    await supabase.from('integration_executions').insert({
      id: executionId,
      tenant_id: tenantId,
      integration_id: integrationId,
      input: { action, parameters },
      status: 'running',
      started_at: new Date().toISOString()
    });

    let result;
    
    try {
      // Route to appropriate integration handler
      switch (integrationId) {
        case 'salesforce-connector':
        case 'salesforce':
          result = await executeSalesforce(action, parameters, credentials);
          break;
        case 'hubspot-connector':
        case 'hubspot':
          result = await executeHubSpot(action, parameters, credentials);
          break;
        case 'slack-connector':
        case 'slack':
          result = await executeSlack(action, parameters, credentials);
          break;
        case 'gmail-connector':
        case 'gmail':
          result = await executeGmail(action, parameters, credentials);
          break;
        case 'openai-connector':
        case 'openai':
          result = await executeOpenAI(action, parameters, credentials);
          break;
        case 'webhook-connector':
        case 'webhook':
          result = await executeWebhook(action, parameters, credentials);
          break;
        default:
          throw new Error(`Integration ${integrationId} not implemented yet`);
      }

      // Log successful execution
      await supabase.from('integration_executions').update({
        status: 'completed',
        output: result,
        completed_at: new Date().toISOString(),
        duration: Date.now() - new Date().getTime()
      }).eq('id', executionId);

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          executionId,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (integrationError) {
      // Log failed execution
      await supabase.from('integration_executions').update({
        status: 'failed',
        error: integrationError.message,
        completed_at: new Date().toISOString(),
        duration: Date.now() - new Date().getTime()
      }).eq('id', executionId);

      throw integrationError;
    }

  } catch (error) {
    console.error('Integration execution error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function executeSalesforce(action: string, params: any, credentials: any) {
  console.log('Executing Salesforce action:', action);
  
  if (!credentials?.access_token) {
    throw new Error('Salesforce credentials required (access_token)');
  }

  const baseUrl = credentials.instance_url || 'https://login.salesforce.com';
  
  switch (action) {
    case 'create-lead':
      const leadResponse = await fetch(`${baseUrl}/services/data/v59.0/sobjects/Lead/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          FirstName: params.firstName,
          LastName: params.lastName,
          Company: params.company,
          Email: params.email,
          Status: 'Open - Not Contacted'
        })
      });
      
      if (!leadResponse.ok) {
        const error = await leadResponse.text();
        throw new Error(`Salesforce API error: ${error}`);
      }
      
      return await leadResponse.json();
      
    case 'get-leads':
      const leadsResponse = await fetch(`${baseUrl}/services/data/v59.0/query/?q=SELECT Id,FirstName,LastName,Company,Email,Status FROM Lead LIMIT 10`, {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`
        }
      });
      
      if (!leadsResponse.ok) {
        throw new Error('Failed to fetch leads from Salesforce');
      }
      
      return await leadsResponse.json();
      
    default:
      return { message: `Salesforce ${action} simulated`, params };
  }
}

async function executeHubSpot(action: string, params: any, credentials: any) {
  console.log('Executing HubSpot action:', action);
  
  if (!credentials?.api_key) {
    throw new Error('HubSpot API key required');
  }
  
  switch (action) {
    case 'create-contact':
      const contactResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            firstname: params.firstName,
            lastname: params.lastName,
            email: params.email,
            company: params.company
          }
        })
      });
      
      if (!contactResponse.ok) {
        const error = await contactResponse.text();
        throw new Error(`HubSpot API error: ${error}`);
      }
      
      return await contactResponse.json();
      
    default:
      return { message: `HubSpot ${action} simulated`, params };
  }
}

async function executeSlack(action: string, params: any, credentials: any) {
  console.log('Executing Slack action:', action);
  
  if (!credentials?.access_token) {
    throw new Error('Slack access token required');
  }
  
  switch (action) {
    case 'send-message':
      const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: params.channel,
          text: params.text,
          username: params.username || 'HALO Bot'
        })
      });
      
      if (!messageResponse.ok) {
        const error = await messageResponse.text();
        throw new Error(`Slack API error: ${error}`);
      }
      
      return await messageResponse.json();
      
    default:
      return { message: `Slack ${action} simulated`, params };
  }
}

async function executeGmail(action: string, params: any, credentials: any) {
  console.log('Executing Gmail action:', action);
  
  if (!credentials?.access_token) {
    throw new Error('Gmail access token required');
  }
  
  switch (action) {
    case 'send-email':
      // Gmail API requires base64 encoded email
      const email = `To: ${params.to}\nSubject: ${params.subject}\n\n${params.body}`;
      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_');
      
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: encodedEmail
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gmail API error: ${error}`);
      }
      
      return await response.json();
      
    default:
      return { message: `Gmail ${action} simulated`, params };
  }
}

async function executeOpenAI(action: string, params: any, credentials: any) {
  console.log('Executing OpenAI action:', action);
  
  const apiKey = credentials?.api_key || Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key required');
  }
  
  switch (action) {
    case 'generate-text':
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: params.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: params.systemPrompt || 'You are a helpful assistant.' },
            { role: 'user', content: params.prompt }
          ],
          max_tokens: params.maxTokens || 1000
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }
      
      const result = await response.json();
      return {
        text: result.choices[0].message.content,
        usage: result.usage
      };
      
    default:
      return { message: `OpenAI ${action} simulated`, params };
  }
}

async function executeWebhook(action: string, params: any, credentials: any) {
  console.log('Executing Webhook action:', action);
  
  switch (action) {
    case 'http-request':
      const requestOptions: RequestInit = {
        method: params.method || 'GET',
        headers: params.headers || {}
      };
      
      if (params.body && params.method !== 'GET') {
        requestOptions.body = typeof params.body === 'string' ? params.body : JSON.stringify(params.body);
        requestOptions.headers = { ...requestOptions.headers, 'Content-Type': 'application/json' };
      }
      
      if (credentials?.auth_header) {
        requestOptions.headers = { ...requestOptions.headers, 'Authorization': credentials.auth_header };
      }
      
      const response = await fetch(params.url, requestOptions);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      };
      
    default:
      return { message: `Webhook ${action} simulated`, params };
  }
}
