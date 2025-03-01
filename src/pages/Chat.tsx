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

const mockConnectedUsers = new Map();
const sessionKey = 'chatiwy_session_id';
const RENDER_URL = 'https://chatiwy-test.onrender.com';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showGuidance, setShowGuidance] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  
  useEffect(() => {
    let isConnected = false;
    
    const connectToSocket = async () => {
      try {
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
    
    const reconnectionInterval = setInterval(() => {
      if (!socketService.isConnected() && !isConnected) {
        console.log('Attempting to reconnect to WebSocket server...');
        connectToSocket();
      }
    }, 10000);
    
    return () => {
      clearInterval(reconnectionInterval);
      socketService.disconnect();
    };
  }, []);
  
  useEffect(() => {
    let sessionId = sessionStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem(sessionKey, sessionId);
    }
    
    if (location.state?.userProfile) {
      const profile = location.state.userProfile;
      
      if (profile.username.toLowerCase().includes('admin')) {
        navigate('/');
        toast.error('The username "admin" is reserved and cannot be used');
        return;
      }
      
      if (socketConnected) {
        socketService.registerUser({
          ...profile,
          sessionId
        }).then(registeredUser => {
          setUserProfile({
            ...profile,
            id: registeredUser.id,
            sessionId
          });
        }).catch(error => {
          console.error('Registration error:', error);
          navigate('/');
          toast.error(error || 'Registration failed. Please try again.');
        });
      } else {
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
        
        profile.id = profile.id || sessionId;
        profile.sessionId = sessionId;
        
        setUserProfile(profile);
        
        mockConnectedUsers.forEach((user, key) => {
          if (user.sessionId === sessionId) {
            mockConnectedUsers.delete(key);
          }
        });
        
        mockConnectedUsers.set(profile.id, {
          ...profile,
          isOnline: true,
          lastSeen: new Date()
        });
        
        console.log("Current connected users:", Array.from(mockConnectedUsers.entries()));
      }
    } else {
      navigate('/');
      toast.error('Please complete your profile first');
    }
    
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
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Chat | Chatiwy</title>
        <meta name="description" content="Chat with people from around the world on Chatiwy" />
      </Helmet>
      
      <Navbar />
      
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
