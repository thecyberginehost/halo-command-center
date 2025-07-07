import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Wand2, Settings, Loader2 } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  onSendMessage: () => void;
  onCreateWorkflow: () => void;
}

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  isLoading, 
  onSendMessage, 
  onCreateWorkflow 
}: ChatInputProps) => {
  return (
    <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-white">
      <div className="flex flex-wrap gap-2 mb-3">
        <Button 
          onClick={onCreateWorkflow}
          size="sm" 
          variant="outline"
          className="text-xs h-7 flex-1 sm:flex-none"
        >
          <Wand2 className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Create Workflow</span>
          <span className="sm:hidden">Create</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="text-xs h-7 flex-1 sm:flex-none"
        >
          <Settings className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">System Status</span>
          <span className="sm:hidden">Status</span>
        </Button>
      </div>

      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about automation..."
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && onSendMessage()}
          disabled={isLoading}
          className="flex-1 border-gray-300 focus:border-halo-accent focus:ring-halo-accent/20 bg-white/80 backdrop-blur-sm shadow-sm placeholder:text-gray-400"
        />
        <Button 
          onClick={onSendMessage} 
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
  );
};

export default ChatInput;