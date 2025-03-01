
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GuidancePopup } from '@/components/GuidancePopup';
import { ChatInterface } from '@/components/ChatInterface';
import { ConnectedUsers } from '@/components/ConnectedUsers';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

// Create a mock user database for demo purposes
// This would be replaced by a real database in a production app
const mockConnectedUsers = new Map();

// Create a set to track user sessions by browser session
const sessionKey = 'chatiwy_session_id';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showGuidance, setShowGuidance] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  useEffect(() => {
    // Generate a unique session ID for this browser window if it doesn't exist
    let sessionId = sessionStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem(sessionKey, sessionId);
    }
    
    // Check if we have user profile data from the previous page
    if (location.state?.userProfile) {
      const profile = location.state.userProfile;
      
      // Ensure the profile has a unique identifier
      profile.id = profile.id || sessionId;
      profile.sessionId = sessionId;
      
      setUserProfile(profile);
      
      // Clear any previous entries with the same session ID
      mockConnectedUsers.forEach((user, key) => {
        if (user.sessionId === sessionId) {
          mockConnectedUsers.delete(key);
        }
      });
      
      // Store user in our mock database with a unique ID
      mockConnectedUsers.set(profile.id, {
        ...profile,
        isOnline: true,
        lastSeen: new Date()
      });
      
      console.log("Current connected users:", Array.from(mockConnectedUsers.entries()));
    } else {
      // If no profile data, redirect back to home
      navigate('/');
      toast.error('Please complete your profile first');
    }
    
    // Cleanup on unmount - mark user as offline
    return () => {
      if (userProfile && userProfile.id) {
        const user = mockConnectedUsers.get(userProfile.id);
        if (user) {
          mockConnectedUsers.set(userProfile.id, {
            ...user,
            isOnline: false,
            lastSeen: new Date()
          });
        }
      }
    };
  }, [location.state, navigate]);

  // This handles the before unload event to mark users as offline when closing the browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = sessionStorage.getItem(sessionKey);
      if (sessionId && userProfile) {
        mockConnectedUsers.forEach((user, key) => {
          if (user.sessionId === sessionId) {
            mockConnectedUsers.delete(key);
          }
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userProfile]);

  const handleGuidanceAccept = () => {
    setShowGuidance(false);
    toast.success('Welcome to Chatiwy! You can now start chatting.');
  };

  const handleGuidanceDecline = () => {
    navigate('/');
    toast.info('You need to accept the guidelines to use Chatiwy.');
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
  };

  if (!userProfile) {
    return null; // Don't render anything until we check for user profile
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Chat | Chatiwy</title>
        <meta name="description" content="Chat with people from around the world on Chatiwy" />
      </Helmet>
      
      <Navbar />
      
      {/* Added padding-top to account for the fixed navbar */}
      <main className="flex-1 py-4 pt-20">
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
                <ConnectedUsers 
                  userProfile={userProfile} 
                  selectedUser={selectedUser}
                  onUserSelect={handleUserSelect}
                />
              </div>
              <div className="w-full lg:w-3/4">
                <ChatInterface 
                  userProfile={userProfile} 
                  selectedUser={selectedUser}
                  onUserSelect={setSelectedUser}
                />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatPage;
