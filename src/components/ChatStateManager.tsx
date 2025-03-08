
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Message, BLOCKED_USERS_KEY, MAX_MESSAGE_LENGTH_REGULAR, MAX_MESSAGE_LENGTH_VIP, IMAGE_UPLOADS_KEY, IMAGE_UPLOADS_DATE_KEY } from '@/utils/chatUtils';
import { getPhotoLimit } from '@/utils/siteSettings';
import socketService from '@/services/socketService';
import { getRandomBotResponse } from '@/utils/botProfiles';

interface ChatState {
  messages: Message[];
  blockedUsers: Set<string>;
  blockedUsersList: string[];
  lastMessage: string;
  duplicateCount: number;
  imageUploads: number;
  selectedImage: File | null;
  imagePreview: string | null;
  showImageModal: boolean;
  fullResImage: string | null;
  isVipUser: boolean;
}

interface ChatStateManagerProps {
  currentChat: {
    userId: string;
    username: string;
    isBot: boolean;
    isAdmin?: boolean;
  } | null;
  userProfile: any;
  socketConnected: boolean;
  children: (props: {
    state: ChatState;
    actions: {
      handleSendMessage: () => void;
      handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
      handleImageUpload: () => void;
      handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      cancelImageUpload: () => void;
      sendImageMessage: () => Promise<void>;
      toggleImageBlur: (messageId: string, shouldBlur: boolean) => void;
      openImageInFullResolution: (imageUrl: string) => void;
      closeImageModal: () => void;
      handleBlockUser: () => void;
      handleUnblockUser: (userId: string) => void;
      handleEmojiClick: (emoji: string) => void;
      getMaxMessageLength: () => number;
    };
    messageInput: string;
    setMessageInput: React.Dispatch<React.SetStateAction<string>>;
  }) => React.ReactNode;
}

