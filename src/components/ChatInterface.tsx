
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ReportForm } from '@/components/ReportForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Bell,
  BellDot,
  Ban,
  AlertOctagon,
  Wifi,
  WifiOff,
  ShieldAlert,
  UserMinus
} from 'lucide-react';
import { toast } from 'sonner';
import { botProfiles, getRandomBotResponse } from '@/utils/botProfiles';
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
import socketService from '@/services/socketService';
import { countries } from '@/utils/countryData';

interface Message {
  id: string;
  sender: string;
  senderId?: string;
  content: string;
  timestamp: Date;
  isBot: boolean;
  isRead?: boolean;
}

interface ChatInterfaceProps {
  userProfile: any;
  selectedUser: string | null;
  onUserSelect: (userId: string | null) => void;
  socketConnected?: boolean;
}

// Store chat histories per user - make it global for the Navbar to access
const userChatHistories: Record<string, Message[]> = {};
// Store blocked users
const blockedUsers: Set<string> = new Set();
// Store unread messages per user - make it global for the Navbar to access
declare global {
  interface Window {
    unreadMessagesPerUser: Set<string>;
  }
}
window.unreadMessagesPerUser = new Set<string>();

// Common emoji categories
const emojiCategories = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
  gestures: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '👍', '👎'],
  people: ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉'],
  food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅'],
  activities: ['⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖']
};

