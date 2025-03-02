
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { X, Check, Image, MessageSquare, Clock, Shield, Globe, Smile, Reply, Star, BatteryFull, Ban, Award, Paint } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VIPRegistrationPage = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState('monthly');

  const handleClose = () => {
    navigate('/');
  };

  const handleSignup = () => {
    navigate('/vip/signup');
  };

  const benefits = [
    { icon: Image, title: 'Unlimited Photos', description: 'Share unlimited images without restrictions' },
    { icon: MessageSquare, title: 'Voice Messages', description: 'Send voice messages up to 5 minutes long' },
    { icon: Reply, title: 'Message Replies', description: 'Reply to specific messages in the conversation' },
    { icon: Smile, title: 'Message Reactions', description: 'React to messages with emojis and reactions' },
    { icon: Clock, title: '10-Hour History', description: 'Access chat history for up to 10 hours' },
    { icon: Globe, title: 'Real-time Translation', description: 'Translate messages in real-time to your language' },
    { icon: BatteryFull, title: 'Multi-device Login', description: 'Log in on up to 2 devices simultaneously' },
    { icon: Ban, title: 'No Inactivity Disconnect', description: 'Stay connected even during periods of inactivity' },
    { icon: Award, title: 'Special Badges', description: 'Display exclusive VIP badges on your profile' },
    { icon: Paint, title: 'Exclusive Themes', description: 'Access to special chat themes and customizations' },
    { icon: Shield, title: 'Enhanced Protection', description: 'Get enhanced protection against unwanted users' },
    { icon: Star, title: 'Priority in User Listing', description: 'Appear higher in the user discovery list' }
  ];

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
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">VIP Membership</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enhance your chat experience with exclusive premium features designed for our most valued users
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">VIP Benefits</CardTitle>
                <CardDescription>
                  Unlock these exclusive features with your VIP membership
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-1.5 mt-0.5">
                        <benefit.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Select Your Plan</CardTitle>
                <CardDescription>
                  Choose the plan that works best for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="monthly" className="w-full" value={plan} onValueChange={setPlan}>
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="semiannual">6 Months</TabsTrigger>
                    <TabsTrigger value="annual">Yearly</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="monthly" className="p-4 border rounded-md mt-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">$5.00</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>All premium features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Billed monthly</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Cancel anytime</span>
                      </li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="semiannual" className="p-4 border rounded-md mt-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                    <div className="absolute -top-3 right-4 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                      MOST POPULAR
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">$25.00</div>
                      <div className="text-sm text-muted-foreground">every 6 months</div>
                      <div className="text-amber-500 font-medium">$4.17/month - Save $5.00</div>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>All premium features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Billed every 6 months</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Cancel anytime</span>
                      </li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="annual" className="p-4 border rounded-md mt-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">$45.00</div>
                      <div className="text-sm text-muted-foreground">per year</div>
                      <div className="text-amber-500 font-medium">$3.75/month - Save $15.00</div>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>All premium features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Billed annually</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </TabsContent>
                </Tabs>
                
                <Button 
                  onClick={handleSignup} 
                  className="w-full mt-6"
                  variant="warning"
                >
                  Get VIP Access Now
                </Button>
                
                <div className="text-xs text-center mt-3 text-muted-foreground">
                  By subscribing you agree to our Terms of Service and Privacy Policy
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How does the billing work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Your subscription will be automatically renewed at the end of your billing cycle. You can cancel anytime from your account settings. We accept credit cards and PayPal payments.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I switch between plans?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new rate will be applied immediately. If you downgrade, the new rate will be applied at the next billing cycle.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I cancel my subscription?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>You can cancel your subscription at any time from your account settings. Your VIP benefits will remain active until the end of the current billing period.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VIPRegistrationPage;
