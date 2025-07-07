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
import { Trash2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
      <SidebarInset className={`bg-background transition-all duration-300 ${isChatOpen ? 'md:flex-1' : 'flex-1'}`}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <Header onChatToggle={handleChatToggle} />
          </div>
        </header>
        
        <main className={`flex-1 p-4 md:p-6 overflow-y-auto ${isChatOpen ? 'hidden md:block' : ''}`}>
          {children}
        </main>
      </SidebarInset>
      
      {/* Chat Sidebar - Responsive */}
      {isChatOpen && (
        <div className="fixed inset-0 z-30 w-full bg-gradient-to-br from-white to-gray-50 border-l-2 border-halo-primary/10 shadow-2xl flex flex-col md:relative md:inset-auto md:w-80 lg:w-96 xl:w-96">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-halo-primary to-halo-secondary">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 text-white">💬</div>
                <span className="text-white font-semibold">Resonant Directive</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChatHistory}
                  className="text-white hover:text-gray-200 p-1 rounded-sm hover:bg-white/20 transition-colors"
                  title="Clear chat history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleChatClose}
                  className="text-white hover:text-gray-200 p-1 rounded-sm hover:bg-white/20 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-xs text-white/90 font-medium mt-1">Your AI automation assistant</p>
          </div>
          
          {/* Chat Content - This will take remaining space */}
          <div className="flex-1 flex flex-col min-h-0">
            <ChatMessages messages={messages} isLoading={isLoading} />
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              isLoading={isLoading}
              onSendMessage={onSendMessage}
              onCreateWorkflow={handleCreateWorkflow}
            />
          </div>
        </div>
      )}
      
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