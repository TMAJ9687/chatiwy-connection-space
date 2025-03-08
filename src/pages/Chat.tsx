
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GuidancePopup } from '@/components/GuidancePopup';
import { ChatInterface } from '@/components/ChatInterface';
import { ConnectedUsers } from '@/components/ConnectedUsers';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import socketService from '@/services/socketService';
import { Button } from '@/components/ui/button';
import { LogOut, MessageSquare, X, Bell, User, ArrowLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockConnectedUsers = new Map();
const sessionKey = 'chatiwy_session_id';
const RENDER_URL = 'https://chatiwy-test.onrender.com';
const GUIDANCE_ACCEPTED_KEY = 'chatiwy_guidance_accepted';

// Initialize global for unread messages
declare global {
  interface Window {
    unreadMessagesPerUser: Set<string>;
  }
}

if (!window.unreadMessagesPerUser) {
  window.unreadMessagesPerUser = new Set<string>();
}

interface InboxMessage {
  id: string;
  sender: string;
  senderId: string;
  avatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

const mockInboxMessages: InboxMessage[] = [
  {
    id: '1',
    sender: 'User',
    senderId: 'user1',
    avatar: 'https://uifaces.co/api/portraits/men/1',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: false
  },
  {
    id: '2',
    sender: 'User',
    senderId: 'user2',
    avatar: 'https://uifaces.co/api/portraits/men/2',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: true
  },
  {
    id: '3',
    sender: 'User',
    senderId: 'user3',
    avatar: 'https://uifaces.co/api/portraits/women/3',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: false
  },
  {
    id: '4',
    sender: 'User',
    senderId: 'user4',
    avatar: 'https://uifaces.co/api/portraits/women/4',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: false
  },
  {
    id: '5',
    sender: 'User',
    senderId: 'user5',
    avatar: 'https://uifaces.co/api/portraits/men/5',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: true
  },
  {
    id: '6',
    sender: 'User',
    senderId: 'user6',
    avatar: 'https://uifaces.co/api/portraits/women/6',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: false
  },
  {
    id: '7',
    sender: 'User',
    senderId: 'user7',
    avatar: 'https://uifaces.co/api/portraits/men/7',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: true
  },
  {
    id: '8',
    sender: 'User',
    senderId: 'user8',
    avatar: 'https://uifaces.co/api/portraits/women/8',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: false
  },
  {
    id: '9',
    sender: 'User',
    senderId: 'user9',
    avatar: 'https://uifaces.co/api/portraits/men/9',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: true
  },
  {
    id: '10',
    sender: 'User',
    senderId: 'user10',
    avatar: 'https://uifaces.co/api/portraits/women/10',
    content: 'The weather will be perfect for the stroll',
    timestamp: new Date(),
    isRead: false
  }
];

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showGuidance, setShowGuidance] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(mockInboxMessages);
  const [showInbox, setShowInbox] = useState(false);
  const [isVipUser, setIsVipUser] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // Check if guidance was previously accepted
  useEffect(() => {
    const guidanceAccepted = localStorage.getItem(GUIDANCE_ACCEPTED_KEY) === 'true';
    setShowGuidance(!guidanceAccepted);
  }, []);
  
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
      
      // Check if user is VIP
      setIsVipUser(!!profile.isVIP);
      
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
        
        // Clean up existing user with the same session ID
        mockConnectedUsers.forEach((user, key) => {
          if (user.sessionId === sessionId) {
            mockConnectedUsers.delete(key);
          }
        });
        
        // Remove any offline users immediately
        mockConnectedUsers.forEach((user, key) => {
          if (!user.isOnline) {
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
          // Immediately remove the user when they disconnect
          mockConnectedUsers.delete(userProfile.id);
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
    // Save guidance acceptance to localStorage
    localStorage.setItem(GUIDANCE_ACCEPTED_KEY, 'true');
    toast.success('Welcome to Chatiwy! You can now start chatting.');
  };

  const handleGuidanceDecline = () => {
    navigate('/');
    toast.info('You need to accept the guidelines to use Chatiwy.');
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    
    // Mark messages from this user as read
    setInboxMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.senderId === userId ? { ...msg, isRead: true } : msg
      )
    );
    
    // Close inbox if open
    setShowInbox(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('chatiwy_session_id');
    navigate('/');
    toast.success('You have been logged out successfully');
  };

  // Count unread messages
  const unreadCount = inboxMessages.filter(msg => !msg.isRead).length;

  // Create a Test VIP account for testing purposes
  const createTestVipAccount = () => {
    // Create a mock VIP profile
    const vipProfile = {
      username: "VIP_Tester",
      gender: "male",
      country: "US",
      isVIP: true,
      joinDate: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem('vip_test_profile', JSON.stringify(vipProfile));
    
    // Navigate to chat with this profile
    navigate('/chat', { state: { userProfile: vipProfile } });
    
    toast.success('Test VIP account created! You are now logged in as a VIP user.');
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
      
      <Navbar>
        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          size="sm"
          className="mr-2"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </Navbar>
      
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
              <div className="w-full lg:w-3/4 relative">
                <ChatInterface 
                  userProfile={userProfile} 
                  selectedUser={selectedUser}
                  onUserSelect={setSelectedUser}
                  socketConnected={socketConnected}
                />
                
                {/* Inbox Floating Button - Only visible in chat interface */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      className="absolute top-4 right-4 rounded-full"
                      size="icon"
                      variant={unreadCount > 0 ? "destructive" : "secondary"}
                      onClick={() => setShowInbox(true)}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-md w-[90vw] p-0">
                    <div className="h-full flex flex-col">
                      <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="h-5 w-5" />
                          <h2 className="text-lg font-semibold">Inbox</h2>
                        </div>
                        <SheetClose asChild>
                          <Button variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                          </Button>
                        </SheetClose>
                      </div>
                      
                      <ScrollArea className="flex-1">
                        <div className="px-1">
                          {inboxMessages.map((message) => (
                            <div 
                              key={message.id}
                              className={`p-3 hover:bg-secondary/50 rounded-md cursor-pointer flex items-start justify-between ${
                                !message.isRead ? 'bg-secondary/20' : ''
                              }`}
                              onClick={() => handleUserSelect(message.senderId)}
                            >
                              <div className="flex gap-3">
                                <Avatar>
                                  <AvatarImage src={message.avatar} alt={message.sender} />
                                  <AvatarFallback>
                                    <User className="h-5 w-5" />
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{message.sender}</span>
                                    {!message.isRead && (
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {message.content}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(message.timestamp).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            
            {/* Test VIP Account Button - Only visible in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                <h3 className="font-medium mb-2">Development Tools</h3>
                <Button 
                  onClick={createTestVipAccount} 
                  variant="outline" 
                  className="bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700"
                >
                  Create Test VIP Account
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatPage;
