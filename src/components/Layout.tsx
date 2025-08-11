import { useState } from 'react';
import Header from './Header';
import { AppSidebar } from './AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useChatState } from '@/hooks/useChatState';
import { useNotifications } from '@/hooks/useNotifications';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';
import WelcomePopup from './chat/WelcomePopup';
import ReminderNotification from './chat/ReminderNotification';
import WorkflowBuilder from './WorkflowBuilder';
import { useChat } from '@/contexts/ChatContext';
import { AncillaChat } from './automation/AncillaChat';


interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const Layout = ({ children, pageTitle = "Dashboard" }: LayoutProps) => {
  const { isChatOpen, toggleChat, setIsChatOpen } = useChat();
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);

  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSendMessage,
    clearChatHistory
  } = useChatState();

  const {
    showWelcomePopup,
    showReminderNotification,
    handleWelcomeClose,
    handleReminderClose
  } = useNotifications(isChatOpen);

  const handleChatToggle = () => {
    toggleChat();
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  const handleCreateWorkflow = () => {
    setShowWorkflowBuilder(true);
  };

  const onSendMessage = () => {
    handleSendMessage(() => setShowWorkflowBuilder(true));
  };

  // Convert messages to AncillaChat format
  const chatMessages = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));

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
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className={`bg-background transition-all duration-300 ${isChatOpen ? 'mr-96' : ''}`}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <Header onChatToggle={handleChatToggle} pageTitle={pageTitle} />
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
      
      <AncillaChat
        isOpen={isChatOpen}
        onClose={handleChatClose}
      />

      
      {/* Welcome Popup - only shows when sidebar opens for first time */}
      <WelcomePopup 
        isVisible={showWelcomePopup && isChatOpen} 
        onClose={handleWelcomeClose} 
      />

      {/* Subtle Reminder Notification - only shows when sidebar is closed */}
      <ReminderNotification 
        isVisible={showReminderNotification && !isChatOpen} 
        onClose={handleReminderClose} 
      />
    </div>
  );
};

export default Layout;