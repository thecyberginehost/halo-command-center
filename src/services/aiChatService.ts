import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  currentPage?: string;
  workflowCount?: number;
  recentWorkflows?: Array<{
    id: string;
    name: string;
    status: string;
    last_executed?: string;
  }>;
}

export interface ChatRequest {
  message: string;
  tenantId?: string;
  context?: ChatContext;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  context?: ChatContext;
  error?: boolean;
  fallbackMessage?: string;
}

export class AIChatService {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: request
      });

      if (error) {
        console.error('AI Chat Error:', error);
        return {
          message: "I'm having trouble connecting to my AI services. However, I can still help you with workflow automation. What would you like to work on?",
          error: true
        };
      }

      return data as ChatResponse;
    } catch (error) {
      console.error('AI Chat Service Error:', error);
      return {
        message: "I apologize, but I'm experiencing some technical difficulties. I'm still here to help with your automation needs though! What can I assist you with?",
        error: true
      };
    }
  }

  // Helper method to get current page context
  getCurrentPageContext(pathname: string): string {
    const pageMap: { [key: string]: string } = {
      '/': 'Dashboard',
      '/automations': 'Automations',
      '/metrics': 'Metrics',
      '/insights': 'Insights', 
      '/logs': 'Logs',
      '/ai-assist': 'AI Assistant',
      '/suggestions': 'Suggestions',
      '/ai-recommendations': 'AI Recommendations',
      '/settings/users': 'User Management',
      '/settings/credentials': 'Credentials',
      '/settings/system': 'System Configuration'
    };

    return pageMap[pathname] || pathname;
  }

  // Helper to build context from workflows
  buildWorkflowContext(workflows: any[]): ChatContext['recentWorkflows'] {
    return workflows.slice(0, 5).map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      status: workflow.status || 'draft',
      last_executed: workflow.last_executed
    }));
  }
}