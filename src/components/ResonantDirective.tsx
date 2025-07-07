import React, { useState } from 'react';
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetPortal,
} from '@/components/ui/sheet';
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { MessageCircle, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from '@/components/ui/button';
import WorkflowBuilder from './WorkflowBuilder';
import { useChatState } from '@/hooks/useChatState';
import { useNotifications } from '@/hooks/useNotifications';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';
import WelcomePopup from './chat/WelcomePopup';
import ReminderNotification from './chat/ReminderNotification';

// Custom sheet variants for no-overlay implementation
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

// Custom Sheet Content without overlay
const CustomSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & VariantProps<typeof sheetVariants> & {
    side?: "right";
  }
>(({ side = "right", className, children, onPointerDownOutside, onEscapeKeyDown, ...props }, ref) => (
  <SheetPortal>
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      onPointerDownOutside={onPointerDownOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      {...props}
    >
      {children}
      <SheetPrimitive.Close asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
CustomSheetContent.displayName = "CustomSheetContent";

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
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <CustomSheetContent 
          side="right" 
          className="w-96 h-full flex flex-col p-0 bg-gradient-to-br from-white to-gray-50 border-l-2 border-halo-primary/10"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-halo-primary to-halo-secondary">
            <SheetTitle className="flex items-center space-x-2 text-white font-semibold">
              <MessageCircle className="h-5 w-5 text-white" />
              <span className="text-white">Resonant Directive</span>
            </SheetTitle>
            <p className="text-xs text-white/90 font-medium">Your AI automation assistant</p>
          </SheetHeader>
          
          <ChatMessages messages={messages} isLoading={isLoading} />
          
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            onSendMessage={onSendMessage}
            onCreateWorkflow={handleCreateWorkflow}
          />
        </CustomSheetContent>
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