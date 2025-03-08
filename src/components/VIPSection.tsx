
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import VIPAuthModal from './VIPAuthModal';

const vipFeatures = [
  "Unlimited image uploads",
  "Voice messaging",
  "Message reactions",
  "Read receipts",
  "10-hour chat history",
  "Ad-free experience",
  "Customizable profile",
  "Priority in user listing",
  "Enhanced protection against bans",
  "Editable interests",
  "Free location selection",
  "Can't be disconnected due to inactivity",
  "Real-time translation",
  "Password reset via email",
  "Extended message length (200 characters)"
];

export function VIPSection() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleVIPClick = () => {
    // Check if user is logged in
    const userProfileStr = localStorage.getItem('userProfile');
    if (userProfileStr) {
      try {
        const user = JSON.parse(userProfileStr);
        // If user is already a VIP, go to profile setup or chat
        if (user.isVIP) {
          // If user has completed profile with country and interests, go directly to chat
          if (user.country && user.interests && user.interests.length > 0) {
            navigate('/chat', { state: { userProfile: user }});
          } else {
            // Otherwise go to profile setup
            navigate('/vip/profile');
          }
        } else {
          // Non-VIP user, show auth modal
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Error parsing user profile:', error);
        setShowAuthModal(true);
      }
    } else {
      // If not logged in, show auth modal
      setShowAuthModal(true);
    }
  };

  const handleLearnMore = () => {
    navigate('/vip');
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-amber-200/30 to-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-teal-200/30 to-teal-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block py-2 px-4 bg-amber-500 text-white rounded-full font-medium mb-4">
              Premium Experience
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Upgrade to <span className="text-amber-500">VIP</span> Membership</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Enhance your chatting experience with exclusive features and benefits designed for our most valued users
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-2">VIP Benefits:</h3>
              <ul className="space-y-3">
                {vipFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={handleLearnMore}
                className="mt-4"
                variant="outline"
              >
                Learn More
              </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">VIP Membership</h3>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-4xl font-bold">$5.00</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-gray-500 mt-2">Cancel anytime</p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleVIPClick}
                  className="btn-vip w-full"
                  variant="warning"
                >
                  Get VIP Access
                </Button>
                <p className="text-xs text-center text-gray-500">
                  By subscribing you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIP Auth Modal */}
      <VIPAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </section>
  );
}
