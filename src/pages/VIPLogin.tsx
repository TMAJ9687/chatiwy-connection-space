
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { isValidVipCode, getVipSettings } from '@/utils/siteSettings';

const VIPLoginPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    // Check if the user is the VIP tester or has a valid VIP code
    const vipSettings = getVipSettings();
    const isVipTester = identifier.toLowerCase() === 'vip_tester' && 
                         password === vipSettings.accessCode;
    
    // In a real app, this would validate against a database
    if (isVipTester || isValidVipCode(password)) {
      // Store VIP user profile in localStorage
      localStorage.setItem('userProfile', JSON.stringify({
        username: identifier,
        isVIP: true,
        joinDate: new Date().toISOString()
      }));
      
      toast.success('Login successful! Welcome to VIP.');
      
      // Redirect to VIP profile setup page
      setTimeout(() => {
        setIsLoading(false);
        navigate('/vip/profile');
      }, 800);
    } else {
      setIsLoading(false);
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>VIP Login | Chatiwy</title>
        <meta name="description" content="Login to your VIP account on Chatiwy" />
      </Helmet>
      
      <Navbar>
        <Button 
          onClick={handleClose} 
          variant="ghost" 
          size="sm"
          className="mr-2"
        >
          <X className="h-4 w-4 mr-1" />
          Close
        </Button>
      </Navbar>
      
      <main className="flex-1 py-4 pt-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>VIP Login</CardTitle>
              <CardDescription>
                Login to your VIP account to access premium features
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email or Nickname</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="identifier" 
                      type="text" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter your email or nickname"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="text-sm text-right">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-amber-500 hover:text-amber-600"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/vip/reset-password');
                    }}
                  >
                    Forgot password?
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate('/vip/signup')}
                >
                  Need an account?
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? 'Logging in...' : 'Login'} 
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VIPLoginPage;
