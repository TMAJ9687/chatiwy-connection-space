
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { X, Check, Image, MessageSquare, Clock, Shield, Globe, Smile, Reply, Star, BatteryFull, Ban, Award, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/components/ThemeProvider';

const VIPRegistrationPage = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState('monthly');
  const { theme, setTheme } = useTheme();

  const handleClose = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/vip/login');
  };

  const handleSignup = () => {
    navigate('/vip/signup');
  };

  const handleGetVipAccess = () => {
    navigate('/vip/signup');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Helmet>
        <title>VIP Registration | Chatiwy</title>
        <meta name="description" content="Register for VIP membership on Chatiwy" />
      </Helmet>
      
      <header className="border-b border-gray-200 dark:border-gray-800 py-3 px-4 flex items-center justify-between bg-white dark:bg-gray-900 fixed w-full z-10">
        <div className="flex items-center">
          <div className="text-xl font-bold">
            <span className="text-teal-500">chati</span>wy<span className="text-coral-500">.</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleClose}
            variant="ghost" 
            size="sm"
            className="mr-2"
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-full px-2 py-1">
            <img src="https://flagcdn.com/gb.svg" alt="English" className="w-6 h-6 rounded-full object-cover" />
          </div>
          <Button 
            variant="warning" 
            size="sm" 
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <span>VIP Membership</span>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 py-4 pt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center gap-4 my-6">
            <Button 
              onClick={handleGetVipAccess} 
              variant="warning"
              className="bg-amber-500 hover:bg-amber-600 text-white px-6"
            >
              Get VIP Access
            </Button>
            <Button 
              onClick={handleLogin} 
              variant="outline"
              className="px-6"
            >
              Login
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800">
                <h1 className="text-2xl font-bold mb-2">VIP Benefits</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Unlock these exclusive features with your VIP membership</p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Image className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Unlimited Photos</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Share unlimited images without restrictions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Voice Messages</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send voice messages up to 5 minutes long</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Reply className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Message Replies</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reply to specific messages in the conversation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Smile className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Message Reactions</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">React to messages with emojis and reactions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">10-Hour History</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Access chat history for up to 10 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <BatteryFull className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Multi-device Login</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Log in on up to 2 devices simultaneously</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Ban className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">No Inactivity Disconnect</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stay connected even during periods of inactivity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md">
                <h2 className="text-2xl font-bold mb-2">Select Your Plan</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Choose the plan that works best for you</p>
                
                <Tabs defaultValue="monthly" className="w-full" value={plan} onValueChange={setPlan}>
                  <TabsList className="grid grid-cols-3 w-full mb-6">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="semiannual">6 Months</TabsTrigger>
                    <TabsTrigger value="annual">Yearly</TabsTrigger>
                  </TabsList>
                  
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                    {plan === 'monthly' && (
                      <div className="text-center">
                        <div className="text-3xl font-bold">$5.00</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">per month</div>
                        
                        <div className="mt-6 space-y-2 text-left">
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>All premium features</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>Billed monthly</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>Cancel anytime</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {plan === 'semiannual' && (
                      <div className="text-center">
                        <div className="text-3xl font-bold">$25.00</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">every 6 months</div>
                        <div className="text-amber-500 font-medium mt-1">$4.17/month - Save $5.00</div>
                        
                        <div className="mt-6 space-y-2 text-left">
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>All premium features</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>Billed every 6 months</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>Cancel anytime</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {plan === 'annual' && (
                      <div className="text-center">
                        <div className="text-3xl font-bold">$45.00</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">per year</div>
                        <div className="text-amber-500 font-medium mt-1">$3.75/month - Save $15.00</div>
                        
                        <div className="mt-6 space-y-2 text-left">
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>All premium features</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>Billed annually</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>Priority support</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleGetVipAccess} 
                      className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Get VIP Access Now
                    </Button>
                    
                    <div className="text-xs text-center mt-3 text-gray-500 dark:text-gray-400">
                      By subscribing you agree to our Terms of Service and Privacy Policy
                    </div>
                  </div>
                </Tabs>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800">
                <h1 className="text-2xl font-bold mb-2">More Benefits</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Enjoy these additional VIP features</p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Real-time Translation</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Translate messages in real-time to your language</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Special Badges</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Display exclusive VIP badges on your profile</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Palette className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Exclusive Themes</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Access to special chat themes and customizations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Enhanced Protection</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get enhanced protection against unwanted users</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2 mt-0.5">
                      <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Priority in User Listing</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Appear higher in the user discovery list</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md">
                <h3 className="text-xl font-bold mb-4">Why Choose VIP?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-teal-100 dark:bg-teal-800/50 p-2 mt-0.5">
                      <Shield className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Enhanced Privacy</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enjoy additional protection features and priority support from our moderation team.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-teal-100 dark:bg-teal-800/50 p-2 mt-0.5">
                      <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Premium Communication</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Express yourself better with voice messages, reactions, and extended text capabilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <h3 className="font-bold mb-2">How does the billing work?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your subscription will be automatically renewed at the end of your billing cycle. You can cancel anytime from your account settings. We accept credit cards and PayPal payments.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <h3 className="font-bold mb-2">Can I switch between plans?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new rate will be applied immediately. If you downgrade, the new rate will be applied at the next billing cycle.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <h3 className="font-bold mb-2">How do I cancel my subscription?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You can cancel your subscription at any time from your account settings. Your VIP benefits will remain active until the end of the current billing period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VIPRegistrationPage;
