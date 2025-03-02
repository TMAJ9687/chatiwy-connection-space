
import React from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const VIPRegistrationPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>VIP Registration | Chatiwy</title>
        <meta name="description" content="Register for VIP membership on Chatiwy" />
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
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>VIP Registration</CardTitle>
              <CardDescription>
                Register for VIP membership to unlock premium features on Chatiwy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* VIP registration content would go here */}
              <p className="mb-4">Complete your VIP registration below to enjoy these benefits:</p>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li>Ad-free experience across the platform</li>
                <li>Unlimited image sharing</li>
                <li>Voice message support</li>
                <li>Priority customer support</li>
                <li>Exclusive profile badges</li>
              </ul>
              
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
                <p className="text-amber-700 dark:text-amber-300 text-center">
                  VIP registration is coming soon! This is a preview of the registration page.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button disabled>Complete Registration</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VIPRegistrationPage;
