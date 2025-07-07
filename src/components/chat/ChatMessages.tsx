import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Function to render message text with clickable links
  const renderMessageWithLinks = (text: string) => {
    // Pattern to match both formats: "Link: /path" and "[CLICK TO GO TO X](/path)"
    const linkPattern = /(\[CLICK TO GO TO [^\]]+\]\(([^)]+)\)|Link: (\/[^\s)]+))/g;
    const parts = text.split(linkPattern);
    
    return parts.map((part, index) => {
      // Handle markdown-style links [text](/path)
      if (part && part.match(/\[CLICK TO GO TO [^\]]+\]\(([^)]+)\)/)) {
        const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          const [, linkText, path] = match;
          return (
            <button
              key={index}
              onClick={() => navigate(path)}
              className="text-blue-600 hover:text-blue-800 underline font-medium mx-1 cursor-pointer"
            >
              {linkText}
            </button>
          );
        }
      }
      // Handle "Link: /path" format
      if (part && part.startsWith('/')) {
        return (
          <button
            key={index}
            onClick={() => navigate(part)}
            className="text-blue-600 hover:text-blue-800 underline font-medium mx-1 cursor-pointer"
          >
            Go to {part === '/automations' ? 'Automations' : part}
          </button>
        );
      }
      return part;
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 p-4 bg-gradient-to-b from-gray-50/50 to-white overflow-y-auto min-h-0"
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-white text-halo-text border border-gray-200 rounded-bl-sm'
              }`}
            >
              <div>{renderMessageWithLinks(message.text)}</div>
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
        
        {/* Invisible div for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;