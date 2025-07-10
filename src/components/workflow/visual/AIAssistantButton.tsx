import { Button } from '@/components/ui/button';
import { Bot, Sparkles } from 'lucide-react';

interface AIAssistantButtonProps {
  onChatToggle: () => void;
}

export function AIAssistantButton({ onChatToggle }: AIAssistantButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onChatToggle}
      className="relative h-8 px-3 bg-gradient-to-r from-halo-primary/10 to-halo-accent/10 hover:from-halo-primary/20 hover:to-halo-accent/20 border border-halo-primary/20 hover:border-halo-primary/30 rounded-lg transition-all duration-200"
      title="Open Resonant Directive AI Assistant"
    >
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Bot className="h-3.5 w-3.5 text-halo-primary" />
          <Sparkles className="h-2 w-2 text-halo-accent absolute -top-0.5 -right-0.5 animate-pulse" />
        </div>
        <span className="text-xs font-medium text-halo-text">AI</span>
      </div>
    </Button>
  );
}