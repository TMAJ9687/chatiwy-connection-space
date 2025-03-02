import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import ProfilePage from "./pages/Profile";
import ChatPage from "./pages/Chat";
import NotFound from "./pages/NotFound";
import VIP from "./pages/VIP";
import VIPRegistration from "./pages/VIPRegistration";
import VIPLogin from "./pages/VIPLogin";
import VIPSignup from "./pages/VIPSignup";
import VIPResetPasswordPage from "./pages/VIPResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/vip" element={<VIP />} />
            <Route path="/vip/register" element={<VIPRegistration />} />
            <Route path="/vip/login" element={<VIPLogin />} />
            <Route path="/vip/signup" element={<VIPSignup />} />
            <Route path="/vip/reset-password" element={<VIPResetPasswordPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
