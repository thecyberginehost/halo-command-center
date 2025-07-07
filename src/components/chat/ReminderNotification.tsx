import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';

interface ReminderNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

const ReminderNotification = ({ isVisible, onClose }: ReminderNotificationProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40 animate-fade-in">
      <div className="bg-secondary/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg max-w-xs border border-accent/20">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-3 w-3 text-accent" />
          <p className="text-xs">Need help with automation? I'm here to assist!</p>
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="w-4 h-4 text-white/70 hover:text-white ml-1"
          >
            <X className="h-2 w-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReminderNotification;