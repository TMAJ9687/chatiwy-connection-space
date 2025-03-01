
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ReportForm } from '@/components/ReportForm';
import { 
  Send, 
  Image, 
  Mic, 
  Smile, 
  MoreHorizontal, 
  AlertTriangle,
  User,
  Flag,
  UserX,
  History,
  Inbox,
  Ban,
  AlertOctagon
} from 'lucide-react';
import { toast } from 'sonner';
import { botProfiles, getRandomBotResponse, getRandomConversationStarter } from '@/utils/botProfiles';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isBot: boolean;
  isRead?: boolean;
}

interface ChatInterfaceProps {
  userProfile: any;
  selectedUser: string | null;
  onUserSelect: (userId: string | null) => void;
}

// Store chat histories per user
const userChatHistories: Record<string, Message[]> = {};
// Store blocked users
const blockedUsers: Set<string> = new Set();

export function ChatInterface({ userProfile, selectedUser, onUserSelect }: ChatInterfaceProps) {
  const [currentChat, setCurrentChat] = useState<{
    userId: string;
    username: string;
    isBot: boolean;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [imageUploads, setImageUploads] = useState(0);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [view, setView] = useState<'chat' | 'history' | 'inbox'>('chat');
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Initialize selected user as current chat
  useEffect(() => {
    if (selectedUser) {
      const botUser = botProfiles.find(bot => bot.id === selectedUser);
      if (botUser) {
        setCurrentChat({
          userId: botUser.id,
          username: botUser.username,
          isBot: true
        });
      }
    } else {
      setCurrentChat(null);
    }
  }, [selectedUser]);

  // Load chat history for selected user
  useEffect(() => {
    if (currentChat?.userId) {
      // Initialize if not exists
      if (!userChatHistories[currentChat.userId]) {
        userChatHistories[currentChat.userId] = [];
      }
      
      // Set messages from history
      setMessages(userChatHistories[currentChat.userId]);
    }
  }, [currentChat]);

  // Bot sends initial message if chat is empty
  useEffect(() => {
    if (currentChat?.isBot && messages.length === 0 && !blockedUsers.has(currentChat.userId)) {
      // Add a small delay to make it feel more natural
      const timer = setTimeout(() => {
        const starter = getRandomConversationStarter();
        const newMessage = {
          id: Math.random().toString(36).substring(7),
          sender: currentChat.username,
          content: starter,
          timestamp: new Date(),
          isBot: true
        };
        
        setMessages([newMessage]);
        
        // Update history
        if (currentChat.userId) {
          userChatHistories[currentChat.userId] = [newMessage];
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentChat, messages.length]);

  // Bot responds to user messages
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === userProfile.username && currentChat?.isBot && !blockedUsers.has(currentChat.userId)) {
      // Bot is "typing"
      const typingDelay = Math.floor(Math.random() * 3000) + 1000; // Random delay between 1-4 seconds
      
      const timer = setTimeout(() => {
        const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
        let responseCategory: 'greeting' | 'interests' | 'weather' | 'generic' = 'generic';
        
        // Simple message analysis to determine response type
        if (lastUserMessage.includes('hi') || 
            lastUserMessage.includes('hello') || 
            lastUserMessage.includes('hey') ||
            lastUserMessage.includes('how are you')) {
          responseCategory = 'greeting';
        } else if (lastUserMessage.includes('weather') || 
                  lastUserMessage.includes('raining') || 
                  lastUserMessage.includes('sunny')) {
          responseCategory = 'weather';
        } else if (userProfile.interests.some((interest: string) => 
                  lastUserMessage.includes(interest.toLowerCase()))) {
          responseCategory = 'interests';
        }
        
        // Get bot response
        let botResponse = getRandomBotResponse(responseCategory);
        
        // Replace placeholders in the response
        if (responseCategory === 'interests') {
          const matchedInterest = userProfile.interests.find((interest: string) => 
            lastUserMessage.includes(interest.toLowerCase())
          ) || userProfile.interests[0];
          botResponse = botResponse.replace('[interest]', matchedInterest);
        } else if (responseCategory === 'weather') {
          const weatherTypes = ['sunny', 'rainy', 'cloudy', 'windy', 'stormy', 'beautiful'];
          const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
          const bot = botProfiles.find(b => b.username === currentChat?.username);
          botResponse = botResponse
            .replace('[country]', bot?.country || 'my country')
            .replace('[weather_type]', randomWeather);
        }
        
        const newMessage = {
          id: Math.random().toString(36).substring(7),
          sender: currentChat?.username || 'Bot',
          content: botResponse,
          timestamp: new Date(),
          isBot: true
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Update history
        if (currentChat?.userId) {
          userChatHistories[currentChat.userId] = [...messages, newMessage];
        }
      }, typingDelay);
      
      return () => clearTimeout(timer);
    }
  }, [messages, currentChat, userProfile]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const validateMessage = (message: string): boolean => {
    // Check for character limit (140 for standard users)
    if (message.length > 140) {
      toast.warning('Standard users are limited to 140 characters per message');
      return false;
    }
    
    // Check for consecutive numbers (max 4)
    const consecutiveNumbersMatch = message.match(/\d{5,}/);
    if (consecutiveNumbersMatch) {
      toast.warning('Message contains too many consecutive numbers (maximum 4)');
      return false;
    }
    
    // Check for duplicate messages
    if (message === lastMessage) {
      setDuplicateCount(prevCount => prevCount + 1);
      
      if (duplicateCount >= 2) { // Third attempt
        toast.error('Please avoid sending multiple duplicate messages');
        setDuplicateCount(0); // Reset after warning
        return false;
      } else {
        toast.warning(`Duplicate message detected (${duplicateCount + 1}/3)`);
      }
    } else {
      // Reset duplicate counter for new message
      setDuplicateCount(0);
      setLastMessage(message);
    }
    
    return true;
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    if (!validateMessage(messageInput)) return;
    
    // Add message to chat
    const newMessage = {
      id: Math.random().toString(36).substring(7),
      sender: userProfile.username,
      content: messageInput,
      timestamp: new Date(),
      isBot: false
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Update history
    if (currentChat?.userId) {
      userChatHistories[currentChat.userId] = updatedMessages;
    }
    
    // Clear input
    setMessageInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = () => {
    if (imageUploads >= 10) {
      toast.error('Standard users can only upload 10 images per day');
      return;
    }
    
    toast.info('Image upload feature will be available soon!');
    setImageUploads(prev => prev + 1);
  };

  const handleVoiceMessage = () => {
    toast.info('Voice messages are only available for VIP users');
  };

  const handleBlockUser = () => {
    if (currentChat) {
      blockedUsers.add(currentChat.userId);
      toast.success(`${currentChat.username} has been blocked`);
      onUserSelect(null);
      
      // In a real app, we would update a blocked users list here
    }
  };

  const renderViewContent = () => {
    switch (view) {
      case 'history':
        return (
          <div className="flex-1 p-6">
            <h3 className="text-lg font-medium mb-4">Chat History</h3>
            {Object.entries(userChatHistories).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(userChatHistories).map(([userId, chatHistory]) => {
                  if (chatHistory.length === 0) return null;
                  
                  const bot = botProfiles.find(b => b.id === userId);
                  if (!bot) return null;
                  
                  const lastMessage = chatHistory[chatHistory.length - 1];
                  const isBlocked = blockedUsers.has(userId);
                  
                  return (
                    <div 
                      key={userId}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        if (!isBlocked) {
                          onUserSelect(userId);
                          setView('chat');
                        } else {
                          toast.error(`${bot.username} is blocked. Unblock to continue chatting.`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          bot.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}>
                          {bot.username.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{bot.username}</span>
                            <span className="text-sm text-muted-foreground">{bot.age}</span>
                            <span className="ml-1 text-lg">{bot.flag}</span>
                            {isBlocked && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="ml-1">
                                      <Ban className="h-4 w-4 text-red-500" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>This user is blocked</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        <span className="font-medium mr-1">
                          {lastMessage.sender === userProfile.username ? 'You:' : `${bot.username}:`}
                        </span>
                        {lastMessage.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Your past conversations will appear here
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setView('chat')}
                >
                  Return to Chat
                </Button>
              </div>
            )}
          </div>
        );
      case 'inbox':
        return (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <Inbox className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Inbox</h3>
              <p className="text-muted-foreground mb-4">
                New messages from other users will appear here
              </p>
              <Button 
                variant="outline" 
                onClick={() => setView('chat')}
              >
                Return to Chat
              </Button>
            </div>
          </div>
        );
      case 'chat':
      default:
        return (
          <>
            {/* Message area */}
            <ScrollArea className="flex-1 p-4">
              {blockedUsers.has(currentChat?.userId || '') ? (
                <div className="flex items-center justify-center h-full flex-col gap-2">
                  <AlertOctagon className="h-16 w-16 text-red-500" />
                  <h3 className="text-lg font-medium">You've blocked this user</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You cannot send or receive messages from {currentChat?.username}.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (currentChat) {
                        blockedUsers.delete(currentChat.userId);
                        toast.success(`${currentChat.username} has been unblocked`);
                      }
                    }}
                  >
                    Unblock User
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.sender === userProfile.username ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] ${
                          message.sender === userProfile.username 
                            ? 'bg-teal-500 text-white rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-2xl' 
                            : 'bg-gray-100 dark:bg-gray-800 rounded-tr-2xl rounded-tl-sm rounded-bl-2xl rounded-br-2xl'
                        } px-4 py-2 shadow-sm`}
                      >
                        <p>{message.content}</p>
                        <div 
                          className={`text-xs mt-1 ${
                            message.sender === userProfile.username 
                              ? 'text-teal-100' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {message.sender === userProfile.username && (
                            <span className="ml-1">✓</span> // Simple "sent" indicator
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
            </ScrollArea>
            
            {/* Message input */}
            <div className="p-4 border-t">
              {!blockedUsers.has(currentChat?.userId || '') && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="resize-none min-h-[60px] max-h-[120px]"
                      maxLength={140} // Enforce character limit
                      disabled={blockedUsers.has(currentChat?.userId || '')}
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>{messageInput.length}/140 characters</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleImageUpload}
                      disabled={blockedUsers.has(currentChat?.userId || '')}
                    >
                      <Image className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleVoiceMessage}
                      className="opacity-50" // Disabled for standard users
                      disabled={blockedUsers.has(currentChat?.userId || '')}
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || blockedUsers.has(currentChat?.userId || '')}
                      className="bg-teal-500 hover:bg-teal-600"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="rounded-lg border shadow-sm h-[70vh] flex flex-col bg-background">
      {currentChat ? (
        <>
          {/* Chat header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                botProfiles.find(b => b.id === currentChat.userId)?.gender === 'Male' 
                  ? 'bg-blue-500' 
                  : 'bg-pink-500'
              }`}>
                {currentChat.username.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-medium">{currentChat.username}</h3>
                  {blockedUsers.has(currentChat.userId) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Ban className="h-4 w-4 text-red-500" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This user is blocked</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex items-center text-sm text-green-500">
                  {!blockedUsers.has(currentChat.userId) && (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                      Online
                    </>
                  )}
                  {blockedUsers.has(currentChat.userId) && (
                    <span className="text-red-500">Blocked</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setView('history')}
                      className={view === 'history' ? 'bg-accent' : ''}
                    >
                      <History className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Chat History</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setView('inbox')}
                      className={view === 'inbox' ? 'bg-accent' : ''}
                    >
                      <Inbox className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Inbox</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Profile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserX className="h-5 w-5 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Block User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to block {currentChat.username}? You won't be able to receive messages from them anymore.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBlockUser} className="bg-red-600 hover:bg-red-700">
                      Block User
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setIsReportFormOpen(true)}
                    >
                      <Flag className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Report User</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More Options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Content area - Chat, History or Inbox */}
          {renderViewContent()}
          
          {/* Report Form */}
          <ReportForm 
            isOpen={isReportFormOpen} 
            onClose={() => setIsReportFormOpen(false)} 
            userName={currentChat.username}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a user to start chatting
        </div>
      )}
    </div>
  );
}
