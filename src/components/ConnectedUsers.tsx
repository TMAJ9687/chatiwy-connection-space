
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  UserPlus, 
  UserX,
  MessageSquare, 
  Check 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { botProfiles, BotProfile } from '@/utils/botProfiles';

interface ConnectedUsersProps {
  userProfile: any;
}

export function ConnectedUsers({ userProfile }: ConnectedUsersProps) {
  const [users, setUsers] = useState<BotProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Initialize with bot profiles
  useEffect(() => {
    // Randomize which bots are online
    const randomizedBots = [...botProfiles].map(bot => ({
      ...bot,
      isOnline: Math.random() > 0.3, // 70% chance of being online
      lastActive: bot.isOnline ? 'now' : `${Math.floor(Math.random() * 60) + 1}m ago`
    }));
    
    setUsers(randomizedBots);
    
    // Simulate users going online/offline occasionally
    const interval = setInterval(() => {
      setUsers(prevUsers => 
        prevUsers.map(user => ({
          ...user,
          isOnline: Math.random() > 0.3,
          lastActive: user.isOnline ? 'now' : `${Math.floor(Math.random() * 60) + 1}m ago`
        }))
      );
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.interests.some(interest => 
      interest.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    // In a real app, this would trigger the chat to load with this user
  };
  
  return (
    <div className="rounded-lg border shadow-sm h-[70vh] flex flex-col bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Connected Users</h2>
        <div className="mt-2 relative">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div 
                key={user.id}
                className={`p-3 rounded-lg transition-colors cursor-pointer ${
                  selectedUser === user.id 
                    ? 'bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800' 
                    : 'hover:bg-muted border border-transparent'
                }`}
                onClick={() => handleUserSelect(user.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      user.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                    }`}>
                      {user.username.charAt(0)}
                    </div>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium truncate">
                        {user.username}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {user.age}
                      </span>
                      <span className="ml-1">{user.flag}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      {user.interests.slice(0, 2).map((interest, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs px-1 py-0"
                        >
                          {interest}
                        </Badge>
                      ))}
                      {user.interests.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{user.interests.length - 2}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">
                      {user.isOnline ? 'online' : user.lastActive}
                    </span>
                    <div className="mt-1">
                      {selectedUser === user.id ? (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
