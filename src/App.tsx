
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import AdminGuard from "./components/AdminGuard";
import Index from "./pages/Index";
import ProfilePage from "./pages/Profile";
import ChatPage from "./pages/Chat";
import NotFound from "./pages/NotFound";
import VIP from "./pages/VIP";
import VIPRegistration from "./pages/VIPRegistration";
import VIPLogin from "./pages/VIPLogin";
import VIPSignup from "./pages/VIPSignup";
import VIPResetPasswordPage from "./pages/VIPResetPassword";

// Import admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSupport from "./pages/AdminSupport";
import AdminWebsite from "./pages/AdminWebsite";
import AdminIssues from "./pages/AdminIssues";
import AdminInbox from "./pages/AdminInbox";
import AdminBots from "./pages/AdminBots";
import AdminReports from "./pages/AdminReports";
import AdminBannedIPs from "./pages/AdminBannedIPs";
import AdminChatHistory from "./pages/AdminChatHistory";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* VIP routes */}
              <Route path="/vip" element={<VIP />} />
              <Route path="/vip/login" element={<VIPLogin />} />
              <Route path="/vip/signup" element={<VIPSignup />} />
              <Route path="/vip/reset-password" element={<VIPResetPasswordPage />} />
              <Route path="/vip/registration" element={<VIPRegistration />} />
              
              {/* Admin routes - all protected with AdminGuard */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="/admin/reports" element={<AdminGuard><AdminReports /></AdminGuard>} />
              <Route path="/admin/banned-ips" element={<AdminGuard><AdminBannedIPs /></AdminGuard>} />
              <Route path="/admin/chat-history" element={<AdminGuard><AdminChatHistory /></AdminGuard>} />
              <Route path="/admin/support" element={<AdminGuard><AdminSupport /></AdminGuard>} />
              <Route path="/admin/website" element={<AdminGuard><AdminWebsite /></AdminGuard>} />
              <Route path="/admin/issues" element={<AdminGuard><AdminIssues /></AdminGuard>} />
              <Route path="/admin/inbox" element={<AdminGuard><AdminInbox /></AdminGuard>} />
              <Route path="/admin/bots" element={<AdminGuard><AdminBots /></AdminGuard>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
