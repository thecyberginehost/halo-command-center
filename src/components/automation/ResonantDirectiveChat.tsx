import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, MessageSquare, Send, Sparkles, RotateCcw, StopCircle } from 'lucide-react';
import { MessageFormatter } from '@/components/chat/MessageFormatter';
import { useResonantDirective, ResonantDirectiveMessage } from '@/hooks/useResonantDirective';

interface ResonantDirectiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId?: string;
  onWorkflowGenerated?: (workflowData: any) => void;
}

export function ResonantDirectiveChat({
  isOpen,
  onClose,
  workflowId,
  onWorkflowGenerated
}: ResonantDirectiveChatProps) {
  const {
    messages,
    isProcessing,
    sendMessage,
    clearMessages,
    cancelRequest,
    retryLastMessage
  } = useResonantDirective();

  const [chatInput, setChatInput] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isProcessing) return;
    
    const userInput = chatInput;
    setChatInput('');
    
    const response = await sendMessage(userInput);
    
    if (response.workflowData && onWorkflowGenerated) {
      onWorkflowGenerated(response.workflowData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-white to-gray-50 border-l-2 border-primary/10 shadow-2xl flex flex-col z-20">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b bg-sidebar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm">Resonant Directive</span>
              <div className="flex items-center gap-2">
                <p className="text-xs text-white/90 font-medium">AI Automation Architect</p>
                {isProcessing && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Processing...
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelRequest}
                className="text-white hover:bg-white/20 px-2 py-1 h-auto"
              >
                <StopCircle className="h-3 w-3 mr-1" />
                <span className="text-xs">Stop</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-white hover:bg-white/20 px-2 py-1 h-auto"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              <span className="text-xs">Clear</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.metadata?.error 
                      ? 'bg-destructive/10 text-destructive border border-destructive/20'
                      : 'bg-muted text-foreground'
                }`}
              >
                <MessageFormatter content={message.content} />
                
                {/* Show message metadata */}
                {message.metadata?.suggestions && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs opacity-70">Suggestions:</p>
                    {message.metadata.suggestions.slice(0, 3).map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 bg-background/50 rounded cursor-pointer hover:bg-background/70"
                        onClick={() => setChatInput(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show timestamp */}
                <div className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm">Analyzing and generating response...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Chat Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Describe the automation you want to build..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isProcessing}
          />
          <Button 
            size="sm" 
            onClick={handleSendMessage} 
            disabled={isProcessing || !chatInput.trim()}
            className="bg-halo-primary hover:bg-halo-primary/90 text-white px-4"
          >
            <Send className="h-3 w-3 mr-1" />
            {isProcessing ? 'Processing...' : 'Send'}
          </Button>
        </div>
        
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['Build email automation', 'Create CRM sync', 'AI-powered workflow', 'Data transformation'].map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              onClick={() => setChatInput(prompt)}
              disabled={isProcessing}
              className="text-xs h-7"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}