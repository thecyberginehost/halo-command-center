// Workflow API Library - Simple functions for common automation tasks

interface WorkflowContext {
  input: Record<string, any>;
  previousSteps: Record<string, any>;
  workflow: {
    id: string;
    name: string;
    executionId: string;
  };
  tenant: {
    id: string;
    name: string;
  };
}

interface EmailConfig {
  to: string | string[];
  subject: string;
  body?: string;
  template?: string;
  data?: Record<string, any>;
  from?: string;
}

interface HttpConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface CRMContact {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  customFields?: Record<string, any>;
}

interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
}

// Email Functions
export async function sendEmail(config: EmailConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // This will be implemented to call the appropriate email service
    console.log('Sending email:', config);
    return { success: true, messageId: `msg_${Date.now()}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// HTTP Request Functions
export async function makeHttpRequest(config: HttpConfig): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(config.url, {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });
    
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// CRM Functions
export async function addToCRM(contact: CRMContact, provider = 'salesforce'): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    console.log('Adding to CRM:', contact, provider);
    return { success: true, contactId: `contact_${Date.now()}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateCRMContact(contactId: string, updates: Partial<CRMContact>, provider = 'salesforce'): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Updating CRM contact:', contactId, updates, provider);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Slack Functions
export async function sendSlackMessage(config: SlackMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    console.log('Sending Slack message:', config);
    return { success: true, messageId: `slack_${Date.now()}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Utility Functions
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function extractDomain(email: string): string | null {
  const match = email.match(/@([^@]+)$/);
  return match ? match[1] : null;
}

export function transformData(data: any, transformation: string): any {
  // Simple data transformation utilities
  switch (transformation) {
    case 'uppercase':
      return typeof data === 'string' ? data.toUpperCase() : data;
    case 'lowercase':
      return typeof data === 'string' ? data.toLowerCase() : data;
    case 'trim':
      return typeof data === 'string' ? data.trim() : data;
    default:
      return data;
  }
}

// Conditional Logic Helpers
export function when(condition: boolean, thenFn: () => any, elseFn?: () => any): any {
  return condition ? thenFn() : (elseFn ? elseFn() : null);
}

export function match(value: any, cases: Record<string, () => any>, defaultCase?: () => any): any {
  return cases[value] ? cases[value]() : (defaultCase ? defaultCase() : null);
}

// Global context available in all workflow functions
declare global {
  const context: WorkflowContext;
  const log: (message: string, data?: any) => void;
  const error: (message: string, data?: any) => void;
  const warn: (message: string, data?: any) => void;
}