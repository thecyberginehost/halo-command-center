import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { VisualWorkflowNode } from '@/types/visualWorkflow';
import { allIntegrations } from '@/lib/integrations';

export interface ResonantDirectiveMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    workflowId?: string;
    suggestions?: string[];
    error?: boolean;
  };
}

export interface WorkflowContext {
  currentWorkflow?: {
    id: string;
    name: string;
    nodes: VisualWorkflowNode[];
    connections: any[];
  };
  availableIntegrations: typeof allIntegrations;
  tenantCredentials?: Array<{
    id: string;
    name: string;
    service_type: string;
  }>;
}

export interface ResonantDirectiveResponse {
  content: string;
  action?: 'create_workflow' | 'modify_workflow' | 'suggest_integration' | 'explain_concept' | 'error';
  workflowData?: {
    nodes: VisualWorkflowNode[];
    connections: any[];
    metadata: Record<string, any>;
  };
  suggestions?: string[];
  error?: string;
}

export function useResonantDirective() {
  const [messages, setMessages] = useState<ResonantDirectiveMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `🚀 **Welcome to Resonant Directive!**

I'm your AI Automation Architect, ready to help you build powerful workflows for HALO. I can:

• **Generate complete workflows** from natural language descriptions
• **Suggest optimizations** for existing automations  
• **Explain integration capabilities** and best practices
• **Debug workflow issues** and provide solutions
• **Recommend MASP-certified approaches** for enterprise clients

**Example requests:**
- "Create a workflow that sends a Slack notification when a new lead is added to Salesforce"
- "Build an email automation that uses AI to respond to customer inquiries"
- "Set up a data sync between our CRM and marketing platform"

What automation challenge can I help you solve today?`,
      timestamp: new Date()
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext>({
    availableIntegrations: allIntegrations
  });

  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateWorkflowContext = useCallback((context: Partial<WorkflowContext>) => {
    setWorkflowContext(prev => ({ ...prev, ...context }));
  }, []);

  const generateSystemContext = useCallback(() => {
    const context = {
      platform: 'HALO - Hyper-Automation & Logical Orchestration Platform',
      userRole: 'MASP Certified Automation Specialist',
      tenant: currentTenant ? {
        id: currentTenant.id,
        name: currentTenant.name,
        subdomain: currentTenant.subdomain
      } : null,
      availableIntegrations: workflowContext.availableIntegrations.length,
      currentWorkflow: workflowContext.currentWorkflow ? {
        id: workflowContext.currentWorkflow.id,
        name: workflowContext.currentWorkflow.name,
        nodeCount: workflowContext.currentWorkflow.nodes.length,
        connectionCount: workflowContext.currentWorkflow.connections.length
      } : null,
      credentialCount: workflowContext.tenantCredentials?.length || 0,
      capabilities: [
        'Natural language workflow generation',
        'Integration recommendations',
        'Error diagnosis and resolution',
        'Performance optimization',
        'MASP certification guidance',
        'Enterprise-grade security advice'
      ]
    };

    return `You are Resonant Directive, the AI Automation Architect for HALO platform. 

CONTEXT: ${JSON.stringify(context, null, 2)}

GUIDELINES:
- Generate practical, working workflows using available integrations
- Prioritize MASP-certified best practices
- Suggest enterprise-grade solutions
- Provide specific, actionable advice
- Reference actual integration capabilities
- Consider tenant-specific context and credentials
- Focus on automation value and ROI

RESPONSE FORMAT:
- Use clear, professional language
- Include specific step-by-step instructions when needed
- Suggest relevant integrations and configurations
- Provide implementation guidance
- Highlight security and compliance considerations`;
  }, [currentTenant, workflowContext]);

  const sendMessage = useCallback(async (content: string): Promise<ResonantDirectiveResponse> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const userMessage: ResonantDirectiveMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Prepare conversation history
      const conversationHistory = [
        {
          role: 'system',
          content: generateSystemContext()
        },
        ...messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content
        }
      ];

      // Call AI Chat service
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content,
          tenantId: currentTenant?.id,
          context: {
            currentPage: `/automations/create/${workflowContext?.currentWorkflow?.id || 'new'}`,
            currentWorkflow: workflowContext?.currentWorkflow,
            currentWorkflowNodes: workflowContext?.currentWorkflow?.nodes || [],
            currentWorkflowEdges: workflowContext?.currentWorkflow?.connections || [],
            workflowCount: 1
          },
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          requestType: 'chat'
        }
      });

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Request was cancelled');
      }

      if (error) throw error;

      const response: ResonantDirectiveResponse = {
        content: data.message || data.fallbackMessage || 'I apologize, but I encountered an issue processing your request.',
        action: data.action,
        workflowData: data.workflowData,
        suggestions: data.suggestions,
        error: data.error
      };

      // Add assistant response to messages
      const assistantMessage: ResonantDirectiveMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          action: response.action,
          suggestions: response.suggestions,
          error: !!response.error
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle special actions
      if (response.action === 'error') {
        toast({
          title: "Processing Error",
          description: response.error || "An unexpected error occurred",
          variant: "destructive"
        });
      } else if (response.action === 'create_workflow' && response.workflowData) {
        toast({
          title: "Workflow Generated",
          description: "I've created a workflow based on your request. Review and save when ready.",
          variant: "default"
        });
      }

      return response;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled
        return { content: '', error: 'Request cancelled' };
      }

      console.error('Resonant Directive error:', error);
      
      const errorMessage = error.message || 'An unexpected error occurred';
      const errorResponse: ResonantDirectiveResponse = {
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again or rephrase your request.`,
        error: errorMessage
      };

      // Add error message
      const errorMsg: ResonantDirectiveMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: errorResponse.content,
        timestamp: new Date(),
        metadata: { error: true }
      };

      setMessages(prev => [...prev, errorMsg]);

      toast({
        title: "AI Processing Error",
        description: errorMessage,
        variant: "destructive"
      });

      return errorResponse;

    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [messages, generateSystemContext, workflowContext, currentTenant, toast]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `🚀 **Welcome back to Resonant Directive!**

Ready to build more amazing automations? What can I help you create today?`,
      timestamp: new Date()
    }]);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      
      toast({
        title: "Request Cancelled",
        description: "AI processing has been stopped.",
        variant: "default"
      });
    }
  }, [toast]);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = messages.slice().reverse().find(msg => msg.role === 'user');
    if (lastUserMessage && !isProcessing) {
      sendMessage(lastUserMessage.content);
    }
  }, [messages, isProcessing, sendMessage]);

  return {
    messages,
    isProcessing,
    workflowContext,
    sendMessage,
    updateWorkflowContext,
    clearMessages,
    cancelRequest,
    retryLastMessage
  };
}