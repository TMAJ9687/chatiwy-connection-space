
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GuidancePopup } from '@/components/GuidancePopup';
import { ChatInterface } from '@/components/ChatInterface';
import { ConnectedUsers } from '@/components/ConnectedUsers';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showGuidance, setShowGuidance] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    // Check if we have user profile data from the previous page
    if (location.state?.userProfile) {
      setUserProfile(location.state.userProfile);
    } else {
      // If no profile data, redirect back to home
      navigate('/');
      toast.error('Please complete your profile first');
    }
  }, [location.state, navigate]);

  const handleGuidanceAccept = () => {
    setShowGuidance(false);
    toast.success('Welcome to Chatiwy! You can now start chatting.');
  };

  const handleGuidanceDecline = () => {
    navigate('/');
    toast.info('You need to accept the guidelines to use Chatiwy.');
  };

  if (!userProfile) {
    return null; // Don't render anything until we check for user profile
  }

  return (
    <>
      <Helmet>
        <title>Chat | Chatiwy</title>
        <meta name="description" content="Chat with people from around the world on Chatiwy" />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen py-10">
        {showGuidance && (
          <GuidancePopup 
            onAccept={handleGuidanceAccept} 
            onDecline={handleGuidanceDecline} 
          />
        )}
        
        {!showGuidance && (
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-1/4">
                <ConnectedUsers userProfile={userProfile} />
              </div>
              <div className="w-full lg:w-3/4">
                <ChatInterface userProfile={userProfile} />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
};

export default ChatPage;
