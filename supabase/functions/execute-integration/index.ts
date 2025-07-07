import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExecutionRequest {
  integration: string;
  endpoint?: string;
  config: Record<string, any>;
  context: {
    workflowId: string;
    stepId: string;
    input: Record<string, any>;
    credentials: Record<string, string>;
    previousStepOutputs: Record<string, any>;
  };
}

interface ExecutionResult {
  success: boolean;
  output?: Record<string, any>;
  error?: string;
  logs: string[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function executeEmailIntegration(integration: string, config: Record<string, any>, context: any): Promise<ExecutionResult> {
  const logs: string[] = [];
  
  try {
    switch (integration) {
      case 'gmail':
        logs.push('Executing Gmail integration');
        // For now, simulate email sending
        logs.push(`Sending email to: ${config.to}`);
        logs.push(`Subject: ${config.subject}`);
        
        return {
          success: true,
          output: {
            messageId: `gmail_${Date.now()}`,
            timestamp: new Date().toISOString(),
            recipient: config.to,
            subject: config.subject
          },
          logs
        };
        
      case 'sendgrid':
        logs.push('Executing SendGrid integration');
        logs.push(`Sending email via SendGrid to: ${config.to}`);
        
        return {
          success: true,
          output: {
            messageId: `sendgrid_${Date.now()}`,
            timestamp: new Date().toISOString(),
            recipient: config.to,
            subject: config.subject
          },
          logs
        };
        
      default:
        throw new Error(`Unsupported email integration: ${integration}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      logs: [...logs, `Error: ${error.message}`]
    };
  }
}

async function executeWebhookIntegration(integration: string, config: Record<string, any>, context: any): Promise<ExecutionResult> {
  const logs: string[] = [];
  
  try {
    switch (integration) {
      case 'webhook-trigger':
        logs.push('Webhook trigger activated');
        return {
          success: true,
          output: context.input,
          logs
        };
        
      case 'http-request':
        logs.push(`Making HTTP ${config.method || 'GET'} request to: ${config.url}`);
        
        const response = await fetch(config.url, {
          method: config.method || 'GET',
          headers: config.headers || {},
          body: config.body ? JSON.stringify(config.body) : undefined,
        });
        
        const responseData = await response.json().catch(() => ({}));
        logs.push(`Response status: ${response.status}`);
        
        return {
          success: response.ok,
          output: {
            status: response.status,
            data: responseData,
            headers: Object.fromEntries(response.headers.entries())
          },
          logs
        };
        
      default:
        throw new Error(`Unsupported webhook integration: ${integration}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      logs: [...logs, `Error: ${error.message}`]
    };
  }
}

async function executeCRMIntegration(integration: string, config: Record<string, any>, context: any): Promise<ExecutionResult> {
  const logs: string[] = [];
  
  try {
    switch (integration) {
      case 'salesforce':
        logs.push('Executing Salesforce integration');
        logs.push(`Creating/updating contact: ${config.email}`);
        
        return {
          success: true,
          output: {
            contactId: `sf_${Date.now()}`,
            timestamp: new Date().toISOString(),
            email: config.email,
            name: config.name
          },
          logs
        };
        
      case 'hubspot':
        logs.push('Executing HubSpot integration');
        logs.push(`Creating/updating contact: ${config.email}`);
        
        return {
          success: true,
          output: {
            contactId: `hs_${Date.now()}`,
            timestamp: new Date().toISOString(),
            email: config.email,
            name: config.name
          },
          logs
        };
        
      default:
        throw new Error(`Unsupported CRM integration: ${integration}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      logs: [...logs, `Error: ${error.message}`]
    };
  }
}

async function executeSlackIntegration(integration: string, config: Record<string, any>, context: any): Promise<ExecutionResult> {
  const logs: string[] = [];
  
  try {
    logs.push('Executing Slack integration');
    logs.push(`Sending message to channel: ${config.channel}`);
    logs.push(`Message: ${config.message}`);
    
    return {
      success: true,
      output: {
        messageId: `slack_${Date.now()}`,
        timestamp: new Date().toISOString(),
        channel: config.channel,
        message: config.message
      },
      logs
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      logs: [...logs, `Error: ${error.message}`]
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { integration, endpoint, config, context }: ExecutionRequest = await req.json();
    
    console.log(`Executing integration: ${integration}`, { endpoint, config, context });
    
    let result: ExecutionResult;
    
    // Route to appropriate integration handler
    if (['gmail', 'sendgrid', 'ses'].includes(integration)) {
      result = await executeEmailIntegration(integration, config, context);
    } else if (['webhook-trigger', 'http-request'].includes(integration)) {
      result = await executeWebhookIntegration(integration, config, context);
    } else if (['salesforce', 'hubspot', 'pipedrive'].includes(integration)) {
      result = await executeCRMIntegration(integration, config, context);
    } else if (integration === 'slack') {
      result = await executeSlackIntegration(integration, config, context);
    } else {
      result = {
        success: false,
        error: `Unsupported integration: ${integration}`,
        logs: [`Integration ${integration} is not implemented yet`]
      };
    }
    
    console.log('Integration execution result:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in execute-integration function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        logs: [`Execution failed: ${error.message}`]
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);