
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [isResetMode, setIsResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: ''
  });

  // Mock admin credentials - in a real app, this would be verified against a secure backend
  const ADMIN_CREDENTIALS = {
    email: 'admin@chatiwy.com',
    password: 'admin123'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check credentials - this is just for demo purposes
    // In a real application, this would be a secure API request
    if (formData.email === ADMIN_CREDENTIALS.email && formData.password === ADMIN_CREDENTIALS.password) {
      // Store admin session
      sessionStorage.setItem('adminAuthenticated', 'true');
      sessionStorage.setItem('adminProfile', JSON.stringify({
        firstName: 'Olivia',
        lastName: 'Rhye',
        email: 'olivia@untitledui.com',
        role: 'Admin',
        id: 'admin-001'
      }));
      
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.phone) {
      toast.error('Please provide both email and phone number');
      return;
    }
    
    // In a real app, this would trigger an email/SMS with reset instructions
    toast.success('Password reset link has been sent to your email and phone');
    setIsResetMode(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Helmet>
        <title>Admin Login | Chatiwy</title>
      </Helmet>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>
            {isResetMode 
              ? 'Enter your email and phone number to reset your password' 
              : 'Login to your admin account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={isResetMode ? handleResetRequest : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@chatiwy.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {isResetMode ? (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="pl-10"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full">
              {isResetMode ? 'Reset Password' : 'Login'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter>
          <Button
            variant="link"
            className="w-full"
            onClick={() => setIsResetMode(!isResetMode)}
          >
            {isResetMode ? 'Back to login' : 'Forgot password?'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
