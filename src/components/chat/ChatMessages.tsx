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
    console.log('Processing text:', text); // Debug log
    
    // Look for different link patterns in order of specificity
    const parts = [];
    let remainingText = text;
    let index = 0;
    
    // Pattern 1: Markdown-style links [CLICK TO GO TO X](/path)
    const markdownPattern = /\[CLICK TO GO TO [^\]]+\]\([^)]+\)/g;
    let markdownMatch;
    
    while ((markdownMatch = markdownPattern.exec(remainingText)) !== null) {
      // Add text before the match
      if (markdownMatch.index > 0) {
        parts.push({
          type: 'text',
          content: remainingText.substring(0, markdownMatch.index),
          key: index++
        });
      }
      
      // Add the link
      const linkMatch = markdownMatch[0].match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const [, linkText, path] = linkMatch;
        parts.push({
          type: 'link',
          content: linkText,
          path: path,
          key: index++
        });
      }
      
      remainingText = remainingText.substring(markdownMatch.index + markdownMatch[0].length);
      markdownPattern.lastIndex = 0; // Reset regex
    }
    
    // Pattern 2: Simple text like "CLICK TO GO TO AUTOMATIONS"
    const simplePattern = /CLICK TO GO TO ([A-Z]+)/g;
    let tempText = remainingText;
    let simpleMatch;
    
    while ((simpleMatch = simplePattern.exec(tempText)) !== null) {
      // Add text before the match
      if (simpleMatch.index > 0) {
        parts.push({
          type: 'text',
          content: tempText.substring(0, simpleMatch.index),
          key: index++
        });
      }
      
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
      
      parts.push({
        type: 'link',
        content: `Go to ${pageName.charAt(0) + pageName.slice(1).toLowerCase()}`,
        path: path,
        key: index++
      });
      
      tempText = tempText.substring(simpleMatch.index + simpleMatch[0].length);
      simplePattern.lastIndex = 0; // Reset regex
    }
    
    // Add any remaining text
    if (tempText.length > 0) {
      parts.push({
        type: 'text',
        content: tempText,
        key: index++
      });
    } else if (remainingText.length > 0 && parts.length === 0) {
      // If no patterns matched, just return the original text
      parts.push({
        type: 'text',
        content: remainingText,
        key: index++
      });
    }
    
    console.log('Parsed parts:', parts); // Debug log
    
    return parts.map((part) => {
      if (part.type === 'link') {
        return (
          <button
            key={part.key}
            onClick={() => navigate(part.path)}
            className="text-blue-600 hover:text-blue-800 underline font-medium mx-1 cursor-pointer"
          >
            {part.content}
          </button>
        );
      }
      return part.content;
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