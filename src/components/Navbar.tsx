
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from '@/components/ModeToggle';

interface NavbarProps {
  children?: React.ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const location = useLocation();
  
  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/chat') {
      e.preventDefault();
      // The actual refresh logic is in Chat.tsx
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-2xl text-primary"
            onClick={handleLogoClick}
          >
            Chatiwy
          </Link>
          <div className="flex items-center gap-4">
            {children}
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
