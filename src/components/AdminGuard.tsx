
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuthenticated');
      
      if (adminAuth === 'true') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        toast.error('Admin access required');
        navigate('/admin/login');
      }
    };
    
    checkAdminAuth();
  }, [navigate]);

  if (isAdmin === null) {
    // Loading state
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAdmin ? <>{children}</> : null;
};
