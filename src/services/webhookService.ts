import { supabase } from '@/integrations/supabase/client';

export interface WebhookConfig {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: string;
  timeout: number;
  retries: number;
  isActive: boolean;
  workflowId: string;
  tenantId: string;
}

export interface WebhookExecution {
  id: string;
  webhookId: string;
  status: 'pending' | 'success' | 'failed' | 'timeout';
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  };
  response?: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
  error?: string;
  executedAt: Date;
  duration: number;
}

export class WebhookService {
  
  /**
   * Register a new webhook endpoint
   */
  async registerWebhook(config: Omit<WebhookConfig, 'id'>): Promise<WebhookConfig> {
    const webhookId = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        id: webhookId,
        url: config.url,
        method: config.method,
        headers: config.headers,
        body: config.body,
        timeout: config.timeout,
        retries: config.retries,
        is_active: config.isActive,
        workflow_id: config.workflowId,
        tenant_id: config.tenantId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to register webhook: ${error.message}`);
    }

    return {
      id: data.id,
      url: data.url,
      method: data.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      headers: data.headers as Record<string, string>,
      body: data.body,
      timeout: data.timeout,
      retries: data.retries,
      isActive: data.is_active,
      workflowId: data.workflow_id,
      tenantId: data.tenant_id
    };
  }

  /**
   * Execute webhook with retry logic
   */
  async executeWebhook(webhookId: string, payload: any): Promise<WebhookExecution> {
    const webhook = await this.getWebhook(webhookId);
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    if (!webhook.isActive) {
      throw new Error(`Webhook ${webhookId} is not active`);
    }

    const execution: Partial<WebhookExecution> = {
      id: crypto.randomUUID(),
      webhookId,
      status: 'pending',
      request: {
        url: webhook.url,
        method: webhook.method,
        headers: webhook.headers,
        body: webhook.method !== 'GET' ? JSON.stringify(payload) : undefined,
      },
      executedAt: new Date(),
    };

    const startTime = Date.now();
    let lastError: string | undefined;

    // Retry logic
    for (let attempt = 0; attempt <= webhook.retries; attempt++) {
      try {
        const response = await this.makeHttpRequest(webhook, payload);
        
        execution.status = 'success';
        execution.response = {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text(),
        };
        execution.duration = Date.now() - startTime;
        
        break;
      } catch (error) {
        lastError = error.message;
        
        if (attempt === webhook.retries) {
          execution.status = 'failed';
          execution.error = lastError;
          execution.duration = Date.now() - startTime;
        } else {
          // Wait before retry (exponential backoff)
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // Log execution
    await this.logWebhookExecution(execution as WebhookExecution);

    return execution as WebhookExecution;
  }

  /**
   * Get webhook configuration
   */
  async getWebhook(webhookId: string): Promise<WebhookConfig | null> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (error) {
      return null;
    }

    return {
      id: data.id,
      url: data.url,
      method: data.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      headers: data.headers as Record<string, string>,
      body: data.body,
      timeout: data.timeout,
      retries: data.retries,
      isActive: data.is_active,
      workflowId: data.workflow_id,
      tenantId: data.tenant_id
    };
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(webhookId: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const { data, error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', webhookId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update webhook: ${error.message}`);
    }

    return {
      id: data.id,
      url: data.url,
      method: data.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      headers: data.headers as Record<string, string>,
      body: data.body,
      timeout: data.timeout,
      retries: data.retries,
      isActive: data.is_active,
      workflowId: data.workflow_id,
      tenantId: data.tenant_id
    };
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) {
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  }

  /**
   * Get webhook execution history
   */
  async getWebhookExecutions(webhookId: string, limit = 50): Promise<WebhookExecution[]> {
    const { data, error } = await supabase
      .from('webhook_executions')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get webhook executions: ${error.message}`);
    }

    return data.map(row => ({
      id: row.id,
      webhookId: row.webhook_id,
      status: row.status as 'pending' | 'success' | 'failed' | 'timeout',
      request: row.request as any,
      response: row.response as any,
      error: row.error,
      executedAt: new Date(row.executed_at),
      duration: row.duration
    }));
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(config: Partial<WebhookConfig>, testPayload?: any): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      const tempConfig: WebhookConfig = {
        id: 'test',
        url: config.url!,
        method: config.method || 'POST',
        headers: config.headers || { 'Content-Type': 'application/json' },
        timeout: config.timeout || 30000,
        retries: 0,
        isActive: true,
        workflowId: 'test',
        tenantId: 'test',
      };

      const response = await this.makeHttpRequest(tempConfig, testPayload);
      const responseText = await response.text();

      return {
        success: response.ok,
        response: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async makeHttpRequest(webhook: WebhookConfig, payload: any): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

    try {
      const requestInit: RequestInit = {
        method: webhook.method,
        headers: webhook.headers,
        signal: controller.signal,
      };

      if (webhook.method !== 'GET' && payload) {
        requestInit.body = JSON.stringify(payload);
      }

      const response = await fetch(webhook.url, requestInit);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async logWebhookExecution(execution: WebhookExecution): Promise<void> {
    await supabase
      .from('webhook_executions')
      .insert({
        id: execution.id,
        webhook_id: execution.webhookId,
        status: execution.status,
        request: execution.request,
        response: execution.response,
        error: execution.error,
        executed_at: execution.executedAt.toISOString(),
        duration: execution.duration,
      });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const webhookService = new WebhookService();