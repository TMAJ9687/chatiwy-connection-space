
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChatActions } from '@/components/ChatActions';

interface ChatHeaderProps {
  username: string;
  isAdmin?: boolean;
  isBot?: boolean;
  avatarUrl: string;
  countryFlag?: string | null;
  interests?: string[];
  onBlock: () => void;
  onReport: (username: string) => void;
  onViewHistory: () => void;
  onViewBlocked: () => void;
}

export function ChatHeader({ 
  username,
  isAdmin = false,
  isBot = false,
  avatarUrl,
  countryFlag,
  interests,
  onBlock,
  onReport,
  onViewHistory,
  onViewBlocked
}: ChatHeaderProps) {
  return (
    <div className="bg-primary text-white p-4 rounded-t-md flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img 
          src={avatarUrl}
          alt="Avatar" 
          className="w-10 h-10 rounded-full" 
        />
        <div>
          <div className="font-semibold flex items-center gap-1">
            {username} 
            {isAdmin && (
              <Badge variant="success" className="ml-1 text-[10px]">
                Admin
              </Badge>
            )}
            {isBot && (
              <Badge variant="outline" className="ml-1 text-[10px] border-primary-foreground/30">
                Bot
              </Badge>
            )}
          </div>
          <div className="text-xs opacity-80 flex items-center gap-1">
            {countryFlag && <span>{countryFlag} </span>}
            {interests && interests.length > 0 
              ? interests.slice(0, 2).join(', ')
              : 'Chatiwy user'}
          </div>
        </div>
      </div>
      
      <ChatActions 
        username={username}
        isAdmin={isAdmin}
        onBlock={onBlock}
        onReport={onReport}
        onViewHistory={onViewHistory}
        onViewBlocked={onViewBlocked}
      />
    </div>
  );
}
