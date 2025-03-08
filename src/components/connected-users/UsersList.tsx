
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ShieldCheck } from 'lucide-react';

interface UsersListProps {
  usersList: any[];
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
  getCountryFlag: (countryName?: string) => string;
  getAvatarUrl: (name: string, gender: string) => string;
}

export function UsersList({ 
  usersList, 
  selectedUser, 
  onUserSelect, 
  getCountryFlag,
  getAvatarUrl
}: UsersListProps) {
  if (usersList.length === 0) {
    return (
      <div className="py-8 text-center">
        <User className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {usersList.map((user) => {
        const hasUnread = window.unreadMessagesPerUser?.has(user.id);
        
        return (
          <div 
            key={user.id}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
              selectedUser === user.id ? 'bg-accent/70' : ''
            } ${hasUnread ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800' : ''}`}
            onClick={() => onUserSelect(user.id)}
          >
            <div className={`w-10 h-10 rounded-full overflow-hidden ${hasUnread ? 'ring-2 ring-teal-400' : ''}`}>
              <Avatar>
                <AvatarImage 
                  src={user.avatar || getAvatarUrl(user.username, user.gender)} 
                  alt={user.username}
                />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className={`font-medium truncate ${hasUnread ? 'font-bold' : ''}`}>{user.username}</span>
                <span className="text-xs opacity-70">{user.age}</span>
                <span className="ml-1 text-lg">{user.flag || getCountryFlag(user.country)}</span>
                
                {user.isVIP && (
                  <Badge variant="default" className="ml-1 bg-amber-500 text-white">
                    <ShieldCheck className="h-3 w-3 mr-1" />VIP
                  </Badge>
                )}
                
                {hasUnread && (
                  <Badge className="ml-auto" variant="default">New</Badge>
                )}
              </div>
              <div className="flex items-center text-sm">
                {user.isOnline !== false ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                    <span className="text-muted-foreground truncate">
                      {user.interests && user.interests.length > 0 
                        ? user.interests.slice(0, 2).join(', ')
                        : 'Chatiwy user'}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Offline</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
