
import { useState } from 'react';
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
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

const ResonantDirective = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm Resonant Directive, your AI automation assistant. How can I help you optimize your workflows today?",
      sender: 'ai',
      timestamp: '10:30 AM'
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: "I understand you're looking for optimization suggestions. Based on your current workflows, I recommend implementing parallel processing for your email campaigns to reduce execution time by 25%.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-halo-accent hover:bg-halo-accent/90 shadow-lg animate-pulse-glow z-50"
            size="icon"
          >
            <MessageCircle className="h-6 w-6 text-white" />
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
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-white backdrop-blur-sm">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about workflow optimization..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 border-gray-300 focus:border-halo-accent focus:ring-halo-accent/20 bg-white/80 backdrop-blur-sm shadow-sm placeholder:text-gray-400"
              />
              <Button onClick={handleSendMessage} size="icon" className="bg-halo-accent hover:bg-halo-accent/90 shadow-sm">
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResonantDirective;
