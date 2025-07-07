import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

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
}

export function ResonantDirectiveChat({
  isOpen,
  onClose,
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage
}: ResonantDirectiveChatProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-white to-gray-50 border-l-2 border-primary/10 shadow-2xl flex flex-col z-20">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-primary to-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 text-primary-foreground">💬</div>
            <span className="text-primary-foreground font-semibold">Resonant Directive</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-primary-foreground/90 font-medium mt-1">
          How can I assist in creating this automation?
        </p>
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
                <p className="text-sm">{message.content}</p>
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
          <Button size="sm" onClick={onSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}