export function ChatStateManager({ 
  currentChat, 
  userProfile, 
  socketConnected,
  children 
}: ChatStateManagerProps) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    blockedUsers: new Set<string>(),
    blockedUsersList: [],
    lastMessage: '',
    duplicateCount: 0,
    imageUploads: 0,
    selectedImage: null,
    imagePreview: null,
    showImageModal: false,
    fullResImage: null,
    isVipUser: false
  });
  
  const [messageInput, setMessageInput] = useState('');
  const userChatHistories: Record<string, Message[]> = {};
  
  // Load blocked users from localStorage
  useEffect(() => {
    try {
      const storedBlockedUsers = localStorage.getItem(BLOCKED_USERS_KEY);
      if (storedBlockedUsers) {
        const parsedBlockedUsers = JSON.parse(storedBlockedUsers);
        const blockedUsersSet = new Set<string>(parsedBlockedUsers);
        setState(prev => ({
          ...prev, 
          blockedUsers: blockedUsersSet,
          blockedUsersList: parsedBlockedUsers
        }));
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  }, []);
  
  // Set VIP status
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isVipUser: !!userProfile?.isVIP
    }));
    
    if (userProfile?.isVIP) {
      const today = new Date().toLocaleDateString();
      localStorage.setItem(IMAGE_UPLOADS_DATE_KEY, today);
      localStorage.setItem(IMAGE_UPLOADS_KEY, '0');
    }
  }, [userProfile]);
  
  // Load daily image uploads count
  useEffect(() => {
    const uploads = localStorage.getItem(IMAGE_UPLOADS_KEY);
    const date = localStorage.getItem(IMAGE_UPLOADS_DATE_KEY);
    const today = new Date().toLocaleDateString();

    if (date === today && uploads) {
      setState(prev => ({ ...prev, imageUploads: parseInt(uploads, 10) }));
    } else {
      setState(prev => ({ ...prev, imageUploads: 0 }));
      localStorage.setItem(IMAGE_UPLOADS_DATE_KEY, today);
      localStorage.setItem(IMAGE_UPLOADS_KEY, '0');
    }
  }, []);
  
  // Load messages when current chat changes
  useEffect(() => {
    if (currentChat) {
      if (userChatHistories[currentChat.userId]) {
        setState(prev => ({ ...prev, messages: userChatHistories[currentChat.userId] }));
      } else {
        setState(prev => ({ ...prev, messages: [] }));
      }
    }
  }, [currentChat]);
  
  // Handle incoming messages
  useEffect(() => {
    if (socketConnected) {
      socketService.on('message', handleReceiveMessage);
      
      return () => {
        socketService.off('message', handleReceiveMessage);
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
              isBot: false
            });
          }
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentChat, socketConnected]);
  
  const handleReceiveMessage = (messageData: any) => {
    if (currentChat && messageData.senderId && messageData.senderId !== currentChat.userId) {
      return;
    }
    
    setState(prev => {
      const newMessage = {
        id: Math.random().toString(36).substring(2, 15),
        sender: messageData.sender,
        senderId: messageData.senderId,
        content: messageData.content,
        timestamp: new Date(messageData.timestamp),
        isBot: false,
        image: messageData.image
      };

      if (currentChat) {
        userChatHistories[currentChat.userId] = [...(userChatHistories[currentChat.userId] || []), newMessage];
      }
      
      return {
        ...prev,
        messages: [...prev.messages, newMessage]
      };
    });
  };
  
  const getMaxMessageLength = () => state.isVipUser ? MAX_MESSAGE_LENGTH_VIP : MAX_MESSAGE_LENGTH_REGULAR;
  
  const handleSendMessage = () => {
    if (messageInput.trim()) {
      if (messageInput === state.lastMessage) {
        setState(prev => {
          const newDuplicateCount = prev.duplicateCount + 1;
          if (newDuplicateCount >= 2) {
            toast.warning('Please avoid sending the same message repeatedly.');
            return prev;
          }
          return { ...prev, duplicateCount: newDuplicateCount };
        });
      } else {
        setState(prev => ({ ...prev, duplicateCount: 0 }));
      }

      const messageData = {
        sender: userProfile.username,
        senderId: userProfile.id,
        content: messageInput,
        timestamp: new Date(),
        isBot: false
      };

      setState(prev => {
        const newMessage = {
          id: Math.random().toString(36).substring(2, 15),
          sender: userProfile.username,
          senderId: userProfile.id,
          content: messageInput,
          timestamp: new Date(),
          isBot: false
        };

        if (currentChat) {
          userChatHistories[currentChat.userId] = [...(userChatHistories[currentChat.userId] || []), newMessage];
        }
        
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          lastMessage: messageInput
        };
      });

      if (socketConnected && currentChat) {
        socketService.sendMessage({ 
          to: currentChat.userId, 
          content: messageInput
        });
      } else if (currentChat && currentChat.isBot) {
        handleReceiveMessage({
          sender: currentChat.username,
          senderId: currentChat.userId,
          content: messageInput,
          timestamp: new Date(),
          isBot: false
        });
      }

      setMessageInput('');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= getMaxMessageLength()) {
      setMessageInput(value);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleImageUpload = () => {
    // Trigger file input click
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!state.isVipUser && state.imageUploads >= getPhotoLimit(false)) {
      toast.error(`You've reached your daily limit of ${getPhotoLimit(false)} images. Upgrade to VIP for increased limits.`);
      return;
    }

    setState(prev => ({ ...prev, selectedImage: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setState(prev => ({ ...prev, imagePreview: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };
  
  const cancelImageUpload = () => {
    setState(prev => ({
      ...prev,
      selectedImage: null,
      imagePreview: null
    }));
  };
  
  const sendImageMessage = async () => {
    if (!state.selectedImage || !state.imagePreview) {
      return;
    }

    try {
      const photoLimit = getPhotoLimit(state.isVipUser);
      
      if (state.imageUploads >= photoLimit) {
        if (state.isVipUser) {
          toast.error(`You've reached your VIP daily limit of ${photoLimit} images.`);
        } else {
          toast.error(`You've reached your daily limit of ${photoLimit} images. Upgrade to VIP for increased limits.`);
        }
        return;
      }

      const imageUrl = state.imagePreview;

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

      setState(prev => {
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

        if (currentChat) {
          userChatHistories[currentChat.userId] = [...(userChatHistories[currentChat.userId] || []), newMessage];
        }
        
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          imageUploads: prev.imageUploads + 1,
          selectedImage: null,
          imagePreview: null
        };
      });

      if (socketConnected && currentChat) {
        socketService.sendMessage({ 
          to: currentChat.userId, 
          content: '',
          image: {
            url: imageUrl,
            blurred: true
          }
        });
      } else {
        handleReceiveMessage(messageData);
      }

      // Update the image uploads in localStorage
      const newUploads = state.imageUploads + 1;
      localStorage.setItem(IMAGE_UPLOADS_KEY, newUploads.toString());
      
      if (!state.isVipUser && newUploads >= 7) {
        toast.info(
          'You\'re approaching your daily image limit. Upgrade to VIP for increased limits!',
          { duration: 5000 }
        );
      }

      toast.success('Image sent successfully!');
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'Failed to process image. Please try again.');
    }
  };
  
  const toggleImageBlur = (messageId: string, shouldBlur: boolean) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => {
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
      })
    }));
  };
  
  const openImageInFullResolution = (imageUrl: string) => {
    setState(prev => ({
      ...prev,
      fullResImage: imageUrl,
      showImageModal: true
    }));
  };
  
  const closeImageModal = () => {
    setState(prev => ({
      ...prev,
      showImageModal: false,
      fullResImage: null
    }));
  };
  
  const handleBlockUser = () => {
    if (currentChat) {
      setState(prev => {
        const newBlockedUsers = new Set(prev.blockedUsers);
        newBlockedUsers.add(currentChat.userId);
        
        // Update localStorage
        try {
          localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(Array.from(newBlockedUsers)));
        } catch (error) {
          console.error('Error saving blocked users:', error);
        }
        
        return {
          ...prev,
          blockedUsers: newBlockedUsers,
          blockedUsersList: Array.from(newBlockedUsers),
          messages: []
        };
      });
      
      toast.success(`You have blocked ${currentChat.username}.`);
    }
  };
  
  const handleUnblockUser = (userId: string) => {
    setState(prev => {
      const newBlockedUsers = new Set(prev.blockedUsers);
      newBlockedUsers.delete(userId);
      
      // Update localStorage
      try {
        localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(Array.from(newBlockedUsers)));
      } catch (error) {
        console.error('Error saving blocked users:', error);
      }
      
      return {
        ...prev,
        blockedUsers: newBlockedUsers,
        blockedUsersList: Array.from(newBlockedUsers)
      };
    });
    
    toast.success('User has been unblocked.');
  };
  
  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };
  
  return children({
    state,
    actions: {
      handleSendMessage,
      handleInputChange,
      handleKeyDown,
      handleImageUpload,
      handleFileChange,
      cancelImageUpload,
      sendImageMessage,
      toggleImageBlur,
      openImageInFullResolution,
      closeImageModal,
      handleBlockUser,
      handleUnblockUser,
      handleEmojiClick,
      getMaxMessageLength
    },
    messageInput,
    setMessageInput
  });
}
