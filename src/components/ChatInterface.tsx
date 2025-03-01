<lov-code>
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
  UserMinus,
  Eye,
  EyeOff,
  X
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
  const [view, setView] = useState<'chat' | 'history' | 'inbox' | 'blocked'>('chat');
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
      socketService.sendMessage({
        to: currentChat.userId,
        content: 'Sent an image',
        image: imagePreview
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
