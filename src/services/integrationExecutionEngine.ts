import { supabase } from '@/integrations/supabase/client';
import { AuthenticationService } from './authenticationService';
import { DataTransformationService } from './dataTransformationService';
import { webhookService } from './webhookService';
import { IntegrationNode } from '@/types/integrations';

export interface ExecutionContext {
  tenantId: string;
  workflowId: string;
  executionId: string;
  userId?: string;
  previousStepOutput?: any;
  globalData?: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    duration: number;
    httpStatus?: number;
    requestId?: string;
    retryCount?: number;
  };
}

export interface IntegrationAuth {
  credentialId: string;
  authType: 'oauth' | 'api_key' | 'basic' | 'bearer' | 'custom';
  credentials: Record<string, any>;
}

export class IntegrationExecutionEngine {
  private authService = new AuthenticationService();
  private dataTransformService = new DataTransformationService();
  
  /**
   * Execute an integration node with full error handling and retry logic
   */
  async executeIntegration(
    integration: IntegrationNode,
    parameters: Record<string, any>,
    auth: IntegrationAuth,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    let retryCount = 0;
    const maxRetries = 3; // Default retry count
    
    // Log execution start
    await this.logExecution(context, 'INFO', `Starting execution of ${integration.name}`, {
      integrationId: integration.id,
      parameters: Object.keys(parameters)
    });

    while (retryCount <= maxRetries) {
      try {
        // Validate parameters
        const validationResult = await this.validateParameters(integration, parameters);
        if (!validationResult.valid) {
          throw new Error(`Parameter validation failed: ${validationResult.errors.join(', ')}`);
        }

        // Use parameters as-is for now (simplified for implementation)
        const transformedParams = parameters;

        // Execute based on integration type
        let result: ExecutionResult;
        
        switch (integration.type) {
          case 'trigger':
            result = await this.executeTrigger(integration, transformedParams, auth, context);
            break;
          case 'action':
            result = await this.executeAction(integration, transformedParams, auth, context);
            break;
          case 'condition':
            result = await this.executeCondition(integration, transformedParams, context);
            break;
          case 'data_transform':
            result = await this.executeDataTransform(integration, transformedParams, context);
            break;
          default:
            throw new Error(`Unsupported integration type: ${integration.type}`);
        }

        if (result.success) {
          const duration = Date.now() - startTime;
          await this.logExecution(context, 'INFO', `Successfully executed ${integration.name}`, {
            duration,
            outputKeys: result.data ? Object.keys(result.data) : []
          });
          
          return {
            ...result,
            metadata: {
              ...result.metadata,
              duration,
              retryCount
            }
          };
        } else {
          throw new Error(result.error || 'Execution failed');
        }

      } catch (error) {
        retryCount++;
        const errorMessage = error.message || 'Unknown error';
        
        await this.logExecution(context, 'ERROR', `Execution failed (attempt ${retryCount}): ${errorMessage}`, {
          error: errorMessage,
          retryCount
        });

        if (retryCount > maxRetries || !this.isRetryableError(error)) {
          return {
            success: false,
            error: errorMessage,
            metadata: {
              duration: Date.now() - startTime,
              retryCount: retryCount - 1
            }
          };
        }

        // Exponential backoff
        await this.sleep(Math.pow(2, retryCount - 1) * 1000);
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
      metadata: {
        duration: Date.now() - startTime,
        retryCount: maxRetries
      }
    };
  }

  /**
   * Execute HTTP-based action integrations
   */
  private async executeAction(
    integration: IntegrationNode,
    parameters: Record<string, any>,
    auth: IntegrationAuth,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    if (!integration.endpoints || integration.endpoints.length === 0) {
      throw new Error('No endpoints defined for action integration');
    }

    const endpoint = integration.endpoints[0];
    const baseUrl = this.getServiceBaseUrl(integration.serviceId || integration.id);
    const url = `${baseUrl}${endpoint.path}`;

    // Prepare headers with authentication
    const headers = await this.prepareHeaders(auth, integration);
    
    // Prepare request body
    const requestBody = this.prepareRequestBody(endpoint.method, parameters, integration);

    // Execute HTTP request
    const response = await fetch(url, {
      method: endpoint.method,
      headers,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseData.message || responseData}`);
    }

    // Return response data as-is for now (simplified for implementation)
    const transformedOutput = responseData;

    return {
      success: true,
      data: transformedOutput,
      metadata: {
        duration: 0,
        httpStatus: response.status,
        requestId: response.headers.get('x-request-id') || undefined
      }
    };
  }

  /**
   * Execute trigger integrations (webhooks, polling, etc.)
   */
  private async executeTrigger(
    integration: IntegrationNode,
    parameters: Record<string, any>,
    auth: IntegrationAuth,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    switch (integration.id) {
      case 'webhook-trigger':
        return await this.executeWebhookTrigger(parameters, context);
      case 'schedule-trigger':
        return await this.executeScheduleTrigger(parameters, context);
      case 'email-trigger':
        return await this.executeEmailTrigger(parameters, auth, context);
      default:
        return await this.executePollingTrigger(integration, parameters, auth, context);
    }
  }

  /**
   * Execute condition integrations
   */
  private async executeCondition(
    integration: IntegrationNode,
    parameters: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const condition = parameters.condition || '';
    const value1 = parameters.value1;
    const value2 = parameters.value2;
    const operator = parameters.operator || '==';

    let result = false;

    switch (operator) {
      case '==':
        result = value1 == value2;
        break;
      case '!=':
        result = value1 != value2;
        break;
      case '>':
        result = Number(value1) > Number(value2);
        break;
      case '<':
        result = Number(value1) < Number(value2);
        break;
      case '>=':
        result = Number(value1) >= Number(value2);
        break;
      case '<=':
        result = Number(value1) <= Number(value2);
        break;
      case 'contains':
        result = String(value1).includes(String(value2));
        break;
      case 'regex':
        result = new RegExp(value2).test(String(value1));
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }

    return {
      success: true,
      data: {
        result,
        condition: `${value1} ${operator} ${value2}`,
        metadata: {
          value1,
          value2,
          operator
        }
      }
    };
  }

  /**
   * Execute data transformation integrations
   */
  private async executeDataTransform(
    integration: IntegrationNode,
    parameters: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const transformationType = integration.id;
    const inputData = parameters.inputData || context.previousStepOutput;

    let result;

    switch (transformationType) {
      case 'data-transform':
        result = await this.dataTransformService.transform(
          inputData,
          parameters.transformations || [],
          {
            input: inputData,
            previousStepOutputs: context.previousStepOutput || {},
            variables: context.globalData || {}
          }
        );
        break;
      case 'json-processor':
        result = await this.processJsonData(inputData, parameters);
        break;
      case 'calculator':
        result = await this.calculateExpression(parameters.expression, inputData);
        break;
      default:
        throw new Error(`Unsupported data transformation: ${transformationType}`);
    }

    return {
      success: true,
      data: result
    };
  }

  /**
   * Webhook trigger execution
   */
  private async executeWebhookTrigger(
    parameters: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Register webhook endpoint if not exists
    const webhookConfig = {
      url: parameters.webhookUrl,
      method: parameters.method || 'POST',
      headers: parameters.headers || { 'Content-Type': 'application/json' },
      timeout: parameters.timeout || 30000,
      retries: parameters.retries || 3,
      isActive: true,
      workflowId: context.workflowId,
      tenantId: context.tenantId
    };

    const webhook = await webhookService.registerWebhook(webhookConfig);

    return {
      success: true,
      data: {
        webhookId: webhook.id,
        webhookUrl: webhook.url,
        status: 'registered'
      }
    };
  }

  /**
   * Polling trigger execution
   */
  private async executePollingTrigger(
    integration: IntegrationNode,
    parameters: Record<string, any>,
    auth: IntegrationAuth,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // This would implement polling logic for various services
    // For now, return mock data
    return {
      success: true,
      data: {
        pollingInterval: parameters.interval || 300000,
        lastPoll: new Date().toISOString(),
        status: 'active'
      }
    };
  }

  /**
   * Validate integration parameters
   */
  private async validateParameters(
    integration: IntegrationNode,
    parameters: Record<string, any>
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!integration.fields) {
      return { valid: true, errors: [] };
    }

    for (const field of integration.fields) {
      if (field.required && (!parameters[field.name] || parameters[field.name] === '')) {
        errors.push(`Required field '${field.label}' is missing`);
      }

      if (parameters[field.name] && field.type === 'number' && isNaN(Number(parameters[field.name]))) {
        errors.push(`Field '${field.label}' must be a number`);
      }

      if (parameters[field.name] && field.name.includes('email') && !this.isValidEmail(parameters[field.name])) {
        errors.push(`Field '${field.label}' must be a valid email address`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepare HTTP headers with authentication
   */
  private async prepareHeaders(auth: IntegrationAuth, integration: IntegrationNode): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'HALO-Automation-Platform/1.0'
    };

    switch (auth.authType) {
      case 'api_key':
        if (integration.serviceId === 'hubspot') {
          headers['Authorization'] = `Bearer ${auth.credentials.apiKey}`;
        } else if (integration.serviceId === 'pipedrive') {
          headers['Authorization'] = `Bearer ${auth.credentials.apiKey}`;
        } else {
          headers['X-API-Key'] = auth.credentials.apiKey;
        }
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${auth.credentials.token}`;
        break;
      case 'basic':
        const credentials = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
      case 'oauth':
        const accessToken = auth.credentials.accessToken || auth.credentials.token;
        headers['Authorization'] = `Bearer ${accessToken}`;
        break;
    }

    return headers;
  }

  /**
   * Prepare request body based on method and parameters
   */
  private prepareRequestBody(
    method: string,
    parameters: Record<string, any>,
    integration: IntegrationNode
  ): any {
    if (method === 'GET' || method === 'DELETE') {
      return null;
    }

    // Service-specific body formatting
    switch (integration.serviceId) {
      case 'salesforce':
        return this.formatSalesforceBody(parameters, integration.actionId || '');
      case 'hubspot':
        return this.formatHubSpotBody(parameters, integration.actionId || '');
      case 'pipedrive':
        return this.formatPipedriveBody(parameters, integration.actionId || '');
      default:
        return parameters;
    }
  }

  /**
   * Format request body for Salesforce API
   */
  private formatSalesforceBody(parameters: Record<string, any>, actionId: string): any {
    switch (actionId) {
      case 'create_lead':
        return {
          FirstName: parameters.firstName,
          LastName: parameters.lastName,
          Email: parameters.email,
          Company: parameters.company,
          Phone: parameters.phone
        };
      case 'create_contact':
        return {
          FirstName: parameters.firstName,
          LastName: parameters.lastName,
          Email: parameters.email,
          AccountId: parameters.accountId
        };
      case 'create_opportunity':
        return {
          Name: parameters.name,
          Amount: parameters.amount,
          CloseDate: parameters.closeDate,
          StageName: parameters.stageName
        };
      default:
        return parameters;
    }
  }

  /**
   * Format request body for HubSpot API
   */
  private formatHubSpotBody(parameters: Record<string, any>, actionId: string): any {
    switch (actionId) {
      case 'create_contact':
      case 'update_contact':
        return {
          properties: {
            email: parameters.email,
            firstname: parameters.firstname,
            lastname: parameters.lastname,
            phone: parameters.phone,
            company: parameters.company
          }
        };
      case 'create_deal':
        return {
          properties: {
            dealname: parameters.dealname,
            amount: parameters.amount,
            dealstage: parameters.dealstage,
            pipeline: parameters.pipeline
          }
        };
      default:
        return parameters;
    }
  }

  /**
   * Format request body for Pipedrive API
   */
  private formatPipedriveBody(parameters: Record<string, any>, actionId: string): any {
    // Pipedrive typically uses direct parameter mapping
    return parameters;
  }

  /**
   * Get base URL for different services
   */
  private getServiceBaseUrl(serviceId: string): string {
    const baseUrls: Record<string, string> = {
      salesforce: 'https://api.salesforce.com',
      hubspot: 'https://api.hubapi.com',
      pipedrive: 'https://api.pipedrive.com/v1',
      slack: 'https://slack.com/api',
      gmail: 'https://gmail.googleapis.com',
      stripe: 'https://api.stripe.com/v1',
      shopify: 'https://api.shopify.com',
      woocommerce: 'https://api.woocommerce.com',
      twitter: 'https://api.twitter.com/2',
      linkedin: 'https://api.linkedin.com/v2',
      facebook: 'https://graph.facebook.com/v18.0',
      instagram: 'https://graph.instagram.com',
      mailchimp: 'https://api.mailchimp.com/3.0',
      sendgrid: 'https://api.sendgrid.com/v3',
      twilio: 'https://api.twilio.com',
      aws: 'https://api.aws.com',
      google: 'https://www.googleapis.com',
      microsoft: 'https://graph.microsoft.com/v1.0'
    };

    return baseUrls[serviceId] || `https://api.${serviceId}.com`;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryablePatterns = [
      /timeout/i,
      /network/i,
      /connection/i,
      /429/,  // Rate limit
      /502/,  // Bad Gateway
      /503/,  // Service Unavailable
      /504/   // Gateway Timeout
    ];

    const errorMessage = error.message || error.toString();
    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  }

  /**
   * Process JSON data
   */
  private async processJsonData(inputData: any, parameters: Record<string, any>): Promise<any> {
    const operation = parameters.operation || 'parse';
    
    switch (operation) {
      case 'parse':
        return typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
      case 'stringify':
        return JSON.stringify(inputData, null, parameters.indent || 0);
      case 'extract':
        return this.extractJsonPath(inputData, parameters.path || '');
      case 'merge':
        return { ...inputData, ...parameters.mergeData };
      default:
        throw new Error(`Unsupported JSON operation: ${operation}`);
    }
  }

  /**
   * Calculate mathematical expression
   */
  private async calculateExpression(expression: string, context: any): Promise<number> {
    // Simple expression evaluator (in production, use a proper parser)
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
    try {
      return Function(`"use strict"; return (${sanitizedExpression})`)();
    } catch (error) {
      throw new Error(`Invalid expression: ${expression}`);
    }
  }

  /**
   * Extract value from JSON using path notation
   */
  private extractJsonPath(data: any, path: string): any {
    const parts = path.split('.');
    let current = data;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Log execution events
   */
  private async logExecution(
    context: ExecutionContext,
    level: string,
    message: string,
    data?: any
  ): Promise<void> {
    await supabase.from('execution_logs').insert({
      execution_id: context.executionId,
      step_id: `${context.workflowId}-${Date.now()}`,
      level,
      message,
      data: data || null
    });
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Email trigger execution
  private async executeEmailTrigger(
    parameters: Record<string, any>,
    auth: IntegrationAuth,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Implementation for email triggers (IMAP polling, etc.)
    return {
      success: true,
      data: {
        triggerType: 'email',
        status: 'listening',
        config: parameters
      }
    };
  }

  // Schedule trigger execution  
  private async executeScheduleTrigger(
    parameters: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Implementation for schedule triggers (cron jobs, intervals)
    return {
      success: true,
      data: {
        triggerType: 'schedule',
        schedule: parameters.schedule || '*/5 * * * *',
        nextRun: new Date(Date.now() + 300000).toISOString()
      }
    };
  }
}

export const integrationExecutionEngine = new IntegrationExecutionEngine();