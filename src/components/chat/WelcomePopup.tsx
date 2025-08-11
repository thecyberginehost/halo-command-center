import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface WelcomePopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const WelcomePopup = ({ isVisible, onClose }: WelcomePopupProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-8 z-50 animate-fade-in">
      <div className="relative bg-gradient-to-br from-primary to-secondary text-white p-4 rounded-lg shadow-2xl max-w-sm border border-accent/30">
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="absolute -top-2 -right-2 w-6 h-6 bg-accent hover:bg-accent/90 text-white rounded-full"
        >
          <X className="h-3 w-3" />
        </Button>
        <div className="pr-4">
          <h3 className="font-semibold text-sm mb-2">Welcome, Reclaimer</h3>
          <p className="text-xs leading-relaxed">
            I am Ancilla, your devoted AI assistant. My protocols are dedicated to accelerating your automation endeavors into hyperdrive. Query me for assistance with workflows, optimizations, and strategic implementations.
          </p>
        </div>
        <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-secondary"></div>
      </div>
    </div>
  );
};

export default WelcomePopup;