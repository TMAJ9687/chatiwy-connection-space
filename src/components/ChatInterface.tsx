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
  LogOut
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

const userChatHistories: Record<string, Message[]> = {};
const blockedUsers: Set<string> = new Set();

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
  return country.emoji;
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
  const navigate = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);
  const [fullResImage, setFullResImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUser) {
      const user = socketConnected
        ? Array.from(socketService.connectedUsers.values()).find(user => user.id === selectedUser)
        : Array.from(mockConnectedUsers.values()).find(user => user.id === selectedUser);

      if (user) {
        setCurrentChat({
          userId: user.id,
          username: user.username,
          isBot: user.isBot || false,
          isAdmin: user.isAdmin || false
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
          const botResponse = getRandomBotResponse(currentChat.userId);
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
        socketService.sendMessage(currentChat?.userId, messageData);
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

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (e.target.value.trim() !== '') {
      if (!userTyping) {
        setUserTyping(true);
        if (socketConnected) {
          socketService.sendUserTyping(currentChat?.userId);
        }
      }
    } else {
      if (userTyping) {
        setUserTyping(false);
        if (socketConnected) {
          socketService.sendUserStoppedTyping(currentChat?.userId);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Image upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const imageUrl = result.data.url;

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
          socketService.sendMessage(currentChat?.userId, messageData);
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
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
    }
  };

  const toggleImageBlur = (messageId: string) => {
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        if (msg.id === messageId && msg.image) {
          return {
            ...msg,
            image: {
              ...msg.image,
              blurred: !msg.image.blurred
            }
          };
        }
        return msg;
      });
    });
  };

  const handleVoiceMessage = () => {
    toast.info('Voice messages are available for VIP users only.');
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
                    {currentChat?.isBot && (
                      <Badge variant="secondary" className="ml-1 text-[10px]">
                        Bot
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
                        username={currentChat.username} 
                        onClose={() => {}} 
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <ScrollArea 
              className="flex-1 p-4 overflow-auto"
              ref={scrollAreaRef}
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
                          <div 
                            className={`relative cursor-pointer ${message.image.blurred ? 'blur-sm hover:blur-none transition-all' : ''}`}
                            onClick={() => openImageInFullResolution(message.image!.url)}
                          >
                            <img 
                              src={message.image.url} 
                              alt="Shared image" 
                              className="max-w-full rounded-md max-h-[300px] object-contain" 
                            />
                            {message.image.blurred && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="opacity-90"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleImageBlur(message.id);
                                  }}
                                >
                                  <Eye size={16} className="mr-1" /> View image
                                </Button>
                              </div>
                            )}
                          </div>
                          {!message.image.blurred && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-1 text-xs"
                              onClick={() => toggleImageBlur(message.id)}
                            >
                              <EyeOff size={12} className="mr-1" /> Blur image
                            </Button>
                          )}
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
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    {showEmojiPicker && (
                      <Card className="absolute bottom-full mb-2 p-2 max-h-[300px] w-full overflow-auto">
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                          {Object.keys(emojiCategories).map((category) => (
                            <Button
                              key={category}
                              variant={currentEmojiCategory === category ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentEmojiCategory(category as keyof typeof emojiCategories)}
                              className="text-xs whitespace-nowrap"
                            >
                              {category}
                            </Button>
                          ))}
                        </div>
                        <div className="grid grid-cols-8 gap-1">
                          {emojiCategories[currentEmojiCategory].map((emoji, index) => (
                            <Button 
                              key={index} 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEmojiClick(emoji)}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </Card>
                    )}
                    
                    <Textarea
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="min-h-[60px] max-h-[120px] resize-none"
                    />
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
                      accept="image/jpeg,image/png,image/gif,image/jpg"
                      className="hidden"
                    />
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleVoiceMessage}
                            className="h-10 w-10"
                          >
                            <Mic size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Voice message (VIP only)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!messageInput.trim()} 
                      className="h-10"
                    >
                      <Send size={18} className="mr-1" /> Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t text-center text-muted-foreground">
                <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                <p>You have blocked this user. Unblock them to send messages.</p>
              </div>
            )}
          </div>
        );
      case 'history':
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Message History</h2>
            <Button onClick={() => setView('chat')}>Back to Chat</Button>
          </div>
        );
      case 'inbox':
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Inbox</h2>
            <Button onClick={() => setView('chat')}>Back to Chat</Button>
          </div>
        );
      case 'blocked':
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Blocked Users</h2>
            <ul>
              {Array.from(blockedUsers).map(userId => {
                const user = socketConnected
                  ? Array.from(socketService.connectedUsers.values()).find(user => user.id === userId)
                  : Array.from(mockConnectedUsers.values()).find(user => user.id === userId);
                
                return user ? (
                  <li key={userId} className="py-2 flex items-center justify-between">
                    <span>{user.username}</span>
                    <Button onClick={() => {
                      blockedUsers.delete(userId);
                      setView('blocked');
                      toast.success(`You have unblocked ${user.username}.`);
                    }}>
                      Unblock
                    </Button>
                  </li>
                ) : null;
              })}
            </ul>
            <Button onClick={() => setView('chat')}>Back to Chat</Button>
          </div>
        );
    }
  };

  return (
    <>
      <Card className="h-full overflow-hidden">
        {currentChat ? (
          renderContent()
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare size={48} className="text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Chatiwy</h2>
            <p className="mb-6 text-muted-foreground max-w-md">
              Select a user from the list to start chatting or find new friends to connect with
            </p>
            <Button onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </Card>

      {showImageModal && fullResImage && (
        <div 
          
