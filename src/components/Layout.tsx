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
    handleSendMessage
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
      <SidebarInset className={`bg-background transition-all duration-300 ${isChatOpen ? 'lg:mr-96' : ''}`}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <Header onChatToggle={handleChatToggle} />
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
      
      {/* Chat Sidebar - Responsive layout */}
      {isChatOpen && (
        <>
          {/* Mobile: Full screen overlay */}
          <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-halo-primary to-halo-secondary">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 text-white">💬</div>
                  <span className="text-white font-semibold">Resonant Directive</span>
                </div>
                <button
                  onClick={handleChatClose}
                  className="text-black hover:text-gray-700 p-1 rounded-sm hover:bg-white/20 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-white/90 font-medium mt-1">Your AI automation assistant</p>
            </div>
            
            {/* Chat Content - Mobile */}
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

          {/* Desktop: Side panel */}
          <div className="hidden lg:flex w-96 bg-gradient-to-br from-white to-gray-50 border-l-2 border-halo-primary/10 shadow-2xl flex-col max-h-screen">
            {/* Header - Desktop */}
            <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-halo-primary to-halo-secondary">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 text-white">💬</div>
                  <span className="text-white font-semibold">Resonant Directive</span>
                </div>
                <button
                  onClick={handleChatClose}
                  className="text-black hover:text-gray-700 p-1 rounded-sm hover:bg-white/20 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-white/90 font-medium mt-1">Your AI automation assistant</p>
            </div>
            
            {/* Chat Content - Desktop */}
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
        </>
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