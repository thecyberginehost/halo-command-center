
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageFormatter } from './MessageFormatter';

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
    // Look for markdown-style links [text](path)
    const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkPattern.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
          key: parts.length
        });
      }

      // Add the link
      parts.push({
        type: 'link',
        content: match[1], // Link text
        path: match[2],    // Link path
        key: parts.length
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
        key: parts.length
      });
    }

    // If no links were found, return the original text
    if (parts.length === 0) {
      return text;
    }

    return parts.map((part) => {
      if (part.type === 'link') {
        return (
          <button
            key={part.key}
            onClick={() => navigate(part.path)}
            className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
          >
            {part.content}
          </button>
        );
      }
      return <span key={part.key}>{part.content}</span>;
    });
  };

  // Auto-scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };

    // Use a small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
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
              <MessageFormatter content={message.text} />
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
