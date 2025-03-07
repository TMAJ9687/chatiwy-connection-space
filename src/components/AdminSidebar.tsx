
import React, { useState, useEffect } from 'react';
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
  Upload,
  Flag,
  History,
  Ban,
  Wifi,
  KeyRound,
  Mail
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
  
  // Password change states
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  useEffect(() => {
    // Check authentication on component mount and page refresh
    const checkAuth = () => {
      const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
      if (!isAuthenticated && location.pathname.startsWith('/admin')) {
        navigate('/admin/login');
      }
    };

    checkAuth();
    
    // Load profile
    const profileData = sessionStorage.getItem('adminProfile');
    if (profileData) {
      setAdminProfile(JSON.parse(profileData));
      setEditedProfile(JSON.parse(profileData));
    }

    // Add event listener for page refreshes
    window.addEventListener('beforeunload', () => {
      // This prevents redirection on refresh by ensuring session persists
      if (sessionStorage.getItem('adminAuthenticated')) {
        // Session is preserved on refresh
      }
    });
  }, [navigate, location.pathname]);

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

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({
      ...passwordData,
      [field]: value
    });
    setPasswordError('');
  };

  const handleSubmitPasswordChange = () => {
    // Check if current password is correct (in a real app, this would be verified against backend)
    const adminCredentials = {
      email: 'admin@chatiwy.com',
      password: 'admin123'
    };

    if (passwordData.currentPassword !== adminCredentials.password) {
      setPasswordError('Current password is incorrect');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    // In a real app, this would send the new password to the backend
    // For this demo, we'll just simulate success

    // Reset fields
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Show confirmation that we sent email
    setEmailConfirmationSent(true);

    // In a real application, we would send an email confirmation here
    // For this demo, we'll simulate an email being sent
    setTimeout(() => {
      setEmailConfirmationSent(false);
      setIsPasswordDialogOpen(false);
      toast.success('Password changed successfully');
    }, 2000);
  };

  const menuItems = [
    { 
      name: 'User Management', 
      path: '/admin/dashboard', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      name: 'User Reports', 
      path: '/admin/reports', 
      icon: <Flag className="h-5 w-5" /> 
    },
    { 
      name: 'Banned IPs', 
      path: '/admin/banned-ips', 
      icon: <Wifi className="h-5 w-5" /> 
    },
    { 
      name: 'Chat History', 
      path: '/admin/chat-history', 
      icon: <History className="h-5 w-5" /> 
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
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 flex items-center justify-center"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Change Password
            </Button>
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

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              {emailConfirmationSent 
                ? "Sending email confirmation..." 
                : "Update your password. You'll need to confirm this change via email."}
            </DialogDescription>
          </DialogHeader>
          
          {emailConfirmationSent ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <Mail className="h-12 w-12 text-primary animate-pulse" />
              <p className="text-center">
                Sending confirmation email to<br/>
                <strong>{adminProfile.email}</strong>
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                {passwordError && (
                  <div className="text-destructive text-sm">{passwordError}</div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="current-password" className="text-right">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-password" className="text-right">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="confirm-password" className="text-right">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitPasswordChange}>
                  Update Password
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
