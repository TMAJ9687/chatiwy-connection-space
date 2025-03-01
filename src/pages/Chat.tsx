
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GuidancePopup } from '@/components/GuidancePopup';
import { ChatInterface } from '@/components/ChatInterface';
import { ConnectedUsers } from '@/components/ConnectedUsers';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import socketService from '@/services/socketService';

// Create a mock user database for demo purposes when WebSocket is not available
// This would be replaced by a real database in a production app
const mockConnectedUsers = new Map();

// Create a set to track user sessions by browser session
const sessionKey = 'chatiwy_session_id';

// Store your Render.com URL here after deployment
const RENDER_URL = 'https://chatiwy-test.onrender.com'; // Your actual Render.com WebSocket server URL

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showGuidance, setShowGuidance] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Connect to WebSocket server
  useEffect(() => {
    let isConnected = false;
    
    const connectToSocket = async () => {
      try {
        // If we have a custom Render URL, set it first
        if (RENDER_URL) {
          socketService.setCustomServerUrl(RENDER_URL);
        }
        
        await socketService.connect();
        setSocketConnected(true);
        isConnected = true;
        console.log('Connected to WebSocket server');
      } catch (error) {
        console.error('Failed to connect to WebSocket server:', error);
        toast.error('Unable to connect to chat server. Using offline mode.');
      }
    };
    
    connectToSocket();
    
    // Add reconnection logic
    const reconnectionInterval = setInterval(() => {
      if (!socketService.isConnected() && !isConnected) {
        console.log('Attempting to reconnect to WebSocket server...');
        connectToSocket();
      }
    }, 10000); // Try to reconnect every 10 seconds if not connected
    
    // Cleanup on unmount
    return () => {
      clearInterval(reconnectionInterval);
      socketService.disconnect();
    };
  }, []);
  
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
      
      // Check if username contains "admin" in any form
      if (profile.username.toLowerCase().includes('admin')) {
        navigate('/');
        toast.error('The username "admin" is reserved and cannot be used');
        return;
      }
      
      // If socket is connected, register user with the server
      if (socketConnected) {
        socketService.registerUser({
          ...profile,
          sessionId
        }).then(registeredUser => {
          // User successfully registered with WebSocket server
          setUserProfile({
            ...profile,
            id: registeredUser.id,
            sessionId
          });
        }).catch(error => {
          // Registration failed, handle error
          console.error('Registration error:', error);
          navigate('/');
          toast.error(error || 'Registration failed. Please try again.');
        });
      } else {
        // Fallback to local storage approach when WebSocket is not available
        
        // Check if username is already taken by someone else other than this session
        let isUsernameTakenByOther = false;
        mockConnectedUsers.forEach((user, key) => {
          if (user.username.toLowerCase() === profile.username.toLowerCase() && 
              user.sessionId !== sessionId && 
              user.isOnline) {
            isUsernameTakenByOther = true;
          }
        });
        
        if (isUsernameTakenByOther) {
          navigate('/');
          toast.error('This username is already taken. Please choose another one');
          return;
        }
        
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
      }
    } else {
      // If no profile data, redirect back to home
      navigate('/');
      toast.error('Please complete your profile first');
    }
    
    // Cleanup on unmount - mark user as offline
    return () => {
      if (userProfile && userProfile.id && !socketConnected) {
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
  }, [location.state, navigate, socketConnected]);

  // This handles the before unload event to mark users as offline when closing the browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = sessionStorage.getItem(sessionKey);
      if (sessionId && userProfile && !socketConnected) {
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
  }, [userProfile, socketConnected]);

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
                  socketConnected={socketConnected}
                />
              </div>
              <div className="w-full lg:w-3/4">
                <ChatInterface 
                  userProfile={userProfile} 
                  selectedUser={selectedUser}
                  onUserSelect={setSelectedUser}
                  socketConnected={socketConnected}
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
