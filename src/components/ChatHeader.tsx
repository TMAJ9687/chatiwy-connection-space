
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatActions } from '@/components/ChatActions';
import { Crown } from 'lucide-react';

interface ChatHeaderProps {
  username: string;
  isAdmin?: boolean;
  isBot?: boolean;
  isVIP?: boolean;
  avatarUrl: string;
  countryFlag?: string;
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
  isVIP = false,
  avatarUrl,
  countryFlag,
  interests,
  onBlock,
  onReport,
  onViewHistory,
  onViewBlocked
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{username}</span>
            {countryFlag && <span className="text-lg">{countryFlag}</span>}
            
            {isAdmin && (
              <Badge variant="outline" className="bg-blue-500/20 text-white border-blue-400">
                Admin
              </Badge>
            )}
            
            {isVIP && (
              <Badge variant="outline" className="bg-amber-500/20 text-white border-amber-400">
                <Crown className="h-3 w-3 mr-1" />
                VIP
              </Badge>
            )}
          </div>
          
          {interests && interests.length > 0 && (
            <div className="text-sm opacity-80 mt-0.5">
              {interests.join(', ')}
            </div>
          )}
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
