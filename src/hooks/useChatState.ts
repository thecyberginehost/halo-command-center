import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AIChatService, ChatMessage } from '@/services/aiChatService';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export const useChatState = () => {
  const location = useLocation();
  const { workflows } = useWorkflows();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiChatService] = useState(() => new AIChatService());

  // Load conversation history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('halo-chat-messages');
    const savedHistory = localStorage.getItem('halo-chat-conversation-history');
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
    } else {
      // Initialize with welcome message only if no saved messages
      const welcomeMessage: Message = {
        id: 1,
        text: "Hello! I'm Ancilla, your AI automation assistant. I can help you create workflows, optimize automations, and provide insights. What would you like to work on today?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMessage]);
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setConversationHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading saved conversation history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever messages or conversation history changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('halo-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (conversationHistory.length > 0) {
      localStorage.setItem('halo-chat-conversation-history', JSON.stringify(conversationHistory));
    }
  }, [conversationHistory]);

  const handleSendMessage = async (onWorkflowCreate?: () => void) => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Check for workflow creation requests
    if (currentInput.toLowerCase().includes('create') && 
        (currentInput.toLowerCase().includes('workflow') || currentInput.toLowerCase().includes('automation'))) {
      setIsLoading(false);
      
      const aiResponse: Message = {
        id: messages.length + 2,
        text: "I'd be happy to help you create a workflow! I'll open the AI Workflow Builder where you can describe your automation in natural language, and I'll generate it for you.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
      setTimeout(() => onWorkflowCreate?.(), 500);
      return;
    }

    try {
      // Build context for AI
      const context = {
        currentPage: aiChatService.getCurrentPageContext(location.pathname),
        workflowCount: workflows.length,
        recentWorkflows: aiChatService.buildWorkflowContext(workflows)
      };

      // Update conversation history
      const newHistory: ChatMessage[] = [
        ...conversationHistory,
        { role: 'user', content: currentInput }
      ];

      const response = await aiChatService.sendMessage({
        message: currentInput,
        tenantId: currentTenant?.id,
        context,
        conversationHistory: newHistory.slice(-10) // Keep last 10 messages for context
      });

      const aiResponse: Message = {
        id: messages.length + 2,
        text: response.message,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Update conversation history
      setConversationHistory([
        ...newHistory,
        { role: 'assistant' as const, content: response.message }
      ].slice(-10)); // Keep last 10 messages

      if (response.error) {
        toast({
          title: "Connection Issue",
          description: "AI assistant is having connection issues but can still help with basic automation questions.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorResponse: Message = {
        id: messages.length + 2,
        text: "I'm experiencing some technical difficulties right now. However, I'm still here to help with your automation needs. Try asking about creating workflows or system optimization!",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        title: "AI Assistant Error",
        description: "There was a problem connecting to the AI service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    setConversationHistory([]);
    localStorage.removeItem('halo-chat-messages');
    localStorage.removeItem('halo-chat-conversation-history');
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSendMessage,
    clearChatHistory
  };
};