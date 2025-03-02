
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { X, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const VIPResetPasswordPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = () => {
    navigate('/vip/login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier) {
      toast.error('Please enter your email or nickname');
      return;
    }
    
    if (identifier.includes('@') && !identifier.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    // Mock password reset - in a real app, this would be an API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Password reset link sent! Please check your email.');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Reset Password | Chatiwy VIP</title>
        <meta name="description" content="Reset your VIP account password on Chatiwy" />
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
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                {!isSubmitted 
                  ? "Enter your email address and we'll send you a link to reset your password"
                  : "Check your email for a password reset link"
                }
              </CardDescription>
            </CardHeader>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="identifier" 
                        type="text" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter your email address"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/vip/login')}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? 'Sending...' : 'Reset Password'} 
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6 pt-4 pb-6">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-md border border-green-200 dark:border-green-800 text-center">
                  <p className="text-green-800 dark:text-green-300 mb-2 font-medium">Reset Link Sent!</p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    We've sent a password reset link to <strong>{identifier}</strong>
                  </p>
                </div>
                
                <div className="text-sm text-center text-muted-foreground">
                  <p>Didn't receive the email? Check your spam folder or</p>
                  <Button 
                    variant="link"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="p-0 h-auto"
                  >
                    click here to try again
                  </Button>
                </div>
                
                <Button 
                  onClick={() => navigate('/vip/login')} 
                  className="w-full"
                >
                  Return to Login
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VIPResetPasswordPage;
