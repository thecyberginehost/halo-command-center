import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TenantProvider } from "@/contexts/TenantContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import ProfileSettings from "./pages/ProfileSettings";
import Automations from "./pages/Automations";
import CreateAutomation from "./pages/CreateAutomation";
import CreateOrganization from "./pages/CreateOrganization";
import WorkflowBuilderPage from "./pages/WorkflowBuilderPage";
import Credentials from "./pages/Credentials";
import AIAssist from "./pages/AIAssist";
import Documentation from "./pages/Documentation";
import Enterprise from "./pages/Enterprise";
import Performance from "./pages/Performance";
import Marketplace from "./pages/Marketplace";
import Forum from "./pages/Forum";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SidebarProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
                  <Route path="/automations/create" element={<ProtectedRoute><CreateAutomation /></ProtectedRoute>} />
                  <Route path="/automations/create/:workflowId" element={<ProtectedRoute><CreateAutomation /></ProtectedRoute>} />
                  <Route path="/credentials" element={<ProtectedRoute><Credentials /></ProtectedRoute>} />
                  <Route path="/ai-assist" element={<ProtectedRoute><AIAssist /></ProtectedRoute>} />
                  <Route path="/docs" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
                  <Route path="/enterprise" element={<ProtectedRoute><Enterprise /></ProtectedRoute>} />
                  <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                  <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
                  <Route path="/organizations/create" element={<ProtectedRoute><CreateOrganization /></ProtectedRoute>} />
                  <Route path="/workflow-builder/:workflowId" element={<ProtectedRoute><WorkflowBuilderPage /></ProtectedRoute>} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SidebarProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
