import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Wand2, Settings, Loader2, X } from 'lucide-react';
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

interface ResonantDirectiveProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResonantDirective = ({ isOpen, onClose }: ResonantDirectiveProps) => {
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
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showReminderNotification, setShowReminderNotification] = useState(false);

  // Check if user has seen welcome popup this session
  const hasSeenWelcome = sessionStorage.getItem('resonant-directive-welcome-shown');
  const lastReminderTime = localStorage.getItem('resonant-directive-last-reminder');

  // Initialize with welcome message and manage popup display
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 1,
      text: "Hello! I'm Resonant Directive, your AI automation assistant. I can help you create workflows, optimize automations, and provide insights. What would you like to work on today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
    
    // Show welcome popup only if not seen this session
    if (!hasSeenWelcome && isOpen) {
      setTimeout(() => {
        setShowWelcomePopup(true);
      }, 1000);
    }
  }, [hasSeenWelcome, isOpen]);

  // Set up reminder notification system
  useEffect(() => {
    const currentTime = Date.now();
    const lastReminder = lastReminderTime ? parseInt(lastReminderTime) : 0;
    const timeSinceLastReminder = currentTime - lastReminder;
    
    // Show reminder if it's been more than 30 minutes since last reminder
    // and user has already seen the welcome popup
    if (hasSeenWelcome && timeSinceLastReminder > 30 * 60 * 1000 && !isOpen) {
      const reminderTimer = setTimeout(() => {
        setShowReminderNotification(true);
        localStorage.setItem('resonant-directive-last-reminder', currentTime.toString());
        
        // Auto-hide reminder after 10 seconds
        setTimeout(() => {
          setShowReminderNotification(false);
        }, 10000);
      }, 5 * 60 * 1000); // Show reminder after 5 minutes of activity
      
      return () => clearTimeout(reminderTimer);
    }
  }, [hasSeenWelcome, lastReminderTime, isOpen]);

  const handleWelcomeClose = () => {
    setShowWelcomePopup(false);
    sessionStorage.setItem('resonant-directive-welcome-shown', 'true');
  };

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
      {/* Sidebar Chat */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side="right" 
          className="w-96 h-full flex flex-col p-0 bg-gradient-to-br from-white to-gray-50 border-l-2 border-halo-primary/10"
        >
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-halo-primary to-halo-secondary text-white">
            <SheetTitle className="flex items-center space-x-2 text-white">
              <MessageCircle className="h-5 w-5" />
              <span>Resonant Directive</span>
            </SheetTitle>
            <p className="text-xs text-gray-200">Your AI automation assistant</p>
          </SheetHeader>
          
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
        </SheetContent>
      </Sheet>

      {/* Welcome Popup - only shows when sidebar opens for first time */}
      {showWelcomePopup && isOpen && (
        <div className="fixed top-20 right-8 z-50 animate-fade-in">
          <div className="relative bg-gradient-to-br from-primary to-secondary text-white p-4 rounded-lg shadow-2xl max-w-sm border border-accent/30">
            <Button
              onClick={handleWelcomeClose}
              size="icon"
              variant="ghost"
              className="absolute -top-2 -right-2 w-6 h-6 bg-accent hover:bg-accent/90 text-white rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
            <div className="pr-4">
              <h3 className="font-semibold text-sm mb-2">Welcome, Reclaimer</h3>
              <p className="text-xs leading-relaxed">
                I am Resonant Directive, your devoted Ancilla. My protocols are dedicated to accelerating your automation endeavors into hyperdrive. Query me for assistance with workflows, optimizations, and strategic implementations.
              </p>
            </div>
            <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-secondary"></div>
          </div>
        </div>
      )}

      {/* Subtle Reminder Notification - only shows when sidebar is closed */}
      {showReminderNotification && !isOpen && (
        <div className="fixed bottom-8 right-8 z-40 animate-fade-in">
          <div className="bg-secondary/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg max-w-xs border border-accent/20">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-3 w-3 text-accent" />
              <p className="text-xs">Need help with automation? I'm here to assist!</p>
              <Button
                onClick={() => setShowReminderNotification(false)}
                size="icon"
                variant="ghost"
                className="w-4 h-4 text-white/70 hover:text-white ml-1"
              >
                <X className="h-2 w-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResonantDirective;