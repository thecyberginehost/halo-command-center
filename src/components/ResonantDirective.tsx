
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Wand2, Settings, Loader2 } from 'lucide-react';
import WorkflowBuilder from './WorkflowBuilder';
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

const ResonantDirective = () => {
  const location = useLocation();
  const { workflows } = useWorkflows();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiChatService] = useState(() => new AIChatService());

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 1,
      text: "Hello! I'm Resonant Directive, your AI automation assistant. I can help you create workflows, optimize automations, and provide insights. What would you like to work on today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
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
      setTimeout(() => setShowWorkflowBuilder(true), 500);
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

  const handleCreateWorkflow = () => {
    setShowWorkflowBuilder(true);
  };

  if (showWorkflowBuilder) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <WorkflowBuilder 
          onClose={() => setShowWorkflowBuilder(false)}
        />
      </div>
    );
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl z-50 transition-all duration-300 bg-primary hover:bg-primary/90 relative overflow-hidden"
            size="icon"
          >
            {/* Rotating stars background */}
            <div className="absolute inset-0 animate-rotate-stars opacity-70">
              <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full shadow-[0_0_6px_white]"></div>
              <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_white]"></div>
              <div className="absolute bottom-3 left-4 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_white]"></div>
              <div className="absolute bottom-2 right-2 w-1 h-1 bg-white rounded-full shadow-[0_0_6px_white]"></div>
              <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_white] -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <MessageCircle className="h-7 w-7 text-white relative z-10" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="fixed bottom-24 right-6 top-auto left-auto translate-x-0 translate-y-0 max-w-md h-96 flex flex-col p-0 bg-gradient-to-br from-white to-gray-50 border-2 border-halo-primary/10 shadow-2xl">
          <DialogHeader className="p-4 border-b bg-gradient-to-r from-halo-primary to-halo-secondary text-white rounded-t-lg">
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Resonant Directive</span>
            </DialogTitle>
            <p className="text-xs text-gray-200">Need help optimizing workflows?</p>
          </DialogHeader>
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-halo-accent to-halo-accent/90 text-white'
                        : 'bg-white text-halo-text border border-gray-200'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg text-sm shadow-sm bg-white text-halo-text border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Resonant Directive is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Quick Actions */}
          <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-wrap gap-2 mb-3">
              <Button 
                onClick={handleCreateWorkflow}
                size="sm" 
                variant="outline"
                className="text-xs h-7"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Create Workflow
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs h-7"
              >
                <Settings className="h-3 w-3 mr-1" />
                System Status
              </Button>
            </div>

            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about automation or say 'create workflow'..."
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                disabled={isLoading}
                className="flex-1 border-gray-300 focus:border-halo-accent focus:ring-halo-accent/20 bg-white/80 backdrop-blur-sm shadow-sm placeholder:text-gray-400"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon" 
                disabled={isLoading || !inputValue.trim()}
                className="bg-halo-accent hover:bg-halo-accent/90 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResonantDirective;
