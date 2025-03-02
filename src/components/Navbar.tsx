
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut, Inbox } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Add location to check current route
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Check if user is logged in by looking for userProfile in localStorage
  const isLoggedIn = localStorage.getItem('userProfile') !== null;
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for unread messages
  useEffect(() => {
    // This will listen to changes in the unreadMessagesPerUser Set
    const checkUnreadMessages = () => {
      const unreadMessagesPerUser = window.unreadMessagesPerUser;
      if (unreadMessagesPerUser) {
        setUnreadCount(unreadMessagesPerUser.size);
      }
    };

    // Set initial value
    checkUnreadMessages();

    // Set up an interval to check periodically
    const intervalId = setInterval(checkUnreadMessages, 3000);
    
    // Clean up
    return () => clearInterval(intervalId);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    // Clear any user data from localStorage if needed
    localStorage.removeItem('userProfile');
    
    // Show logout toast
    toast.success('Logged out successfully');
    
    // Navigate to home page
    navigate('/');
  };

  const handleInboxClick = () => {
    // Get current chat view
    const currentView = document.querySelector('[data-chat-view]');
    if (currentView) {
      currentView.setAttribute('data-chat-view', 'inbox');
    }
    
    // Navigate to chat page if not already there
    if (window.location.pathname !== '/chat') {
      navigate('/chat');
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2 bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-md' : 'py-4 bg-background/95 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-bold text-foreground hover:text-teal-500 transition-colors duration-300"
        >
          <span className="text-teal-500">chati</span>wy<span className="text-coral-500">.</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          {/* Only show inbox button if logged in and not on landing page */}
          {isLoggedIn && !isLandingPage && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={unreadCount > 0 ? "success" : "outline"} 
                    size="icon" 
                    className="rounded-full"
                    onClick={handleInboxClick}
                  >
                    {unreadCount > 0 ? (
                      <div className="relative">
                        <Inbox className="h-5 w-5" />
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center"
                        >
                          {unreadCount}
                        </Badge>
                      </div>
                    ) : (
                      <Inbox className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{unreadCount > 0 ? `${unreadCount} unread messages` : 'Inbox'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-full px-2 py-1">
            <img src="https://flagcdn.com/gb.svg" alt="English" className="w-6 h-6 rounded-full object-cover" />
          </div>
          
          <Button 
            className="btn-vip hidden sm:flex"
          >
            VIP Membership
          </Button>

          {/* Only show logout button if logged in and not on landing page */}
          {isLoggedIn && !isLandingPage && (
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
    </header>
  );
}
