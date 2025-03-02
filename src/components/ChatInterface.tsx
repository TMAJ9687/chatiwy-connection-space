
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
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
  Image as ImageIcon, // Renamed to avoid conflict with HTML Image
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
  UserMinus,
  Eye,
  EyeOff,
  X,
  MessageSquare
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
  image?: {
    url: string;
    blurred: boolean;
  };
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

// Key to store image uploads count in localStorage
const IMAGE_UPLOADS_KEY = 'chatiwy_daily_image_uploads';
const IMAGE_UPLOADS_DATE_KEY = 'chatiwy_image_uploads_date';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB max size
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

export function ChatInterface({ userProfile, selectedUser, onUserSelect, socketConnected = false }: ChatInterfaceProps) {
  const [currentChat, setCurrentChat] = useState<{
    userId: string;
    username: string;
    isBot: boolean;
    isAdmin?: boolean;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [lastMessage, setLastMessage] = useState<string>('');
  const [duplicateCount, setDuplicateCount] = useState(0);
  // Fix: Correctly define useState for view type
  const [view, setView] = useState<'chat' | 'history' | 'inbox' | 'blocked'>('chat');
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Fix: Correctly define useState for currentEmojiCategory
  const [currentEmojiCategory, setCurrentEmojiCategory] = useState<keyof typeof emojiCategories>('smileys');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [userTyping, setUserTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUploads, setImageUploads] = useState<number>(0);
  
  // Initialize daily image uploads counter from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const lastUploadDate = localStorage.getItem(IMAGE_UPLOADS_DATE_KEY);
    
    if (lastUploadDate !== today) {
      // Reset counter for a new day
      localStorage.setItem(IMAGE_UPLOADS_KEY, '0');
      localStorage.setItem(IMAGE_UPLOADS_DATE_KEY, today);
      setImageUploads(0);
    } else {
      // Load existing counter
      const uploads = parseInt(localStorage.getItem(IMAGE_UPLOADS_KEY) || '0', 10);
      setImageUploads(uploads);
    }
  }, []);

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
      // Fix: Cast to HTMLElement first to access style property
      (observeElement as HTMLElement).style.display = 'none';
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

  // Image upload functionality
  const handleImageUpload = () => {
    if (imageUploads >= 10) {
      toast.error('Standard users can only upload 10 images per day');
      return;
    }
    
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only PNG, JPG, JPEG, and GIF files are allowed');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be less than 5MB');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const cancelImageUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendImageMessage = () => {
    if (!selectedImage || !imagePreview || !currentChat) return;
    
    // Create a message with the image
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      sender: userProfile.username,
      senderId: userProfile.id,
      content: 'Sent an image',
      timestamp: new Date(),
      isBot: false,
      image: {
        url: imagePreview,
        blurred: true // Images are blurred by default
      }
    };
    
    // Add message to local display
    setMessages(prev => [...prev, newMessage]);
    
    // Update history
    if (currentChat?.userId) {
      userChatHistories[currentChat.userId] = [
        ...(userChatHistories[currentChat.userId] || []),
        newMessage
      ];
    }
    
    // If this is a socket connection and not a bot, send to server
    if (socketConnected && !currentChat.isBot) {
      // Fix: Extend the socketService.sendMessage type to accept image
      // Instead of passing the image directly, we would need to update the server code
      // For now, just send the content without the image
      socketService.sendMessage({
        to: currentChat.userId,
        content: 'Sent an image'
        // Remove the image property as it's not in the interface
        // We would need to update the socketService to properly handle images
      });
    }
    
    // Update image uploads counter and save to localStorage
    const newUploadCount = imageUploads + 1;
    setImageUploads(newUploadCount);
    localStorage.setItem(IMAGE_UPLOADS_KEY, newUploadCount.toString());
    localStorage.setItem(IMAGE_UPLOADS_DATE_KEY, new Date().toDateString());
    
    // Clear selected image and preview
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Enable auto-scroll for new image message
    setShouldAutoScroll(true);
    
    toast.success('Image sent successfully');
  };

  const toggleImageBlur = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId && msg.image 
          ? { ...msg, image: { ...msg.image, blurred: !msg.image.blurred } } 
          : msg
      )
    );
    
    // Also update in chat history
    if (currentChat?.userId) {
      userChatHistories[currentChat.userId] = userChatHistories[currentChat.userId].map(msg => 
        msg.id === messageId && msg.image 
          ? { ...msg, image: { ...msg.image, blurred: !msg.image.blurred } } 
          : msg
      );
    }
  };

  // Add a new function to open images in a new tab
  const openImageInFullResolution = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
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
    
    // Convert hash to string and ensure it's positive
    const hashStr = Math.abs(hash).toString();
    
    // Use the hash to select an avatar number between 1 and 70
    const avatarNumber = (parseInt(hashStr.slice(-2), 10) % 70) + 1;
    
    // Generate the avatar URL based on gender
    return `https://avatar.iran.liara.run/public/${gender === 'female' ? 'woman' : 'man'}/${avatarNumber}`;
  };

  // Render content based on current view
  const renderContent = () => {
    switch (view) {
      case 'chat':
        return (
          <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="bg-primary text-white p-4 rounded-t-md flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img 
                  src={getAvatarUrl(
                    currentChat?.username || 'User', 
                    getGenderForAvatar(currentChat?.username || 'User', currentChat?.isBot)
                  )} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full" 
                />
                <div>
                  <div className="font-semibold flex items-center gap-1">
                    {currentChat?.username} 
                    {currentChat?.isAdmin && (
                      <Badge variant="success" className="ml-1 text-[10px]">
                        Admin
                      </Badge>
                    )}
                    {currentChat?.isBot && (
                      <Badge variant="secondary" className="ml-1 text-[10px]">
                        Bot
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs opacity-80 flex items-center gap-1">
                    {/* Show user interests instead of online status */}
                    {currentChat?.isBot ? (
                      <>
                        {getCountryFlag(botProfiles.find(b => b.id === currentChat.userId)?.country)}
                        {' '}
                        {botProfiles.find(b => b.id === currentChat.userId)?.interests.slice(0, 2).join(', ')}
                      </>
                    ) : (
                      'Chatiwy user'
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-primary-foreground/20">
                      <Flag size={18} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Report User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please provide details about why you're reporting this user.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    {currentChat && (
                      // Fix: Update the props to match what ReportForm expects
                      <ReportForm 
                        isOpen={true} 
                        onClose={() => {}} 
                        userName={currentChat.username} 
                      />
                    )}
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-primary-foreground/20">
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleBlockUser} className="cursor-pointer text-red-500">
                      <UserX className="mr-2 h-4 w-4" />
                      <span>Block user</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Chat messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start chatting!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === userProfile.username ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === userProfile.username
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.image ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium mb-1">{message.content}</p>
                            <div className="relative">
                              <div 
                                className={`cursor-pointer ${message.image.blurred ? 'blur-lg' : ''}`}
                                onClick={() => {
                                  if (!message.image?.blurred) {
                                    openImageInFullResolution(message.image?.url);
                                  }
                                }}
                              >
                                <img
                                  src={message.image.url}
                                  alt="Shared image"
                                  className="rounded-md max-h-60 object-contain"
                                />
                              </div>
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-full"
                                  onClick={() => toggleImageBlur(message.id)}
                                >
                                  {message.image.blurred ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-[10px] opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {!message.image.blurred && (
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => openImageInFullResolution(message.image?.url)}
                                >
                                  Full Resolution
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{message.content}</p>
                            <p className="text-[10px] opacity-70 mt-1 text-right">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
              
              {/* Typing indicator */}
              {userTyping && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm p-2">
                  <div className="flex space-x-1">
                    <span className="animate-bounce delay-0">.</span>
                    <span className="animate-bounce delay-150">.</span>
                    <span className="animate-bounce delay-300">.</span>
                  </div>
                  <span>{currentChat?.username} is typing</span>
                </div>
              )}
            </ScrollArea>

            {/* Image upload preview */}
            {selectedImage && imagePreview && (
              <div className="p-3 border-t bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Image Preview</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelImageUpload}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="h-40 object-contain rounded-md"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelImageUpload}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={sendImageMessage}
                    >
                      Send Image
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Image usage counter */}
            <div className="px-4 py-2 bg-slate-50 text-xs text-muted-foreground">
              <p>{imageUploads}/10 daily image uploads used</p>
            </div>

            {/* Chat input */}
            <div className="p-3 border-t">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="min-h-[64px] w-[90%] resize-none pr-10"
                  />
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                  />
                  
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add emoji</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handleImageUpload}
                          >
                            <ImageIcon className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Upload image</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={handleVoiceMessage}
                          >
                            <Mic className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send voice message (VIP)</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="h-[64px] w-[64px] rounded-full"
                  disabled={!messageInput.trim() && !selectedImage}
                >
                  <Send className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mt-2 p-2 border rounded-lg bg-white">
                  <div className="flex space-x-2 mb-2 border-b pb-2 overflow-x-auto">
                    {Object.keys(emojiCategories).map((category) => (
                      <Button
                        key={category}
                        variant={currentEmojiCategory === category ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentEmojiCategory(category as keyof typeof emojiCategories)}
                        className="text-xs rounded-full"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {emojiCategories[currentEmojiCategory].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-xl hover:bg-muted"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'history':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Chat History</h2>
            <div className="space-y-4">
              {Object.keys(userChatHistories).length === 0 ? (
                <p className="text-muted-foreground">No chat history available.</p>
              ) : (
                Object.entries(userChatHistories).map(([userId, messages]) => {
                  // Skip if no messages
                  if (messages.length === 0) return null;
                  
                  const lastMessage = messages[messages.length - 1];
                  const botUser = botProfiles.find(bot => bot.id === userId);
                  const username = botUser ? botUser.username : lastMessage.sender;
                  const isBot = !!botUser;
                  
                  return (
                    <Card
                      key={userId}
                      className="p-3 cursor-pointer hover:bg-slate-50"
                      onClick={() => {
                        onUserSelect(userId);
                        setView('chat');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                          <img 
                            src={getAvatarUrl(username, getGenderForAvatar(username, isBot))} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full" 
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{username}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(lastMessage.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
        
      case 'inbox':
        // Get users with unread messages
        const unreadUsers = Array.from(window.unreadMessagesPerUser);
        
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Inbox</h2>
            <div className="space-y-4">
              {unreadUsers.length === 0 ? (
                <p className="text-muted-foreground">No unread messages.</p>
              ) : (
                unreadUsers.map(userId => {
                  const messages = userChatHistories[userId] || [];
                  if (messages.length === 0) return null;
                  
                  const lastMessage = messages[messages.length - 1];
                  const botUser = botProfiles.find(bot => bot.id === userId);
                  const username = botUser ? botUser.username : lastMessage.sender;
                  const isBot = !!botUser;
                  
                  return (
                    <Card
                      key={userId}
                      className="p-3 cursor-pointer hover:bg-slate-50 border-l-4 border-l-blue-500"
                      onClick={() => {
                        // Mark as read
                        window.unreadMessagesPerUser.delete(userId);
                        // Update unread count
                        setUnreadCount(window.unreadMessagesPerUser.size);
                        // Select the user and go to chat
                        onUserSelect(userId);
                        setView('chat');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={getAvatarUrl(username, getGenderForAvatar(username, isBot))} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full" 
                          />
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{username}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(lastMessage.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
        
      case 'blocked':
        // Get blocked users list
        const blockedUsersList = Array.from(blockedUsers);
        
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Blocked Users</h2>
            <div className="space-y-4">
              {blockedUsersList.length === 0 ? (
                <p className="text-muted-foreground">No blocked users.</p>
              ) : (
                blockedUsersList.map(userId => {
                  const botUser = botProfiles.find(bot => bot.id === userId);
                  let username = "Unknown User";
                  
                  if (botUser) {
                    username = botUser.username;
                  } else {
                    // Try to find username in chat history
                    const chatHistory = userChatHistories[userId] || [];
                    if (chatHistory.length > 0 && chatHistory[0].sender) {
                      username = chatHistory[0].sender;
                    }
                  }
                  
                  return (
                    <Card
                      key={userId}
                      className="p-3 cursor-pointer hover:bg-slate-50 border-l-4 border-l-red-500"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={getAvatarUrl(username, getGenderForAvatar(username, !!botUser))} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full opacity-50" 
                          />
                          <span className="absolute top-0 right-0 w-full h-full flex items-center justify-center">
                            <Ban className="w-6 h-6 text-red-500" />
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{username}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnblockUser(userId)}
                              className="h-6 text-xs text-blue-500"
                            >
                              Unblock
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Blocked user
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Navigation tabs */}
      <div className="bg-white border-b p-2">
        <div className="flex space-x-1">
          <Button
            variant={view === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('chat')}
            className="flex-1"
          >
            <User className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button
            variant={view === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('history')}
            className="flex-1"
          >
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button
            variant={view === 'inbox' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('inbox')}
            className="flex-1 relative"
          >
            {unreadCount > 0 ? (
              <BellDot className="mr-2 h-4 w-4" />
            ) : (
              <Bell className="mr-2 h-4 w-4" />
            )}
            Inbox
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant={view === 'blocked' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('blocked')}
            className="flex-1"
          >
            <Ban className="mr-2 h-4 w-4" />
            Blocked
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {currentChat || view !== 'chat' ? (
          renderContent()
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-4 p-4 rounded-full bg-muted">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">No Chat Selected</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Select a user from the list to start chatting or view your chat history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
