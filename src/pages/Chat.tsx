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
import { MessageSquare, X, Inbox, User, ArrowLeft, LogOut, UserX } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockConnectedUsers = new Map();
const sessionKey = 'chatiwy_session_id';

const RENDER_URL = 'https://chatiwy-server.onrender.com';
const DIGITAL_OCEAN_URL = '';
const GUIDANCE_ACCEPTED_KEY = 'chatiwy_guidance_accepted';

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

const mockInboxMessages: InboxMessage[] = [];

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showGuidance, setShowGuidance] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(mockInboxMessages);
  const [showInbox, setShowInbox] = useState(false);
  const [isVipUser, setIsVipUser] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    localStorage.removeItem(GUIDANCE_ACCEPTED_KEY);
    setShowGuidance(true);
  }, []);
  
  useEffect(() => {
    let isConnected = false;
    
    const connectToSocket = async () => {
      try {
        if (DIGITAL_OCEAN_URL) {
          socketService.setCustomServerUrl(DIGITAL_OCEAN_URL);
        }
        
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
    
    const storedUserProfile = localStorage.getItem('userProfile');
    
    if (location.state?.userProfile) {
      const profile = location.state.userProfile;
      
      if (profile.username.toLowerCase().includes('admin')) {
        navigate('/');
        toast.error('The username "admin" is reserved and cannot be used');
        return;
      }
      
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
          
          localStorage.setItem('userProfile', JSON.stringify({
            ...profile,
            id: registeredUser.id,
            sessionId
          }));
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
        
        localStorage.setItem('userProfile', JSON.stringify(profile));
        
        mockConnectedUsers.forEach((user, key) => {
          if (user.sessionId === sessionId) {
            mockConnectedUsers.delete(key);
          }
        });
        
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
    } else if (storedUserProfile) {
      try {
        const profile = JSON.parse(storedUserProfile);
        
        if (profile && profile.username) {
          setIsVipUser(!!profile.isVIP);
          
          profile.id = profile.id || sessionId;
          profile.sessionId = sessionId;
          profile.isOnline = true;
          
          setUserProfile(profile);
          
          if (socketConnected) {
            socketService.registerUser({
              ...profile,
              sessionId
            }).then(registeredUser => {
              const updatedProfile = {
                ...profile,
                id: registeredUser.id,
                sessionId
              };
              
              setUserProfile(updatedProfile);
              
              localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            }).catch(error => {
              console.error('Registration error:', error);
              toast.error('Connection error. Using offline mode.');
            });
          } else {
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
          }
          
          return;
        }
      } catch (error) {
        console.error('Error parsing stored user profile:', error);
      }
    }
    
    if (!location.state?.userProfile && !storedUserProfile) {
      navigate('/');
      toast.error('Please complete your profile first');
    }
    
    return () => {
      if (userProfile && userProfile.id && !socketConnected) {
        const user = mockConnectedUsers.get(userProfile.id);
        if (user) {
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
    localStorage.setItem(GUIDANCE_ACCEPTED_KEY, 'true');
    toast.success('Welcome to Chatiwy! You can now start chatting.');
  };

  const handleGuidanceDecline = () => {
    navigate('/');
    toast.info('You need to accept the guidelines to use Chatiwy.');
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    
    setInboxMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.senderId === userId ? { ...msg, isRead: true } : msg
      )
    );
    
    setShowInbox(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('chatiwy_session_id');
    navigate('/');
    toast.success('You have been logged out successfully');
  };

  const unreadCount = inboxMessages.filter(msg => !msg.isRead).length;

  const createTestVipAccount = () => {
    const vipProfile = {
      username: "VIP_Tester",
      gender: "male",
      country: "US",
      isVIP: true,
      joinDate: new Date().toISOString()
    };
    
    localStorage.setItem('vip_test_profile', JSON.stringify(vipProfile));
    
    navigate('/chat', { state: { userProfile: vipProfile } });
    
    toast.success('Test VIP account created! You are now logged in as a VIP user.');
    
    toast.info('VIP Credentials - Username: VIP_Tester | Gender: male | Country: US', {
      duration: 10000
    });
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
        {/* Remove the duplicate LogOut button that was here */}
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
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      className="absolute top-4 right-16 rounded-full"
                      size="icon"
                      variant={unreadCount > 0 ? "destructive" : "secondary"}
                      onClick={() => setShowInbox(true)}
                    >
                      <Inbox className="h-5 w-5" />
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
                          <Inbox className="h-5 w-5" />
                          <h2 className="text-lg font-semibold">Inbox</h2>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setShowInbox(false)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <ScrollArea className="flex-1">
                        {inboxMessages.length > 0 ? (
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
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
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
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
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
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <User className="mr-2 h-4 w-4" />
                                      <span>View Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setInboxMessages(prevMessages => 
                                        prevMessages.map(msg => 
                                          msg.id === message.id ? { ...msg, isRead: !msg.isRead } : msg
                                        )
                                      );
                                    }}>
                                      {message.isRead ? (
                                        <>
                                          <MessageSquare className="mr-2 h-4 w-4" />
                                          <span>Mark as Unread</span>
                                        </>
                                      ) : (
                                        <>
                                          <MessageSquare className="mr-2 h-4 w-4" />
                                          <span>Mark as Read</span>
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <LogOut className="mr-2 h-4 w-4" />
                                      <span>Mute Notifications</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => {
                                      setInboxMessages(prevMessages => 
                                        prevMessages.filter(msg => msg.id !== message.id)
                                      );
                                    }}>
                                      <X className="mr-2 h-4 w-4 text-destructive" />
                                      <span className="text-destructive">Delete</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                            <Inbox className="h-10 w-10 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Your inbox is empty</p>
                            <p className="text-sm max-w-xs">Messages will appear here when you receive them from other users.</p>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            
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
                <div className="mt-2 text-sm text-amber-800 dark:text-amber-300">
                  <strong>VIP Account Credentials:</strong><br/>
                  Username: VIP_Tester<br/>
                  Gender: male<br/>
                  Country: US
                </div>
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
