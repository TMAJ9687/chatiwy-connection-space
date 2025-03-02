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
  Image as ImageIcon,
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
  MessageSquare,
  LogOut,
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
import { useNavigate } from 'react-router-dom';

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

interface ConnectedUser {
  id: string;
  username: string;
  isBot?: boolean;
  isAdmin?: boolean;
  interests?: string[];
  gender?: string;
  country?: string;
  age?: number;
  isOnline?: boolean;
}

const userChatHistories: Record<string, Message[]> = {};
const blockedUsers: Set<string> = new Set();
const mockConnectedUsers = new Map<string, ConnectedUser>();

declare global {
  interface Window {
    unreadMessagesPerUser: Set<string>;
  }
}
window.unreadMessagesPerUser = new Set<string>();

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

const IMAGE_UPLOADS_KEY = 'chatiwy_daily_image_uploads';
const IMAGE_UPLOADS_DATE_KEY = 'chatiwy_image_uploads_date';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

const getAvatarUrl = (username: string, gender: string = 'male') => {
  const nameHash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarId = nameHash % 70;
  return `https://uifaces.co/api/portraits/${gender}/${avatarId}`;
};

const getGenderForAvatar = (username: string, isBot: boolean = false): string => {
  if (isBot) {
    return 'lego';
  }
  const nameHash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return nameHash % 2 === 0 ? 'men' : 'women';
};

const getCountryFlag = (countryCode: string | undefined) => {
  if (!countryCode) return null;
  const country = countries.find(c => c.code === countryCode);
  if (!country) return null;
  return country.flag || country.code;
};

const MAX_MESSAGE_LENGTH = 140;

const allEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
  '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '👍', '👎',
  '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉',
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅',
  '⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏',
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖',
  '😎', '🤓', '🧐', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭',
  '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🫣', '🤗', '🫡', '🤔', '🫢',
  '👨‍👩‍👧‍👦', '👨‍👩‍👧', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧',
  '🌍', '🌎', '🌏', '🌱', '🌲', '🌳', '🌴', '🌵', '🌷', '🌸', '🌹', '🌺', '🌻', '🌼', '🌽', '🌾', '🌿', '☘️', '🍀',
  '🎄', '🎉', '🎊', '🎈', '🎁', '🎂', '🎀', '🪄', '🧨', '✨', '🎐', '🎏', '🎎', '🎌', '🧧', '📮', '📫', '📯'
];

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
  const [view, setView<'chat' | 'history' | 'inbox' | 'blocked'>>('chat');
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
  const navigate = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);
  const [fullResImage, setFullResImage] = useState<string | null>(null);
  const [isVipUser, setIsVipUser] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      if (!socketConnected && mockConnectedUsers.size === 0) {
        botProfiles.forEach(bot => {
          mockConnectedUsers.set(bot.id, {
            id: bot.id,
            username: bot.username,
            isBot: true,
            interests: bot.interests,
            gender: bot.gender,
            country: bot.country,
            age: bot.age,
            isOnline: true
          });
        });
      }

      const user = socketConnected
        ? { 
            id: selectedUser, 
            username: botProfiles.find(b => b.id === selectedUser)?.username || 'User',
            isBot: botProfiles.some(b => b.id === selectedUser)
          }
        : mockConnectedUsers.get(selectedUser);

      if (user) {
        setCurrentChat({
          userId: user.id,
          username: user.username,
          isBot: !!user.isBot,
          isAdmin: !!user.isAdmin
        });
      }
    } else {
      setCurrentChat(null);
    }
  }, [selectedUser, socketConnected]);

  useEffect(() => {
    if (currentChat) {
      const userId = currentChat.userId;
      if (userChatHistories[userId]) {
        setMessages(userChatHistories[userId]);
      } else {
        setMessages([]);
      }

      if (window.unreadMessagesPerUser.has(userId)) {
        window.unreadMessagesPerUser.delete(userId);
        setUnreadCount(0);
        onUserSelect(null);
      }
    }
  }, [currentChat, onUserSelect]);

  useEffect(() => {
    if (socketConnected) {
      socketService.on('message', handleReceiveMessage);
      socketService.on('userTyping', handleUserTyping);
      socketService.on('userStoppedTyping', handleUserStoppedTyping);

      return () => {
        socketService.off('message', handleReceiveMessage);
        socketService.off('userTyping', handleUserTyping);
        socketService.off('userStoppedTyping', handleUserStoppedTyping);
      };
    } else {
      const timeoutId = setTimeout(() => {
        if (currentChat && currentChat.isBot) {
          const botResponse = getRandomBotResponse("generic");
          if (botResponse) {
            handleReceiveMessage({
              sender: currentChat.username,
              content: botResponse,
              timestamp: new Date(),
              isBot: true
            });
          }
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentChat, socketConnected]);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const uploads = localStorage.getItem(IMAGE_UPLOADS_KEY);
    const date = localStorage.getItem(IMAGE_UPLOADS_DATE_KEY);
    const today = new Date().toLocaleDateString();

    if (date === today && uploads) {
      setImageUploads(parseInt(uploads, 10));
    } else {
      setImageUploads(0);
      localStorage.setItem(IMAGE_UPLOADS_DATE_KEY, today);
      localStorage.setItem(IMAGE_UPLOADS_KEY, '0');
    }
  }, []);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReceiveMessage = (messageData: any) => {
    setMessages(prevMessages => {
      const newMessage = {
        id: Math.random().toString(36).substring(2, 15),
        sender: messageData.sender,
        senderId: messageData.senderId,
        content: messageData.content,
        timestamp: new Date(messageData.timestamp),
        isBot: messageData.isBot || false,
        image: messageData.image
      };

      userChatHistories[currentChat?.userId || ''] = [...(userChatHistories[currentChat?.userId || ''] || []), newMessage];
      return [...prevMessages, newMessage];
    });
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      if (messageInput === lastMessage) {
        setDuplicateCount(duplicateCount + 1);
        if (duplicateCount >= 2) {
          toast.warning('Please avoid sending the same message repeatedly.');
          return;
        }
      } else {
        setDuplicateCount(0);
      }

      const messageData = {
        sender: userProfile.username,
        senderId: userProfile.id,
        content: messageInput,
        timestamp: new Date(),
        isBot: false
      };

      setMessages(prevMessages => {
        const newMessage = {
          id: Math.random().toString(36).substring(2, 15),
          sender: userProfile.username,
          senderId: userProfile.id,
          content: messageInput,
          timestamp: new Date(),
          isBot: false
        };

        userChatHistories[currentChat?.userId || ''] = [...(userChatHistories[currentChat?.userId || ''] || []), newMessage];
        return [...prevMessages, newMessage];
      });

      if (socketConnected) {
        socketService.sendMessage({ 
          to: currentChat?.userId, 
          content: messageInput
        });
      } else {
        handleReceiveMessage({
          sender: userProfile.username,
          content: messageInput,
          timestamp: new Date(),
          isBot: false
        });
      }

      setLastMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessageInput(value);
      if (value.trim() !== '') {
        if (!userTyping) {
          setUserTyping(true);
          if (socketConnected && currentChat) {
            socketService.sendTyping({ to: currentChat.userId, isTyping: true });
          }
        }
      } else {
        if (userTyping) {
          setUserTyping(false);
          if (socketConnected && currentChat) {
            socketService.sendTyping({ to: currentChat.userId, isTyping: false });
          }
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserTyping = (userId: string) => {
    if (currentChat?.userId === userId) {
      setUserTyping(true);
    }
  };

  const handleUserStoppedTyping = (userId: string) => {
    if (currentChat?.userId === userId) {
      setUserTyping(false);
    }
  };

  const handleBlockUser = () => {
    if (currentChat) {
      blockedUsers.add(currentChat.userId);
      toast.success(`You have blocked ${currentChat.username}.`);
      setMessages([]);
      setCurrentChat(null);
      onUserSelect(null);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prevInput => prevInput + emoji);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid image format. Only JPEG, PNG, and GIF are allowed.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size exceeds the maximum limit of 5MB.');
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
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

  const sendImageMessage = async () => {
    if (!selectedImage || !imagePreview) {
      return;
    }

    try {
      const imageUrl = imagePreview;

      const messageData = {
        sender: userProfile.username,
        senderId: userProfile.id,
        content: '',
        timestamp: new Date(),
        isBot: false,
        image: {
          url: imageUrl,
          blurred: true
        }
      };

      setMessages(prevMessages => {
        const newMessage = {
          id: Math.random().toString(36).substring(2, 15),
          sender: userProfile.username,
          senderId: userProfile.id,
          content: '',
          timestamp: new Date(),
          isBot: false,
          image: {
            url: imageUrl,
            blurred: true
          }
        };

        userChatHistories[currentChat?.userId || ''] = [...(userChatHistories[currentChat?.userId || ''] || []), newMessage];
        return [...prevMessages, newMessage];
      });

      if (socketConnected) {
        socketService.sendMessage({ 
          to: currentChat?.userId, 
          content: '',
          image: {
            url: imageUrl,
            blurred: true
          }
        });
      } else {
        handleReceiveMessage(messageData);
      }

      setImageUploads(prevUploads => {
        const newUploads = prevUploads + 1;
        localStorage.setItem(IMAGE_UPLOADS_KEY, newUploads.toString());
        return newUploads;
      });

      cancelImageUpload();
      toast.success('Image sent successfully!');
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'Failed to process image. Please try again.');
    }
  };

  const toggleImageBlur = (messageId: string, shouldBlur: boolean) => {
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        if (msg.id === messageId && msg.image) {
          return {
            ...msg,
            image: {
              ...msg.image,
              blurred: shouldBlur
            }
          };
        }
        return msg;
      });
    });
  };

  const handleVoiceMessage = () => {
    if (!isVipUser) {
      toast.info('Voice messages are available for VIP users only.');
    } else {
      toast.info('Voice recording started...');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('chatiwy_session_id');
    navigate('/');
    toast.success('You have been logged out successfully');
  };

  const openImageInFullResolution = (imageUrl: string) => {
    setFullResImage(imageUrl);
    setShowImageModal(true);
  };

  const renderContent = () => {
    switch (view) {
      case 'chat':
        return (
          <div className="flex flex-col h-full">
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
                  </div>
                  <div className="text-xs opacity-80 flex items-center gap-1">
                    {currentChat?.isBot ? (
                      <>
                        {getCountryFlag(botProfiles.find(b => b.id === currentChat.userId)?.country)}
                        {' '}
                        {botProfiles.find(b => b.id === currentChat.userId)?.interests.slice(0, 2).join(', ')}
                      </>
                    ) : (
                      <>
                        {userProfile.interests && userProfile.interests.length > 0 
                          ? userProfile.interests.slice(0, 2).join(', ')
                          : 'Chatiwy user'}
                      </>
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
                      <ReportForm 
                        userName={currentChat.username} 
                        onClose={() => {}} 
                        isOpen={true}
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
                    <DropdownMenuItem onClick={() => setView('history')}>
                      <History className="mr-2 h-4 w-4" />
                      <span>Message History</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setView('blocked')}>
                      <Ban className="mr-2 h-4 w-4" />
                      <span>Blocked Users</span>
                    </DropdownMenuItem>
                    {!currentChat?.isAdmin && currentChat && (
                      <DropdownMenuItem onClick={handleBlockUser}>
                        <UserX className="mr-2 h-4 w-4" />
                        <span>Block User</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <ScrollArea 
              className="flex-1 p-4 overflow-auto"
            >
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === userProfile.username ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card className={`max-w-[80%] p-3 ${
                      message.sender === userProfile.username 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {message.image ? (
                        <div className="mb-2">
                          <div className="relative">
                            <div className={message.image.blurred ? 'blur-xl' : ''}>
                              <img 
                                src={message.image.url} 
                                alt="Shared image" 
                                className="max-w-full rounded-md max-h-[300px] object-contain" 
                              />
                            </div>
                            {message.image.blurred && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="opacity-90 z-10"
                                  onClick={() => toggleImageBlur(message.id, false)}
                                >
                                  <Eye size={16} className="mr-1" /> Reveal image
                                </Button>
                              </div>
                            )}
                            {!message.image.blurred && (
                              <div className="absolute bottom-2 right-2">
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="opacity-75 hover:opacity-100"
                                  onClick={() => toggleImageBlur(message.id, true)}
                                >
                                  <EyeOff size={12} className="mr-1" /> Blur
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="break-words">{message.content}</div>
                      )}
                      <div className={`text-xs mt-1 ${
                        message.sender === userProfile.username 
                          ? 'text-primary-foreground/80' 
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </Card>
                  </div>
                ))}
                {userTyping && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{currentChat?.username} is typing...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messageEndRef}></div>
              </div>
            </ScrollArea>
            
            {imagePreview && (
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Image preview</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={cancelImageUpload}
                    className="h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
                <img 
                  src={imagePreview} 
                  alt="Upload preview" 
                  className="max-h-[200px] rounded-md mx-auto object-contain" 
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={sendImageMessage} size="sm">
                    Send Image
                  </Button>
                </div>
              </div>
            )}
            
            {!blockedUsers.has(currentChat?.userId || '') ? (
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    {showEmojiPicker && (
                      <Card className="absolute bottom-full mb-2 p-2 max-h-[300px] w-full overflow-auto">
                        <div className="grid grid-cols-8 gap-1">
                          {allEmojis.map((emoji, index) => (
                            <Button 
                              key={index} 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 text-lg"
                              onClick={() => handleEmojiClick(emoji)}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </Card>
                    )}
                    
                    <div className="flex h-10 w-full items-center relative">
                      <Input
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="pr-16 h-10"
                        maxLength={MAX_MESSAGE_LENGTH}
                      />
                      <div className="absolute right-2 text-xs text-muted-foreground pointer-events-none">
                        {messageInput.length}/{MAX_MESSAGE_LENGTH}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="h-10 w-10"
                          >
                            <Smile size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add emoji</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleImageUpload}
                            className="h-10 w-10"
                            disabled={imageUploads >= 10}
                          >
                            <ImageIcon size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {imageUploads >= 10 
                              ? 'Daily image upload limit reached' 
                              : `Add image (${imageUploads}/10)`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png
