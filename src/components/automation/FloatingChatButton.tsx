import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick: () => void;
}

export function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-20 bg-primary hover:bg-primary/90"
      size="sm"
    >
      <MessageCircle className="h-5 w-5" />
    </Button>
  );
}