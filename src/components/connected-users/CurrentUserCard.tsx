
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CurrentUserCardProps {
  userProfile: any;
  getCountryFlag: (countryName?: string) => string;
  getAvatarUrl: (name: string, gender: string) => string;
}

export function CurrentUserCard({ 
  userProfile, 
  getCountryFlag, 
  getAvatarUrl 
}: CurrentUserCardProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-muted/50">
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <Avatar>
          <AvatarImage 
            src={userProfile.avatar || getAvatarUrl(userProfile.username, userProfile.gender)} 
            alt={userProfile.username}
          />
          <AvatarFallback>{userProfile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-medium truncate">{userProfile.username}</span>
          <span className="text-xs opacity-70">{userProfile.age}</span>
          <span className="ml-1 text-lg">{userProfile.flag || getCountryFlag(userProfile.country)}</span>
          {userProfile.isVIP && (
            <Badge variant="default" className="ml-1 bg-amber-500 text-white">VIP</Badge>
          )}
          <Badge className="ml-auto" variant="outline">You</Badge>
        </div>
        <div className="flex items-center text-sm text-green-500">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
          <span>Online</span>
        </div>
      </div>
    </div>
  );
}
