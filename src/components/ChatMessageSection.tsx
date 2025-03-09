
import React from 'react';
import { MessageList } from '@/components/MessageList';
import { ChatHeader } from '@/components/ChatHeader';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { Message, getCountryFlag } from '@/utils/chatUtils';
import { botProfiles } from '@/utils/botProfiles';
import { STANDARD_AVATARS, MALE_AVATARS, FEMALE_AVATARS } from '@/components/connected-users/types';

interface ChatMessageSectionProps {
  currentChat: {
    userId: string;
    username: string;
    isBot: boolean;
    isAdmin?: boolean;
  } | null;
  messages: Message[];
  currentUsername: string;
  isBlocked: boolean;
  messageEndRef: React.RefObject<HTMLDivElement>;
  onBlockUser: () => void;
  onReport: (username: string) => void;
  onViewHistory: () => void;
  onViewBlocked: () => void;
  toggleImageBlur: (messageId: string, shouldBlur: boolean) => void;
  openImageInFullResolution: (imageUrl: string) => void;
  isVipUser: boolean;
  typingUsers?: Set<string>;
}

export function ChatMessageSection({
  currentChat,
  messages,
  currentUsername,
  isBlocked,
  messageEndRef,
  onBlockUser,
  onReport,
  onViewHistory,
  onViewBlocked,
  toggleImageBlur,
  openImageInFullResolution,
  isVipUser,
  typingUsers
}: ChatMessageSectionProps) {
  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-6 max-w-md text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <h2 className="text-lg font-medium mb-2">Select a chat to start messaging</h2>
          <p className="text-muted-foreground">
            Choose a user from the list to begin a conversation
          </p>
        </Card>
      </div>
    );
  }

  const getAvatarForChat = (username: string, isBot: boolean) => {
    // Try to find a bot profile for the current user ID
    const botProfile = botProfiles.find(b => b.id === currentChat.userId || b.username === username);
    const gender = botProfile?.gender || 'Male';
    
    // For both bots and regular users, use standard avatars based on gender
    return gender.toLowerCase() === 'male' ? STANDARD_AVATARS.male : STANDARD_AVATARS.female;
  };
  
  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        username={currentChat.username}
        isAdmin={currentChat.isAdmin}
        isBot={currentChat.isBot}
        avatarUrl={getAvatarForChat(currentChat.username, currentChat.isBot)}
        countryFlag={getCountryFlag(botProfiles.find(b => b.id === currentChat.userId)?.country)}
        interests={botProfiles.find(b => b.id === currentChat.userId)?.interests?.slice(0, 2)}
        onBlock={onBlockUser}
        onReport={onReport}
        onViewHistory={onViewHistory}
        onViewBlocked={onViewBlocked}
      />
      
      {messages.length > 0 ? (
        <MessageList 
          messages={messages}
          currentUsername={currentUsername}
          toggleImageBlur={toggleImageBlur}
          openImageInFullResolution={openImageInFullResolution}
          messageEndRef={messageEndRef}
          isVipUser={isVipUser}
          typingUsers={typingUsers}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-lg font-medium">No messages yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Start a conversation with {currentChat.username}</p>
          </div>
        </div>
      )}
    </div>
  );
}
