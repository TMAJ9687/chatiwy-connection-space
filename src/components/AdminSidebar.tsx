
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  LifeBuoy, 
  Globe, 
  AlertCircle, 
  LogOut, 
  Settings,
  Inbox,
  Bot,
  Upload
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  age?: number;
  avatarUrl?: string;
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<AdminProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  React.useEffect(() => {
    const profileData = sessionStorage.getItem('adminProfile');
    if (profileData) {
      setAdminProfile(JSON.parse(profileData));
      setEditedProfile(JSON.parse(profileData));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminProfile');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedProfile({...adminProfile});
    }
  };

  const handleProfileChange = (field: keyof AdminProfile, value: string | number) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value
      });
    }
  };

  const handleSaveProfile = () => {
    if (editedProfile) {
      sessionStorage.setItem('adminProfile', JSON.stringify(editedProfile));
      setAdminProfile(editedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const imageUrl = URL.createObjectURL(file);
      if (editedProfile) {
        setEditedProfile({
          ...editedProfile,
          avatarUrl: imageUrl
        });
      }
    }
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
    { 
      name: 'Inbox', 
      path: '/admin/inbox', 
      icon: <Inbox className="h-5 w-5" /> 
    },
    { 
      name: 'Bot Management', 
      path: '/admin/bots', 
      icon: <Bot className="h-5 w-5" /> 
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
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={editedProfile?.avatarUrl || `https://api.dicebear.com/7.x/personas/svg?seed=admin`} 
                alt="Admin" 
              />
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="h-3 w-3 text-white" />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium flex items-center justify-between">
              <span>Admin Profile</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleEditToggle}
              >
                <Settings className="h-4 w-4 cursor-pointer" />
              </Button>
            </div>
            {!isEditing ? (
              <div className="text-sm text-muted-foreground">{adminProfile.email}</div>
            ) : (
              <Input 
                size={1}
                className="text-sm mt-1" 
                placeholder="Email"
                value={editedProfile?.email || ''}
                onChange={(e) => handleProfileChange('email', e.target.value)}
              />
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {!isEditing ? (
          <>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Name:</div>
              <div>{adminProfile.firstName} {adminProfile.lastName}</div>
            </div>
            {adminProfile.age && (
              <div className="space-y-1 mt-2">
                <div className="text-sm text-muted-foreground">Age:</div>
                <div>{adminProfile.age}</div>
              </div>
            )}
            {adminProfile.gender && (
              <div className="space-y-1 mt-2">
                <div className="text-sm text-muted-foreground">Gender:</div>
                <div>{adminProfile.gender}</div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-1 mb-2">
              <div className="text-sm text-muted-foreground">First Name:</div>
              <Input 
                className="h-8" 
                value={editedProfile?.firstName || ''}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-1 mb-2">
              <div className="text-sm text-muted-foreground">Last Name:</div>
              <Input 
                className="h-8" 
                value={editedProfile?.lastName || ''}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
              />
            </div>
            <div className="space-y-1 mb-2">
              <div className="text-sm text-muted-foreground">Age:</div>
              <Input 
                className="h-8" 
                type="number"
                value={editedProfile?.age || ''}
                onChange={(e) => handleProfileChange('age', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-1 mb-2">
              <div className="text-sm text-muted-foreground">Gender:</div>
              <Input 
                className="h-8" 
                value={editedProfile?.gender || ''}
                onChange={(e) => handleProfileChange('gender', e.target.value)}
              />
            </div>
            <Button 
              className="w-full mt-2" 
              size="sm"
              onClick={handleSaveProfile}
            >
              Save Changes
            </Button>
          </>
        )}
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
