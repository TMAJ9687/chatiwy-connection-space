
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { AdSensePlaceholder } from '@/components/AdSensePlaceholder';
import { getVipSettings } from '@/utils/siteSettings';

const Index = () => {
  const [username, setUsername] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const vipSettings = getVipSettings();

  // This function is just to demonstrate the VIP test credentials
  const showVipCredentials = () => {
    toast.info(
      <div className="text-sm">
        <p className="font-bold">VIP Credentials:</p>
        <p>Username: VIP_Tester</p>
        <p>Password: {vipSettings.accessCode}</p>
      </div>,
      { duration: 6000 }
    );
  };

  const handleStartChat = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    // Validate username (max 20 chars, alphanumeric, max 2 numbers)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(username)) {
      toast.error("Username can only contain letters and numbers");
      return;
    }
    
    const numberCount = (username.match(/[0-9]/g) || []).length;
    if (numberCount > 2) {
      toast.error("Username can contain a maximum of 2 numbers");
      return;
    }
    
    // Navigate to the profile page with the username
    navigate('/profile', { state: { username } });
  };

  const generateRandomUsername = () => {
    setIsGenerating(true);
    
    // Simulate API call for generating a username
    setTimeout(() => {
      const adjectives = ['Happy', 'Clever', 'Bright', 'Swift', 'Calm', 'Kind', 'Bold'];
      const nouns = ['Dolphin', 'Eagle', 'Tiger', 'Panda', 'Fox', 'Wolf', 'Lion'];
      
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomNum = Math.floor(Math.random() * 100);
      
      setUsername(`${randomAdjective}${randomNoun}${randomNum}`);
      setIsGenerating(false);
    }, 500);
  };

  // JSON-LD structured data for rich search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Chatiwy",
    "url": "https://chatiwy.app",
    "description": "Chatiwy is a secure platform for private, one-on-one text and image-based conversations, designed to foster meaningful connections.",
    "applicationCategory": "ChatApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "alternativeHeadline": "Private, anonymous chat with no registration required",
    "keywords": "anonymous chat, private messaging, secure chat, instant messaging, online chat, text chat, image sharing, no registration",
    "screenshot": "https://chatiwy.app/screenshot.png"
  };

  return (
    <>
      <Helmet>
        <title>Chatiwy - Private One-on-One Chat Platform | No Registration Required</title>
        <meta name="description" content="Connect instantly with people worldwide on Chatiwy, a secure platform for private, one-on-one text and image-based conversations. No registration required." />
        <meta name="keywords" content="anonymous chat, private messaging, secure chat, instant messaging, online chat, text chat, image sharing, no registration" />
        
        {/* Structured data */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
        
        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Chatiwy - Private One-on-One Chat Platform | No Registration Required" />
        <meta property="og:description" content="Connect instantly with people worldwide on Chatiwy, a secure platform for private, one-on-one text and image-based conversations." />
        <meta property="og:image" content="https://chatiwy.app/og-image.png" />
        <meta property="og:url" content="https://chatiwy.app" />
        <meta property="og:site_name" content="Chatiwy" />
        
        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Chatiwy - Private One-on-One Chat Platform" />
        <meta name="twitter:description" content="Connect instantly with people worldwide on Chatiwy, a secure platform for private, one-on-one conversations." />
        <meta name="twitter:image" content="https://chatiwy.app/og-image.png" />
      </Helmet>
      
      <Navbar />
      
      <main className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Vertical AdSense placeholder - Left sidebar */}
          <div className="hidden md:block md:w-40 lg:w-60 xl:w-80 p-3 self-stretch">
            <AdSensePlaceholder 
              slot="9876543210" 
              format="vertical" 
              className="h-full" 
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6">
              {/* Left section - VIP benefits */}
              <div className="md:w-1/2 xl:w-2/5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 rounded-3xl p-6 flex flex-col">
                <div className="mb-4">
                  <div className="inline-block py-1 px-3 bg-amber-500 text-white rounded-full text-sm mb-3">
                    Premium Experience
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Upgrade to <span className="text-amber-500">VIP</span> Membership</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Enhance your chatting experience with exclusive features and benefits designed for our most valued users
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">VIP Benefits:</h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      'Unlimited image uploads',
                      'Voice messaging',
                      'Message reactions',
                      'Read receipts',
                      '10-hour chat history',
                      'Ad-free experience',
                      'Customizable profile',
                      'Priority in user listing',
                      'Enhanced protection against bans',
                      'Editable interests',
                      'Free location selection',
                      'Can\'t be disconnected due to inactivity',
                      'Real-time translation',
                      'Password reset via email'
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">⦿</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-auto">
                  <Button 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                    onClick={() => showVipCredentials()}
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              {/* Right section - VIP pricing and Text Anonymously */}
              <div className="md:w-1/2 xl:w-3/5 flex flex-col gap-6">
                {/* VIP Pricing */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold mb-2">VIP Membership</h3>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-3xl font-bold">$5.00</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    <p className="text-gray-500 mt-1 text-sm">Cancel anytime</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Get VIP Access
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      By subscribing you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </div>

                {/* Text Anonymously Section */}
                <div className="bg-teal-50 dark:bg-teal-900/30 rounded-2xl p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2">
                      Text <span className="text-amber-500">Anonymously</span> with <span className="text-teal-500">no registration</span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Unleash your creativity and connect with like-minded individuals on our chatting website, 
                      where conversations come to life.
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-auto">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Type your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pr-12"
                        maxLength={20}
                      />
                      <button 
                        onClick={generateRandomUsername}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-teal-500 transition-colors"
                        disabled={isGenerating}
                      >
                        <RefreshCw className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    
                    <Button 
                      onClick={handleStartChat}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center gap-2"
                    >
                      Start Chat <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal AdSense Placeholder - Bottom */}
            <div className="w-full p-3">
              <AdSensePlaceholder 
                slot="1234567890" 
                format="horizontal" 
                className="h-24" 
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Index;
