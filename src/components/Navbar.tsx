import { useState, useEffect, ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import VIPAuthModal from './VIPAuthModal';
import { useTheme } from '@/components/ThemeProvider';

interface NavbarProps {
  children?: ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  
  // Check if user is logged in by looking for userProfile in localStorage
  const isLoggedIn = localStorage.getItem('userProfile') !== null;
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';
  // Check if we're on the chat page
  const isChatPage = location.pathname === '/chat';
  // Check if we're on a VIP page
  const isVIPPage = location.pathname.startsWith('/vip');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    // Clear any user data from localStorage if needed
    localStorage.removeItem('userProfile');
    
    // Show logout toast
    toast.success('Logged out successfully');
    
    // Navigate to home page
    navigate('/');
  };

  const handleVIPClick = () => {
    // If we're already on a VIP page, navigate to registration
    if (location.pathname.startsWith('/vip')) {
      navigate('/vip/register');
    } else {
      // Otherwise show the modal
      setShowVIPModal(true);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // If we're on the chat page, prevent default behavior and just refresh the chat
    if (isChatPage) {
      e.preventDefault();
      window.location.reload();
    }
    // Otherwise, the default Link behavior will navigate to "/"
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2 bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-md' : 'py-4 bg-background/95 dark:bg-background/95 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-bold text-foreground hover:text-teal-500 transition-colors duration-300"
          onClick={handleLogoClick}
        >
          <span className="text-teal-500">chati</span>wy<span className="text-coral-500">.</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          {/* Render children first if provided */}
          {children}
        
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-full px-2 py-1">
            <img src="https://flagcdn.com/gb.svg" alt="English" className="w-6 h-6 rounded-full object-cover" />
          </div>
          
          <Button 
            className="btn-vip hidden sm:flex"
            onClick={handleVIPClick}
          >
            VIP Membership
          </Button>

          {/* Only show logout button if logged in and not on landing page or VIP page */}
          {isLoggedIn && !isLandingPage && !isVIPPage && (
            <Button 
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>

      {/* VIP Auth Modal */}
      <VIPAuthModal 
        isOpen={showVIPModal} 
        onClose={() => setShowVIPModal(false)} 
      />
    </header>
  );
}
