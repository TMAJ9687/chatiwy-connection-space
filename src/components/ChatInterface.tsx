import React, { useState, useEffect, useRef } from 'react';
import { ChatMessageSection } from '@/components/ChatMessageSection';
import { ChatInputSection } from '@/components/ChatInputSection';
import { ImageModal } from '@/components/ImageModal';
import { ChatHistorySidebar } from '@/components/ChatHistorySidebar';
import { BlockedUsersSidebar } from '@/components/BlockedUsersSidebar';
import { ReportForm } from '@/components/ReportForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { History, Ban, MessageSquare, Inbox, Flag } from 'lucide-react';
import { 
  Message, 
  BLOCKED_USERS_KEY, 
  MAX_MESSAGE_LENGTH_REGULAR, 
  MAX_MESSAGE_LENGTH_VIP,
  ALLOWED_IMAGE_TYPES,
  IMAGE_UPLOADS_KEY,
  MAX_IMAGE_SIZE 
} from '@/utils/chatUtils';
import { getPhotoLimit } from '@/utils/siteSettings';
import { ScrollArea } from '@/components/ui/scroll-area';
import { botProfiles } from '@/utils/botProfiles';
import { toast } from 'sonner';
import socketService from '@/services/socketService';
import { STANDARD_AVATARS, MALE_AVATARS, FEMALE_AVATARS } from '@/components/connected-users/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatInterfaceProps {
  userProfile: any;
  selectedUser: string | null;
  onUserSelect: (userId: string | null) => void;
  socketConnected?: boolean;
}

declare global {
  interface Window {
    unreadMessagesPerUser: Set<string>;
  }
}

if (!window.unreadMessagesPerUser) {
  window.unreadMessagesPerUser = new Set<string>();
}

const userChatHistories: Record<string, Message[]> = {};
const blockedUsers: Set<string> = new Set();
const mockConnectedUsers = new Map<string, any>();

interface InboxMessage {
  id: string;
  sender: string;
  senderId: string;
  avatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  image?: {
    url: string;
    blurred: boolean;
  };
}

