
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export function Navbar() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

          <Button 
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
