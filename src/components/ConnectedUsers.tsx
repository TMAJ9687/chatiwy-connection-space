
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronDown 
} from 'lucide-react';
import { botProfiles } from '@/utils/botProfiles';

interface ConnectedUsersProps {
  userProfile: any;
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
}

// Get the mockConnectedUsers from the global scope
declare const mockConnectedUsers: Map<string, any>;

export function ConnectedUsers({ userProfile, selectedUser, onUserSelect }: ConnectedUsersProps) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // Function to get connected users from the mock database
  const getConnectedUsers = () => {
    try {
      // Create a list of all connected real users (excluding the current user)
      const realUsers = Array.from(mockConnectedUsers.entries())
        .filter(([id, user]) => user.sessionId !== userProfile.sessionId)
        .map(([id, user]) => ({
          id,
          username: user.username,
          age: user.age,
          gender: user.gender,
          country: user.country || 'Unknown',
          flag: user.flag || '🌍',
          isOnline: user.isOnline,
          isBot: false
        }));
      
      // Add bot profiles
      const bots = botProfiles.map(bot => ({
        ...bot,
        isBot: true
      }));
      
      // Combine real users and bots
      return [...realUsers, ...bots];
    } catch (error) {
      console.error("Error fetching connected users:", error);
      return botProfiles.map(bot => ({
        ...bot,
        isBot: true
      }));
    }
  };
  
  // Effect to update the users list when filter changes
  useEffect(() => {
    try {
      const allUsers = getConnectedUsers();
      
      // Apply filters
      let filteredUsers = allUsers;
      
      if (filter !== 'all') {
        filteredUsers = allUsers.filter(user => {
          if (filter === 'online') return user.isOnline !== false;
          if (filter === 'male') return user.gender === 'Male';
          if (filter === 'female') return user.gender === 'Female';
          return true;
        });
      }
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.username.toLowerCase().includes(query) ||
          user.country.toLowerCase().includes(query)
        );
      }
      
      setUsersList(filteredUsers);
    } catch (error) {
      console.error("Error filtering users:", error);
      setUsersList(botProfiles.map(bot => ({
        ...bot,
        isBot: true
      })));
    }
  }, [filter, searchQuery, userProfile]);
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Count real connected users (excluding bots and the current user)
  const connectedUsersCount = (() => {
    try {
      // Count real users except current user
      return Array.from(mockConnectedUsers.entries())
        .filter(([id, user]) => 
          user.sessionId !== userProfile.sessionId && 
          user.isOnline !== false
        ).length;
    } catch (error) {
      console.error("Error counting connected users:", error);
      return 0;
    }
  })();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-medium">Users</CardTitle>
            <Badge variant="secondary" className="ml-1">
              {connectedUsersCount} online
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className={filter === 'all' ? 'bg-accent' : ''}
                  onClick={() => handleFilterChange('all')}
                >
                  All Users
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={filter === 'online' ? 'bg-accent' : ''}
                  onClick={() => handleFilterChange('online')}
                >
                  Online Only
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className={filter === 'male' ? 'bg-accent' : ''}
                  onClick={() => handleFilterChange('male')}
                >
                  Male
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={filter === 'female' ? 'bg-accent' : ''}
                  onClick={() => handleFilterChange('female')}
                >
                  Female
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[calc(70vh-8rem)]">
        <div className="space-y-4">
          {/* Display current user first */}
          <div className="flex items-center gap-3 p-2 rounded-lg border bg-muted/50">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
              userProfile.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
            }`}>
              {userProfile.username.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium truncate">{userProfile.username}</span>
                <span className="text-xs opacity-70">{userProfile.age}</span>
                <span className="ml-1 text-lg">{userProfile.flag || '🌍'}</span>
                <Badge className="ml-auto" variant="outline">You</Badge>
              </div>
              <div className="flex items-center text-sm text-green-500">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                Online
              </div>
            </div>
          </div>
              
          {usersList.length > 0 ? (
            usersList.map((user) => (
              <div 
                key={user.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
                  selectedUser === user.id ? 'bg-accent/70' : ''
                }`}
                onClick={() => onUserSelect(user.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  user.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                }`}>
                  {user.username.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium truncate">{user.username}</span>
                    <span className="text-xs opacity-70">{user.age}</span>
                    <span className="ml-1 text-lg">{user.flag}</span>
                    {user.isBot && (
                      <Badge className="ml-auto" variant="outline">Bot</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-green-500">
                    {user.isOnline !== false && (
                      <>
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                        Online
                      </>
                    )}
                    {user.isOnline === false && (
                      <span className="text-muted-foreground">Offline</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
