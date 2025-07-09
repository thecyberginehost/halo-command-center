import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, MessageSquare, Send } from 'lucide-react';
import { MessageFormatter } from '@/components/chat/MessageFormatter';

interface ChatMessage {
  role: string;
  content: string;
}

interface ResonantDirectiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  onSendMessage: () => void;
  isThinking?: boolean;
}

export function ResonantDirectiveChat({
  isOpen,
  onClose,
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage,
  isThinking = false
}: ResonantDirectiveChatProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-white to-gray-50 border-l-2 border-primary/10 shadow-2xl flex flex-col z-20">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-halo-primary to-halo-accent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm">Resonant Directive</span>
              <p className="text-xs text-white/90 font-medium">AI Automation Architect</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 px-2 py-1 h-auto"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              <span className="text-xs">Chat</span>
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
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {/* Show thinking animation for the last assistant message when thinking */}
                {message.role === 'assistant' && 
                 isThinking && 
                 index === chatMessages.length - 1 && 
                 (message.content === 'Thinking...' || message.content === 'Building your workflow...') ? (
                  <div className="flex items-center space-x-1">
                    <span>{message.content}</span>
                    <div className="flex space-x-1 ml-2">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : (
                  <MessageFormatter content={message.content} />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Chat Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Ask me anything about your automation..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSendMessage();
            }}
            className="flex-1"
          />
          <Button 
            size="sm" 
            onClick={onSendMessage} 
            disabled={isThinking}
            className="bg-halo-primary hover:bg-halo-primary/90 text-white px-4"
          >
            <Send className="h-3 w-3 mr-1" />
            {isThinking ? 'Thinking...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}