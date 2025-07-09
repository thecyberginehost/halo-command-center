import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';

interface ChatMessage {
  role: string;
  content: string;
}

interface WorkflowData {
  action: string;
  nodes: any[];
  connections: any[];
}

interface UseAutomationChatProps {
  workflow: any;
  workflowNodes: any[];
  workflowEdges: any[];
  onWorkflowGeneration: (workflowData: WorkflowData) => void;
}

export const useAutomationChat = ({ 
  workflow, 
  workflowNodes, 
  workflowEdges, 
  onWorkflowGeneration 
}: UseAutomationChatProps) => {
  const { currentTenant } = useTenant();
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "I'm Resonant Directive, your AI automation architect! I can build complete workflows from your descriptions, analyze your current automation, and suggest optimizations. What would you like to create?"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const newMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    const currentInput = chatInput;
    setChatInput('');
    
    // Determine thinking message based on input
    const isWorkflowRequest = currentInput.toLowerCase().includes('build') || 
                             currentInput.toLowerCase().includes('create') || 
                             currentInput.toLowerCase().includes('workflow') ||
                             currentInput.toLowerCase().includes('automation');
    
    const thinkingMessage = isWorkflowRequest ? 'Building your workflow...' : 'Thinking...';
    
    // Add thinking indicator
    setIsThinking(true);
    setChatMessages(prev => [...prev, { role: 'assistant', content: thinkingMessage }]);
    
    try {
      const response = await fetch(`https://xxltijgxrwhdudhzicel.supabase.co/functions/v1/ai-chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bHRpamd4cndoZHVkaHppY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MjM4MDUsImV4cCI6MjA2NzM5OTgwNX0.Vu4GrS5lgDBpWErm6evBXAZM1jhl75m-3tXJXiz66ZE`
        },
        body: JSON.stringify({
          message: currentInput,
          tenantId: currentTenant?.id,
          context: {
            currentPage: `/automations/create/${workflow?.id}`,
            currentWorkflow: workflow,
            currentWorkflowNodes: workflowNodes,
            currentWorkflowEdges: workflowEdges,
            workflowCount: 1
          },
          conversationHistory: chatMessages.slice(-10) // Last 10 messages for context
        })
      });

      const data = await response.json();
      console.log('AI Response:', data); // Debug log
      
      // Replace thinking message with actual response
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant', 
          content: data.message || data.fallbackMessage || "I received your message but couldn't process it properly."
        };
        return newMessages;
      });

      // If AI generated workflow data, apply it to the canvas
      console.log('Checking for workflow data:', data.workflowData);
      if (data.workflowData && data.workflowData.action === 'build_workflow') {
        console.log('Found workflow data, applying to canvas:', data.workflowData);
        onWorkflowGeneration(data.workflowData);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      // Replace thinking message with error message
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant', 
          content: "I'm having trouble connecting right now. Please try again in a moment."
        };
        return newMessages;
      });
    } finally {
      setIsThinking(false);
    }
  };

  return {
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isThinking,
    handleSendMessage
  };
};