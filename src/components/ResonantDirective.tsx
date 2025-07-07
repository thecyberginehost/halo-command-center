import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MessageCircle } from 'lucide-react';
import WorkflowBuilder from './WorkflowBuilder';
import { useChatState } from '@/hooks/useChatState';
import { useNotifications } from '@/hooks/useNotifications';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';
import WelcomePopup from './chat/WelcomePopup';
import ReminderNotification from './chat/ReminderNotification';

interface ResonantDirectiveProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResonantDirective = ({ isOpen, onClose }: ResonantDirectiveProps) => {
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSendMessage
  } = useChatState();

  const {
    showWelcomePopup,
    showReminderNotification,
    handleWelcomeClose,
    handleReminderClose
  } = useNotifications(isOpen);

  const handleCreateWorkflow = () => {
    setShowWorkflowBuilder(true);
  };

  const onSendMessage = () => {
    handleSendMessage(() => setShowWorkflowBuilder(true));
  };

  if (showWorkflowBuilder) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <WorkflowBuilder 
          onClose={() => setShowWorkflowBuilder(false)}
        />
      </div>
    );
  }

  return (
    <>
      {/* Sidebar Chat */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side="right" 
          className="w-96 h-full flex flex-col p-0 bg-gradient-to-br from-white to-gray-50 border-l-2 border-halo-primary/10"
        >
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-halo-primary to-halo-secondary text-white">
            <SheetTitle className="flex items-center space-x-2 text-white">
              <MessageCircle className="h-5 w-5" />
              <span>Resonant Directive</span>
            </SheetTitle>
            <p className="text-xs text-gray-200">Your AI automation assistant</p>
          </SheetHeader>
          
          <ChatMessages messages={messages} isLoading={isLoading} />
          
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            onSendMessage={onSendMessage}
            onCreateWorkflow={handleCreateWorkflow}
          />
        </SheetContent>
      </Sheet>

      {/* Welcome Popup - only shows when sidebar opens for first time */}
      <WelcomePopup 
        isVisible={showWelcomePopup && isOpen} 
        onClose={handleWelcomeClose} 
      />

      {/* Subtle Reminder Notification - only shows when sidebar is closed */}
      <ReminderNotification 
        isVisible={showReminderNotification && !isOpen} 
        onClose={handleReminderClose} 
      />
    </>
  );
};

export default ResonantDirective;