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
    // Single comprehensive pattern that handles all link formats
    const linkPattern = /(\[CLICK TO GO TO [^\]]+\]\(([^)]+)\)|CLICK TO GO TO ([A-Z]+)|Go to (\/[^\s)]+))/g;
    
    return text.split(linkPattern).map((part, index) => {
      if (!part) return '';
      
      // Handle proper markdown-style links [text](/path)
      const markdownMatch = part.match(/^\[CLICK TO GO TO [^\]]+\]\(([^)]+)\)$/);
      if (markdownMatch) {
        const path = markdownMatch[1];
        return (
          <button
            key={index}
            onClick={() => navigate(path)}
            className="text-blue-600 hover:text-blue-800 underline font-medium mx-1 cursor-pointer"
          >
            Go to {path === '/automations' ? 'Automations' : path === '/' ? 'Dashboard' : path}
          </button>
        );
      }
      
      // Handle malformed AI responses like "CLICK TO GO TO AUTOMATIONS"
      const simpleMatch = part.match(/^CLICK TO GO TO ([A-Z]+)$/);
      if (simpleMatch) {
        const pageName = simpleMatch[1];
        let path = '/';
        
        switch (pageName) {
          case 'AUTOMATIONS':
            path = '/automations';
            break;
          case 'DASHBOARD':
            path = '/';
            break;
          default:
            path = `/${pageName.toLowerCase()}`;
        }
        
        return (
          <button
            key={index}
            onClick={() => navigate(path)}
            className="text-blue-600 hover:text-blue-800 underline font-medium mx-1 cursor-pointer"
          >
            Go to {pageName.charAt(0) + pageName.slice(1).toLowerCase()}
          </button>
        );
      }
      
      // Handle direct path links like "/automations"
      if (part.startsWith('/')) {
        return (
          <button
            key={index}
            onClick={() => navigate(part)}
            className="text-blue-600 hover:text-blue-800 underline font-medium mx-1 cursor-pointer"
          >
            Go to {part === '/automations' ? 'Automations' : part === '/' ? 'Dashboard' : part}
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