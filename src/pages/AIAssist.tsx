import { useState } from 'react';
import Layout from '@/components/Layout';
import { ResonantDirectiveChat } from '@/components/automation/ResonantDirectiveChat';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChatState } from '@/hooks/useChatState';

export default function AIAssist() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const { messages, inputValue, setInputValue, handleSendMessage } = useChatState();

  // Convert messages to ResonantDirectiveChat format
  const chatMessages = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));

  const onSendMessage = () => {
    handleSendMessage();
  };

  return (
    <Layout>
      <div className="flex h-full">
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Resonant Directive</h1>
              <p className="text-muted-foreground">
                Your AI assistant for automation workflow creation and management. 
                Ask questions, get suggestions, or receive help with building your automations.
              </p>
            </div>

            {!isChatOpen && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Ready to Assist</h2>
                  <p className="text-muted-foreground mb-4">
                    Click below to start a conversation with Resonant Directive
                  </p>
                  <Button onClick={() => setIsChatOpen(true)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ResonantDirectiveChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          chatMessages={chatMessages}
          chatInput={inputValue}
          setChatInput={setInputValue}
          onSendMessage={onSendMessage}
        />
      </div>
    </Layout>
  );
}