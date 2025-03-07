
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  LifeBuoy, 
  Globe, 
  AlertCircle, 
  LogOut, 
  Settings 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminProfile, setAdminProfile] = React.useState<AdminProfile | null>(null);
  
  React.useEffect(() => {
    const profileData = sessionStorage.getItem('adminProfile');
    if (profileData) {
      setAdminProfile(JSON.parse(profileData));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminProfile');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const menuItems = [
    { 
      name: 'User Management', 
      path: '/admin/dashboard', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      name: 'User Support', 
      path: '/admin/support', 
      icon: <LifeBuoy className="h-5 w-5" /> 
    },
    { 
      name: 'Website Management', 
      path: '/admin/website', 
      icon: <Globe className="h-5 w-5" /> 
    },
    { 
      name: 'Active Issues', 
      path: '/admin/issues', 
      icon: <AlertCircle className="h-5 w-5" /> 
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!adminProfile) return null;

  return (
    <div className="w-64 border-r h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">chatiwy.</h1>
      </div>
      
      <Card className="mx-4 p-4 mb-4">
        <div className="flex space-x-4 items-center">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=admin`} alt="Admin" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium flex items-center">
              Admin: {adminProfile.firstName} {adminProfile.lastName}
              <Settings className="ml-2 h-4 w-4 cursor-pointer" />
            </div>
            <div className="text-sm text-muted-foreground">{adminProfile.email}</div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">First Name:</div>
          <div>{adminProfile.firstName}</div>
        </div>
        <div className="space-y-1 mt-2">
          <div className="text-sm text-muted-foreground">Last Name:</div>
          <div>{adminProfile.lastName}</div>
        </div>
      </Card>

      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive(item.path) ? 'font-medium' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