export function ChatInterface({ userProfile, selectedUser, onUserSelect, socketConnected = false }: ChatInterfaceProps) {
  const [currentChat, setCurrentChat] = useState<{
    userId: string;
    username: string;
    isBot: boolean;
    isAdmin?: boolean;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [imageUploads, setImageUploads] = useState(0);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [view, setView] = useState<'chat' | 'history' | 'inbox' | 'blocked'>('chat');
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentEmojiCategory, setCurrentEmojiCategory] = useState<keyof typeof emojiCategories>('smileys');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [userTyping, setUserTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Initialize selected user as current chat
  useEffect(() => {
    if (selectedUser) {
      const botUser = botProfiles.find(bot => bot.id === selectedUser);
      if (botUser) {
        setCurrentChat({
          userId: botUser.id,
          username: botUser.username,
          isBot: true,
          isAdmin: botUser.isAdmin
        });
      } else if (socketConnected) {
        // Get user info from socket
        // We'll set a listener for users_update in the next effect hook
        // For now, at least create a basic chat with this user ID
        setCurrentChat({
          userId: selectedUser,
          username: "User",  // This will get updated when we receive user info
          isBot: false
        });
        
        // Request updated user list from the server
        socketService.on('users_update', (users) => {
          const user = users.find((u: any) => u.id === selectedUser);
          if (user) {
            setCurrentChat({
              userId: user.id,
              username: user.username,
              isBot: false
            });
          }
        });
      }

      // Mark messages as read for the selected user
      if (window.unreadMessagesPerUser.has(selectedUser)) {
        window.unreadMessagesPerUser.delete(selectedUser);
        // Update unread count
        setUnreadCount(window.unreadMessagesPerUser.size);
      }
    } else {
      setCurrentChat(null);
    }
  }, [selectedUser, socketConnected]);

  // Check for data-chat-view attribute changes from the Navbar
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-chat-view') {
          const element = mutation.target as HTMLElement;
          const viewValue = element.getAttribute('data-chat-view');
          
          if (viewValue === 'inbox') {
            setView('inbox');
          }
        }
      });
    });
    
    // Create a div to observe if it doesn't exist yet
    let observeElement = document.querySelector('[data-chat-view]');
    if (!observeElement) {
      observeElement = document.createElement('div');
      observeElement.setAttribute('data-chat-view', 'chat');
      observeElement.style.display = 'none';
      document.body.appendChild(observeElement);
    }
    
    observer.observe(observeElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Set up WebSocket listeners for messages
  useEffect(() => {
    if (socketConnected) {
      // Clear any previous listeners
      socketService.off('receive_message');
      socketService.off('user_typing');
      socketService.off('blocked_by');
      
      // Listen for incoming messages
      socketService.on('receive_message', (messageData: any) => {
        console.log('Received message:', messageData);
        
        // Determine if this message is from/to the current chat
        const isFromCurrentChat = messageData.senderId === currentChat?.userId;
        const isSentByMe = messageData.senderId === userProfile.id || 
                          messageData.senderId === socketService.getSocketId();
        const isForCurrentChat = messageData.recipientId === currentChat?.userId;
        
        // Check if user is blocked - don't process messages from blocked users
        if (messageData.senderId && blockedUsers.has(messageData.senderId)) {
          console.log('Message from blocked user, ignoring');
          return;
        }
        
        console.log('Message from current chat?', isFromCurrentChat);
        console.log('Message sent by me?', isSentByMe);
        console.log('Current chat:', currentChat);
        
        if (isFromCurrentChat || (isSentByMe && isForCurrentChat)) {
          // This message is for the current chat
          const newMessage: Message = {
            id: messageData.id || Math.random().toString(36).substring(7),
            sender: messageData.sender,
            senderId: messageData.senderId,
            content: messageData.content,
            timestamp: new Date(messageData.timestamp || Date.now()),
            isBot: false
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          // Also add to chat history if not from blocked user
          if (currentChat?.userId && !blockedUsers.has(currentChat.userId)) {
            userChatHistories[currentChat.userId] = [
              ...(userChatHistories[currentChat.userId] || []),
              newMessage
            ];
          }
          
          // Auto-scroll when receiving new messages in current chat
          setShouldAutoScroll(true);
        } else {
          // Message is from another user - we need to track as unread
          // Only if the sender is not blocked
          if (messageData.senderId && !blockedUsers.has(messageData.senderId)) {
            // Store in chat history for that user
            if (!userChatHistories[messageData.senderId]) {
              userChatHistories[messageData.senderId] = [];
            }
            
            userChatHistories[messageData.senderId].push({
              id: messageData.id || Math.random().toString(36).substring(7),
              sender: messageData.sender,
              senderId: messageData.senderId,
              content: messageData.content,
              timestamp: new Date(messageData.timestamp || Date.now()),
              isBot: false,
              isRead: false
            });
            
            // Add to unread messages if not from current user
            if (!isSentByMe) {
              window.unreadMessagesPerUser.add(messageData.senderId);
              setUnreadCount(window.unreadMessagesPerUser.size);
              
              // Show notification
              toast.info(`New message from ${messageData.sender}`);
            }
          }
        }
      });
      
      // Listen for typing status
      socketService.on('user_typing', (data: any) => {
        if (data.userId === currentChat?.userId && !blockedUsers.has(data.userId)) {
          setUserTyping(data.isTyping);
        }
      });
      
      // Listen for being blocked
      socketService.on('blocked_by', (userId: string) => {
        // Don't show toast here, only show when trying to message someone
        // toast.error(`You have been blocked by a user`);
        
        // Maybe update UI to reflect this
      });
    }
    
    return () => {
      if (socketConnected) {
        socketService.off('receive_message');
        socketService.off('user_typing');
        socketService.off('blocked_by');
      }
    };
  }, [socketConnected, currentChat, userProfile.id]);

  // Load chat history for selected user
  useEffect(() => {
    if (currentChat?.userId) {
      // Initialize if not exists
      if (!userChatHistories[currentChat.userId]) {
        userChatHistories[currentChat.userId] = [];
      }
      
      // Set messages from history (but only if user is not blocked)
      if (!blockedUsers.has(currentChat.userId)) {
        setMessages(userChatHistories[currentChat.userId]);
      } else {
        // If user is blocked, don't show any messages
        setMessages([]);
      }
      
      // Reset view when switching users
      setView('chat');
      
      // Enable auto-scroll for new conversation
      setShouldAutoScroll(true);
    }
  }, [currentChat]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(window.unreadMessagesPerUser.size);
  }, [window.unreadMessagesPerUser.size]);

  // Bot responds to user messages
  useEffect(() => {
    if (messages.length > 0 && 
        messages[messages.length - 1].sender === userProfile.username && 
        currentChat?.isBot && 
        !blockedUsers.has(currentChat.userId)) {
      // Bot is "typing" - Random delay between 3-8 seconds to seem more human-like
      const typingDelay = Math.floor(Math.random() * 5000) + 3000;
      
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

  // Handle auto-scrolling
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      // Slight delay to ensure content is rendered
      const timer = setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages, shouldAutoScroll]);

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
    
    // Check if user is trying to message someone who blocked them
    if (blockedUsers.has(currentChat?.userId || '')) {
      toast.warning(`You can't send messages to ${currentChat?.username} because they are blocked`, {
        id: 'blocked-user-warning',
        duration: 4000,
      });
      setMessageInput('');
      return;
    }
    
    if (!validateMessage(messageInput)) return;
    
    if (socketConnected && !currentChat?.isBot) {
      // Create a message object
      const newMessage = {
        id: Math.random().toString(36).substring(7),
        sender: userProfile.username,
        senderId: userProfile.id,
        content: messageInput,
        timestamp: new Date(),
        isBot: false
      };
      
      // Add message to local display immediately for better UX
      setMessages(prev => [...prev, newMessage]);
      
      // Update history
      if (currentChat?.userId) {
        userChatHistories[currentChat.userId] = [
          ...(userChatHistories[currentChat.userId] || []),
          newMessage
        ];
      }
      
      // Send message via WebSocket
      socketService.sendMessage({
        to: currentChat?.userId,
        content: messageInput
      });
      
      // Clear input
      setMessageInput('');
      
      // Enable auto-scroll when sending a new message
      setShouldAutoScroll(true);
      
      // Send stopped typing event
      if (currentChat?.userId) {
        socketService.sendTyping({
          to: currentChat.userId,
          isTyping: false
        });
      }
    } else {
      // Add message to chat (local/bot communication)
      const newMessage = {
        id: Math.random().toString(36).substring(7),
        sender: userProfile.username,
        senderId: userProfile.id,
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
      
      // Enable auto-scroll when sending a new message
      setShouldAutoScroll(true);
    }
    
    // Close emoji picker after sending
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    // Send typing status to WebSocket if connected and not chatting with a bot
    if (socketConnected && currentChat && !currentChat.isBot && !blockedUsers.has(currentChat.userId)) {
      socketService.sendTyping({
        to: currentChat.userId,
        isTyping: e.target.value.length > 0
      });
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

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    
    // Don't close emoji picker after adding an emoji
    // Focus on the input
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  const handleBlockUser = () => {
    if (currentChat) {
      // Check if user is an admin
      if (currentChat.isAdmin) {
        toast.error("You cannot block an admin");
        return;
      }
      
      blockedUsers.add(currentChat.userId);
      
      // If connected to WebSocket, notify server about blocking
      if (socketConnected && !currentChat.isBot) {
        socketService.blockUser(currentChat.userId);
      }
      
      // Clear messages since the user is blocked
      setMessages([]);
      
      toast.success(`${currentChat.username} has been blocked`);
      
      // Stay on the current user but update the view
      setView('chat');
    }
  };
  
  const handleUnblockUser = (userId: string) => {
    // Get username for toast message
    let username = "User";
    const botUser = botProfiles.find(bot => bot.id === userId);
    if (botUser) {
      username = botUser.username;
    } else {
      // Try to find in chat history
      const chatHistory = userChatHistories[userId] || [];
      if (chatHistory.length > 0 && chatHistory[0].sender) {
        username = chatHistory[0].sender;
      }
    }
    
    blockedUsers.delete(userId);
    toast.success(`${username} has been unblocked`);
    
    // If this is the current chat, reload messages
    if (currentChat && currentChat.userId === userId) {
      if (userChatHistories[userId]) {
        setMessages(userChatHistories[userId]);
      }
    }
  };

  // Get gender for the avatar
  const getGenderForAvatar = (username: string, isBot = false): 'male' | 'female' => {
    if (isBot) {
      const bot = botProfiles.find(b => b.username === username);
      return bot?.gender === 'Male' ? 'male' : 'female';
    }
    
    // For regular users
    return 'male'; // Default if we don't know
  };

  // Get country flag
  const getCountryFlag = (country?: string): string => {
    if (!country || country === 'Unknown') return '🌍';
    
    const foundCountry = countries.find(c => c.name === country);
    return foundCountry?.flag || '🌍';
  };

  // Get modern avatar URL based on gender
  const getAvatarUrl = (name: string, gender: 'male' | 'female'): string => {
    // Generate a consistent hash for the name to get the same avatar each time
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Select avatar style based on gender and hash
    const style = gender === 'male' ? 'male' : 'female';
    const number = Math.abs(hash % 10) + 1; // Numbers 1-10
    
    return `https://api.dicebear.com/7.x/personas/svg?seed=${style}${number}`;
  };

  // Render functions moved out for clarity
  const renderViewContent = () => {
    switch (view) {
      case 'blocked':
        return (
          <div className="flex-1 p-6">
            <h3 className="text-lg font-medium mb-4">Blocked Users</h3>
            {blockedUsers.size > 0 ? (
              <div className="space-y-4">
                {Array.from(blockedUsers).map(userId => {
                  const bot = botProfiles.find(b => b.id === userId);
                  let username = "Unknown User";
                  let gender: 'male' | 'female' = 'male'; // Default for UI styling
                  
                  // Determine user details
                  if (bot) {
                    username = bot.username;
                    gender = bot.gender === 'Male' ? 'male' : 'female';
                  } else {
                    // Try to find in chat history
                    const chatHistory = userChatHistories[userId] || [];
                    if (chatHistory.length > 0 && chatHistory[0].sender) {
                      username = chatHistory[0].sender;
                      gender = getGenderForAvatar(username);
                    }
                  }
                  
                  return (
                    <div 
                      key={userId}
                      className="p-4 border rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img 
                            src={getAvatarUrl(username, gender)} 
                            alt={username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{username}</span>
                            <Ban className="h-4 w-4 text-red-500" />
                          </div>
                          <p className="text-sm text-muted-foreground">Blocked user</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => handleUnblockUser(userId)}
                        size="sm"
                      >
                        Unblock
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't blocked any users yet
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
      case 'history':
        return (
          <div className="flex-1 p-6">
            <h3 className="text-lg font-medium mb-4">Chat History</h3>
            {Object.entries(userChatHistories).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(userChatHistories).map(([userId, chatHistory]) => {
                  // Skip blocked users and empty histories
                  if (blockedUsers.has(userId) || chatHistory.length === 0) return null;
                  
                  const bot = botProfiles.find(b => b.id === userId);
                  if (!bot && !chatHistory[0].sender) return null;
                  
                  const lastMessage = chatHistory[chatHistory.length - 1];
                  const chatName = bot ? bot.username : chatHistory[0].sender;
                  const hasUnread = window.unreadMessagesPerUser.has(userId);
                  const gender: 'male' | 'female' = bot?.gender === 'Male' ? 'male' : 'female';
                  
                  return (
                    <div 
                      key={userId}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${hasUnread ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' : ''}`}
                      onClick={() => {
                        onUserSelect(userId);
                        setView('chat');
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full overflow-hidden ${hasUnread ? 'ring-2 ring-teal-400' : ''}`}>
                          <img 
                            src={getAvatarUrl(chatName, gender)} 
                            alt={chatName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${hasUnread ? 'font-bold' : ''}`}>{chatName}</span>
                            <span className="text-sm text-muted-foreground">{bot?.age}</span>
                            <span className="ml-1 text-lg">{getCountryFlag(bot?.country)}</span>
                            {hasUnread && (
                              <Badge variant="success" className="ml-1">New</Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-sm ${hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground'} truncate`}>
                        <span className="font-medium mr-1">
                          {lastMessage.sender === userProfile.username ? 'You:' : `${chatName}:`}
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
          <div className="flex-1 p-6">
            <h3 className="text-lg font-medium mb-4">Inbox Messages</h3>
            {window.unreadMessagesPerUser.size > 0 ? (
              <div className="space-y-4">
                {Array.from(window.unreadMessagesPerUser).map(userId => {
                  // Skip blocked users
                  if (blockedUsers.has(userId)) return null;
                  
                  const chatHistory = userChatHistories[userId] || [];
                  if (chatHistory.length === 0) return null;
                  
                  const bot = botProfiles.find(b => b.id === userId);
                  if (!bot && !chatHistory[0].sender) return null;
                  
                  const lastMessage = chatHistory[chatHistory.length - 1];
                  const chatName = bot ? bot.username : chatHistory[0].sender;
                  const gender: 'male' | 'female' = bot?.gender === 'Male' ? 'male' : 'female';
                  
                  return (
                    <div 
                      key={userId}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800"
                      onClick={() => {
                        onUserSelect(userId);
                        setView('chat');
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-teal-400">
                          <img 
                            src={getAvatarUrl(chatName, gender)} 
                            alt={chatName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{chatName}</span>
                            <span className="text-sm text-muted-foreground">{bot?.age}</span>
                            <span className="ml-1 text-lg">{getCountryFlag(bot?.country)}</span>
                            <Badge variant="success" className="ml-1">New</Badge>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        <span className="font-medium mr-1">
                          {lastMessage.sender === userProfile.username ? 'You:' : `${chatName}:`}
                        </span>
                        {lastMessage.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Inbox className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Your inbox is empty
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
      case 'chat':
      default:
        return (
          <>
            {/* Message area */}
            <ScrollArea className="flex-1 px-4 py-2" ref={scrollAreaRef}>
              {blockedUsers.has(currentChat?.userId || '') ? (
                <div className="flex items-center justify-center h-full flex-col gap-2">
                  <AlertOctagon className="h-16 w-16 text-red-500" />
                  <h3 className="text-lg font-medium">You've blocked this user</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You cannot send or receive messages from {currentChat?.username}.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleUnblockUser(currentChat?.userId || '')}
                  >
                    Unblock User
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-2">
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
                  
                  {userTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="resize-none min-h-[60px] max-h-[120px]"
                      maxLength={140} // Enforce character limit
                      disabled={blockedUsers.has(currentChat?.userId || '')}
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>{messageInput.length}/140 characters</span>
                      {socketConnected && !currentChat?.isBot && (
                        <span className="flex items-center gap-1">
                          {socketService.isConnected() ? (
                            <>
                              <Wifi className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">Connected</span>
                            </>
                          ) : (
                            <>
                              <WifiOff className="h-3 w-3 text-red-500" />
                              <span className="text-red-500">Disconnected</span>
                            </>
                          )}
                        </span>
                      )}
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
                    
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          disabled={blockedUsers.has(currentChat?.userId || '')}
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" align="end">
                        <div className="p-2 border-b">
                          <div className="flex flex-wrap gap-1">
                            {Object.keys(emojiCategories).map((category) => (
                              <Button
                                key={category}
                                variant={currentEmojiCategory === category ? "default" : "ghost"}
                                size="sm"
                                className="px-2 py-1 h-8"
                                onClick={() => setCurrentEmojiCategory(category as keyof typeof emojiCategories)}
                              >
                                {category === 'smileys' ? '😀' : 
                                 category === 'gestures' ? '👋' :
                                 category === 'people' ? '👨‍👩‍👧‍👦' :
                                 category === 'animals' ? '🐶' :
                                 category === 'food' ? '🍔' :
                                 category === 'activities' ? '⚽' :
                                 category === 'travel' ? '✈️' : '❤️'}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="p-2 max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-8 gap-1">
                            {emojiCategories[currentEmojiCategory].map((emoji, i) => (
                              <button
                                key={i}
                                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded text-lg"
                                onClick={() => handleEmojiClick(emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
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
    <>
      <div className="rounded-lg border shadow-sm h-[70vh] flex flex-col bg-background">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img 
                    src={getAvatarUrl(
                      currentChat.username, 
                      botProfiles.find(b => b.id === currentChat.userId)?.gender === 'Male' ? 'male' : 'female'
                    )} 
                    alt={currentChat.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium">{currentChat.username}</h3>
                    {currentChat.isAdmin && (
                      <Badge variant="outline" className="ml-1 text-xs">Admin</Badge>
                    )}
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
                        {unreadCount > 0 ? (
                          <div className="relative">
                            <Inbox className="h-5 w-5" />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {unreadCount}
                            </span>
                          </div>
                        ) : (
                          <Inbox className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Inbox</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setView('blocked')}
                        className={view === 'blocked' ? 'bg-accent' : ''}
                      >
                        <UserMinus className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Blocked Users</TooltipContent>
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
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          disabled={currentChat.isAdmin || blockedUsers.has(currentChat.userId)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <UserX className="h-4 w-4 mr-2 text-red-500" />
                          <span>Block User</span>
                        </DropdownMenuItem>
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
                    
                    <DropdownMenuItem 
                      onClick={() => setView('blocked')}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      <span>Blocked Users</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => setIsReportFormOpen(true)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      <span>Report User</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem>
                      <span>Clear Chat</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Content area - Chat, History, Inbox or Blocked */}
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
    </>
  );
}
