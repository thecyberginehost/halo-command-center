import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TenantProvider } from "@/contexts/TenantContext";
import { ChatProvider } from "@/contexts/ChatContext";
import Index from "./pages/Index";
import Automations from "./pages/Automations";
import CreateAutomation from "./pages/CreateAutomation";
import CreateOrganization from "./pages/CreateOrganization";
import WorkflowBuilderPage from "./pages/WorkflowBuilderPage";
import Credentials from "./pages/Credentials";
import AIAssist from "./pages/AIAssist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TenantProvider>
      <ChatProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/automations" element={<Automations />} />
              <Route path="/automations/create" element={<CreateAutomation />} />
              <Route path="/automations/create/:workflowId" element={<CreateAutomation />} />
              <Route path="/credentials" element={<Credentials />} />
              <Route path="/ai-assist" element={<AIAssist />} />
              <Route path="/organizations/create" element={<CreateOrganization />} />
              <Route path="/workflow-builder/:workflowId" element={<WorkflowBuilderPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ChatProvider>
    </TenantProvider>
  </QueryClientProvider>
);

export default App;