export function ChatInterface({ 
  userProfile, 
  selectedUser, 
  onUserSelect, 
  socketConnected = false 
}: ChatInterfaceProps) {
  const [currentChat, setCurrentChat] = useState<{
    userId: string;
    username: string;
    isBot: boolean;
    isAdmin?: boolean;
    isVIP?: boolean;
  } | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [lastMessage, setLastMessage] = useState<string>('');
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploads, setImageUploads] = useState<number>(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [fullResImage, setFullResImage] = useState<string | null>(null);
  const [isVipUser, setIsVipUser] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [showBlockedSidebar, setShowBlockedSidebar] = useState(false);
  const [showInboxSidebar, setShowInboxSidebar] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportedUser, setReportedUser] = useState('');
  const [blockedUsersList, setBlockedUsersList] = useState<string[]>([]);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    try {
      const storedBlockedUsers = localStorage.getItem(BLOCKED_USERS_KEY);
      if (storedBlockedUsers) {
        const parsedBlockedUsers = JSON.parse(storedBlockedUsers);
        parsedBlockedUsers.forEach((userId: string) => blockedUsers.add(userId));
        setBlockedUsersList(Array.from(blockedUsers));
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  }, []);
  
  useEffect(() => {
    if (selectedUser) {
      if (!socketConnected && mockConnectedUsers.size === 0) {
        botProfiles.forEach(bot => {
          mockConnectedUsers.set(bot.id, {
            id: bot.id,
            username: bot.username,
            isBot: false,
            interests: bot.interests,
            gender: bot.gender,
            country: bot.country,
            age: bot.age,
            isOnline: true,
            isVIP: bot.isVIP || false
          });
        });
      }

      const user = socketConnected
        ? { 
            id: selectedUser, 
            username: botProfiles.find(b => b.id === selectedUser)?.username || selectedUser,
            isBot: false,
            isVIP: botProfiles.find(b => b.id === selectedUser)?.isVIP || false
          }
        : mockConnectedUsers.get(selectedUser);

      if (user) {
        setCurrentChat({
          userId: user.id,
          username: user.username || user.id,
          isBot: false,
          isAdmin: !!user.isAdmin,
          isVIP: !!user.isVIP
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
        onUserSelect(null);
      }
    }
  }, [currentChat, onUserSelect]);
  
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);
  
  useEffect(() => {
    setIsVipUser(!!userProfile?.isVIP);
  }, [userProfile]);
  
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= getMaxMessageLength()) {
      setMessageInput(value);
      
      if (socketConnected && currentChat) {
        socketService.sendTyping({ to: currentChat.userId, isTyping: true });
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          socketService.sendTyping({ to: currentChat.userId, isTyping: false });
        }, 3000);
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const isUserBlockedBy = (userId: string): boolean => {
    return false;
  };
  
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    if (currentChat && isUserBlockedBy(currentChat.userId)) {
      toast.error(`You've been blocked by ${currentChat.username}`);
      return;
    }

    if (currentChat && blockedUsers.has(currentChat.userId)) {
      toast.error(`You can't message a blocked user`);
      return;
    }

    if (messageInput === lastMessage) {
      setDuplicateCount(duplicateCount + 1);
      if (duplicateCount >= 2) {
        toast.warning('Please avoid sending the same message repeatedly.');
        return;
      }
    } else {
      setDuplicateCount(0);
    }

    const newMessageId = Math.random().toString(36).substring(2, 15);
    
    setMessages(prevMessages => {
      const newMessage: Message = {
        id: newMessageId,
        sender: userProfile.username,
        senderId: userProfile.id,
        content: messageInput,
        timestamp: new Date(),
        isBot: false,
        status: isVipUser ? 'sent' : undefined
      };

      if (currentChat) {
        if (!userChatHistories[currentChat.userId]) {
          userChatHistories[currentChat.userId] = [];
        }
        
        const updatedHistory = [...userChatHistories[currentChat.userId], newMessage];
        userChatHistories[currentChat.userId] = updatedHistory;
      }
      return [...prevMessages, newMessage];
    });

    if (socketConnected && currentChat) {
      socketService.sendMessage({ 
        to: currentChat.userId, 
        content: messageInput,
        messageId: newMessageId,
        sender: userProfile.username,
        senderId: userProfile.id
      }).catch(error => {
        console.error('Error sending message:', error);
        toast.error('Failed to send message. Please try again.');
      });
      
      if (isVipUser) {
        setTimeout(() => {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === newMessageId ? { ...msg, status: 'delivered' as const } : msg
            )
          );
          
          if (currentChat) {
            userChatHistories[currentChat.userId] = userChatHistories[currentChat.userId].map(msg => 
              msg.id === newMessageId ? { ...msg, status: 'delivered' as const } : msg
            );
          }
          
          setTimeout(() => {
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === newMessageId ? { ...msg, status: 'read' as const } : msg
              )
            );
          
            if (currentChat) {
              userChatHistories[currentChat.userId] = userChatHistories[currentChat.userId].map(msg => 
                msg.id === newMessageId ? { ...msg, status: 'read' as const } : msg
              );
            }
          }, 3000);
        }, 1000);
      }
    } else if (currentChat && currentChat.isBot) {
      handleReceiveMessage({
        sender: userProfile.username,
        senderId: userProfile.id,
        content: messageInput,
        timestamp: new Date(),
        isBot: false
      });
    }

    setLastMessage(messageInput);
    setMessageInput('');
    
    if (socketConnected && currentChat) {
      socketService.sendTyping({ to: currentChat.userId, isTyping: false });
    }
  };
  
  const handleReceiveMessage = (messageData: any) => {
    console.log('Received message data:', messageData);
    
    const sender = messageData.sender || messageData.username || 'Unknown';
    const senderId = messageData.senderId || messageData.from || messageData.userId || 'unknown-id';
    const isBot = messageData.isBot || false;
    const content = messageData.content || '';
    const image = messageData.image;
    const messageId = messageData.messageId || messageData.id || Math.random().toString(36).substring(2, 15);
    
    if (blockedUsers.has(senderId)) {
      console.log('Message from blocked user ignored:', senderId);
      return;
    }
    
    const receivedMessage: Message = {
      id: messageId,
      sender,
      senderId,
      content,
      timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
      isBot,
      image
    };
    
    const belongsToCurrentChat = currentChat && 
      (senderId === currentChat.userId || receivedMessage.senderId === currentChat.userId);
    
    if (belongsToCurrentChat) {
      setMessages(prevMessages => {
        const isDuplicate = prevMessages.some(msg => 
          msg.id === receivedMessage.id || 
          (msg.content === receivedMessage.content && 
           msg.sender === receivedMessage.sender &&
           Math.abs(new Date(msg.timestamp).getTime() - new Date(receivedMessage.timestamp).getTime()) < 5000)
        );
        
        if (isDuplicate) {
          console.log('Duplicate message detected, ignoring:', receivedMessage);
          return prevMessages;
        }
        
        const updatedMessages = [...prevMessages, receivedMessage];
        
        if (currentChat) {
          if (!userChatHistories[currentChat.userId]) {
            userChatHistories[currentChat.userId] = [];
          }
          
          userChatHistories[currentChat.userId] = [...userChatHistories[currentChat.userId], receivedMessage];
        }
        
        return updatedMessages;
      });
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else {
      if (senderId) {
        if (!userChatHistories[senderId]) {
          userChatHistories[senderId] = [];
        }
        
        const isDuplicate = userChatHistories[senderId].some(msg => 
          msg.id === receivedMessage.id || 
          (msg.content === receivedMessage.content && 
           msg.sender === receivedMessage.sender &&
           Math.abs(new Date(msg.timestamp).getTime() - new Date(receivedMessage.timestamp).getTime()) < 5000)
        );
        
        if (!isDuplicate) {
          userChatHistories[senderId] = [...userChatHistories[senderId], receivedMessage];
          
          window.unreadMessagesPerUser.add(senderId);
          
          const user = socketConnected
            ? { id: senderId, username: sender }
            : mockConnectedUsers.get(senderId) || botProfiles.find(b => b.id === senderId);
          
          if (user) {
            const gender = user.gender || 'Male';
            const avatarUrl = gender.toLowerCase() === 'male' 
              ? STANDARD_AVATARS.male 
              : STANDARD_AVATARS.female;
            
            const inboxMessage: InboxMessage = {
              id: messageId,
              sender: user.username || sender,
              senderId,
              avatar: avatarUrl,
              content: content || (image ? 'Sent an image' : ''),
              timestamp: new Date(),
              isRead: false,
              image
            };
            
            setInboxMessages(prev => [inboxMessage, ...prev]);
            
            if (!blockedUsers.has(senderId)) {
              toast.info(`New message from ${sender}`);
            }
          }
        }
      }
    }
  };
  
  const handleBlockUser = () => {
    if (currentChat) {
      setShowBlockConfirm(true);
    } else {
      toast.error("Please select a chat first");
    }
  };
  
  const confirmBlockUser = () => {
    if (currentChat) {
      blockedUsers.add(currentChat.userId);
      updateBlockedUsersStorage();
      setMessages([]);
      setCurrentChat(null);
      onUserSelect(null);
      setShowBlockConfirm(false);
    }
  };
  
  const handleReportUserButton = () => {
    if (currentChat) {
      setReportedUser(currentChat.username);
      setShowReportForm(true);
    } else {
      toast.error("Please select a chat first");
    }
  };
  
  const handleUnblockUser = (userId: string) => {
    blockedUsers.delete(userId);
    updateBlockedUsersStorage();
    setShowBlockedSidebar(false);
  };
  
  const handleReport = (userName: string) => {
    setReportedUser(userName);
    setShowReportForm(true);
  };
  
  const handleReportClose = () => {
    setShowReportForm(false);
    setReportedUser('');
  };
  
  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prevInput => prevInput + emoji);
  };
  
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!selectedImage || !imagePreview || !currentChat) {
      return;
    }

    if (isUserBlockedBy(currentChat.userId)) {
      toast.error(`You've been blocked by ${currentChat.username}`);
      return;
    }

    if (blockedUsers.has(currentChat.userId)) {
      toast.error(`You can't message a blocked user`);
      return;
    }

    try {
      const photoLimit = getPhotoLimit(isVipUser);
      
      if (imageUploads >= photoLimit) {
        if (isVipUser) {
          toast.error(`You've reached your VIP daily limit of ${photoLimit} images.`);
        } else {
          toast.error(`You've reached your daily limit of ${photoLimit} images. Upgrade to VIP for increased limits.`);
        }
        return;
      }

      const imageUrl = imagePreview;
      const messageId = Math.random().toString(36).substring(2, 15);

      const imageMessage: Message = {
        id: messageId,
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
        if (currentChat) {
          if (!userChatHistories[currentChat.userId]) {
            userChatHistories[currentChat.userId] = [];
          }
          userChatHistories[currentChat.userId] = [...userChatHistories[currentChat.userId], imageMessage];
        }
        return [...prevMessages, imageMessage];
      });

      if (socketConnected) {
        socketService.sendMessage({ 
          to: currentChat.userId, 
          content: '',
          messageId,
          sender: userProfile.username,
          senderId: userProfile.id,
          image: {
            url: imageUrl,
            blurred: true
          }
        }).catch(error => {
          console.error('Error sending image:', error);
          toast.error('Failed to send image. Please try again.');
        });
      } else {
        handleReceiveMessage({
          sender: userProfile.username,
          senderId: userProfile.id,
          content: '',
          timestamp: new Date(),
          isBot: false,
          image: {
            url: imageUrl,
            blurred: true
          }
        });
      }

      setImageUploads(prevUploads => {
        const newUploads = prevUploads + 1;
        localStorage.setItem(IMAGE_UPLOADS_KEY, newUploads.toString());
        
        if (!isVipUser && newUploads >= 7) {
          toast.info(
            'You\'re approaching your daily image limit. Upgrade to VIP for increased limits!',
            { duration: 5000 }
          );
        }
        
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
  
  const openImageInFullResolution = (imageUrl: string) => {
    setFullResImage(imageUrl);
    setShowImageModal(true);
  };
  
  const getMaxMessageLength = () => isVipUser ? MAX_MESSAGE_LENGTH_VIP : MAX_MESSAGE_LENGTH_REGULAR;
  
  const updateBlockedUsersStorage = () => {
    try {
      localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(Array.from(blockedUsers)));
      setBlockedUsersList(Array.from(blockedUsers));
    } catch (error) {
      console.error('Error saving blocked users:', error);
    }
  };
  
  const getAllChatHistories = () => {
    const histories: { 
      userId: string; 
      username: string;
      lastMessage?: Message;
      messageCount: number;
    }[] = [];
    
    Object.entries(userChatHistories).forEach(([userId, messages]) => {
      const user = mockConnectedUsers.get(userId) || botProfiles.find(b => b.id === userId);
      if (user) {
        histories.push({
          userId,
          username: user.username,
          lastMessage: messages[messages.length - 1],
          messageCount: messages.length
        });
      }
    });
    
    return histories.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp?.getTime() || 0;
      const bTime = b.lastMessage?.timestamp?.getTime() || 0;
      return bTime - aTime;
    });
  };
  
  const getUsernameById = (userId: string): string => {
    return mockConnectedUsers.get(userId)?.username || 
           botProfiles.find(b => b.id === userId)?.username || 
           'Unknown User';
  };
  
  useEffect(() => {
    if (socketConnected) {
      console.log('Setting up socket event listeners for real-time messaging');
      
      socketService.on('typing', (data: { from: string; username: string; isTyping: boolean }) => {
        if (isVipUser) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.username || data.from);
            } else {
              newSet.delete(data.username || data.from);
            }
            return newSet;
          });
        }
      });
      
      socketService.on('message_status', (data: { messageId: string; status: 'delivered' | 'read' }) => {
        if (isVipUser) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === data.messageId ? { ...msg, status: data.status } : msg
            )
          );
          
          if (currentChat) {
            userChatHistories[currentChat.userId] = userChatHistories[currentChat.userId].map(msg => 
              msg.id === data.messageId ? { ...msg, status: data.status } : msg
            );
          }
        }
      });
      
      const handleReceivedMessage = (data: any) => {
        console.log('New message received via socket:', data);
        handleReceiveMessage(data);
      };
      
      socketService.on('receive_message', handleReceivedMessage);
      socketService.on('direct_message', handleReceivedMessage);
      socketService.on('chat_message', handleReceivedMessage);
      socketService.on('message', handleReceivedMessage);
      
      return () => {
        if (socketConnected) {
          socketService.off('typing');
          socketService.off('message_status');
          socketService.off('receive_message');
          socketService.off('direct_message');
          socketService.off('chat_message');
          socketService.off('message');
        }
      };
    }
  }, [socketConnected, isVipUser, currentChat]);
  
  useEffect(() => {
    if (socketConnected && currentChat && messageInput.length > 0) {
      socketService.sendTyping({ to: currentChat.userId, isTyping: true });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping({ to: currentChat.userId, isTyping: false });
      }, 3000);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, currentChat, socketConnected]);
  
  const isBlockedByUser = currentChat ? blockedUsers.has(userProfile.id) : false;
  const isBlocked = currentChat ? blockedUsers.has(currentChat.userId) : false;
  
  return (
    <div className="rounded-md overflow-hidden border border-border h-full">
      <ChatHistorySidebar 
        open={showHistorySidebar}
        onOpenChange={setShowHistorySidebar}
        chatHistories={getAllChatHistories()}
        onSelectUser={onUserSelect}
      />

      <BlockedUsersSidebar
        open={showBlockedSidebar}
        onOpenChange={setShowBlockedSidebar}
        blockedUsers={blockedUsersList}
        onUnblock={handleUnblockUser}
        getUsernameById={getUsernameById}
      />

      {showReportForm && (
        <ReportForm 
          isOpen={showReportForm}
          onClose={handleReportClose}
          userName={reportedUser}
          onSubmitReport={(reason) => onUserSelect(null)}
        />
      )}
      
      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block "{currentChat?.username}"? You won't receive messages from them anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBlockUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {currentChat ? (
        <div className="flex flex-col h-full">
          <ChatMessageSection 
            currentChat={currentChat}
            messages={messages}
            currentUsername={userProfile.username}
            isBlocked={isBlocked}
            isBlockedByUser={isBlockedByUser}
            messageEndRef={messageEndRef}
            onBlockUser={handleBlockUser}
            onReport={handleReport}
            onViewHistory={() => setShowHistorySidebar(true)}
            onViewBlocked={() => setShowBlockedSidebar(true)}
            toggleImageBlur={toggleImageBlur}
            openImageInFullResolution={openImageInFullResolution}
            isVipUser={isVipUser}
            typingUsers={typingUsers}
          />
          
          {(!isBlocked && !isBlockedByUser) && (
            <ChatInputSection 
              isBlocked={isBlocked}
              blockedUsername={currentChat.username}
              isBlockedByUser={isBlockedByUser}
              blockedByUsername={userProfile.username}
              messageInput={messageInput}
              imagePreview={imagePreview}
              isVipUser={isVipUser}
              imageUploads={imageUploads}
              maxMessageLength={getMaxMessageLength()}
              onInputChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onSendMessage={handleSendMessage}
              onImageUpload={handleImageUpload}
              onSendImage={sendImageMessage}
              onCancelImage={cancelImageUpload}
              onEmojiClick={handleEmojiClick}
            />
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg,image/png,image/gif,image/jpg"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Card className="p-6 max-w-md text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <h2 className="text-lg font-medium mb-2">Select a chat to start messaging</h2>
            <p className="text-muted-foreground">
              Choose a user from the list to begin a conversation
            </p>
          </Card>
        </div>
      )}

      <ImageModal 
        imageUrl={fullResImage} 
        isOpen={showImageModal} 
        onClose={() => setShowImageModal(false)} 
      />

      <div className="absolute top-4 right-4 flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-full"
                size="icon"
                variant="destructive"
                onClick={handleBlockUser}
              >
                <Ban className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Block User</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-full"
                size="icon"
                variant="warning"
                onClick={handleReportUserButton}
              >
                <Flag className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Report User</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-full"
                size="icon"
                variant="secondary"
                onClick={() => setShowBlockedSidebar(true)}
              >
                <Ban className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Blocked Users</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-full"
                size="icon"
                variant="secondary"
                onClick={() => setShowInboxSidebar(true)}
              >
                <Inbox className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inbox</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-full"
                size="icon"
                variant="secondary"
                onClick={() => setShowHistorySidebar(true)}
              >
                <History className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat History</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
