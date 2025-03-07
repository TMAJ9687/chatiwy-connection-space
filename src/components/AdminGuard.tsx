import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
      setIsAuthenticated(adminAuthenticated);
      
      if (!adminAuthenticated && location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
        toast.error('Admin authentication required');
        navigate('/admin/login');
      }
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate, location.pathname]);

  if (isAuthenticated === null) {
    return null;
  }

  if (location.pathname === '/admin/login' && isAuthenticated) {
    navigate('/admin/dashboard');
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;
