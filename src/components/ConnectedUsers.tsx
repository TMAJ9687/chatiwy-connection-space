
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  X
} from 'lucide-react';
import { botProfiles } from '@/utils/botProfiles';
import socketService from '@/services/socketService';
import { countries } from '@/utils/countryData';

interface ConnectedUsersProps {
  userProfile: any;
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
  socketConnected?: boolean;
}

// Get the mockConnectedUsers from the global scope, used as fallback
declare const mockConnectedUsers: Map<string, any>;

export function ConnectedUsers({ userProfile, selectedUser, onUserSelect, socketConnected = false }: ConnectedUsersProps) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 80]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [connectedUsersCount, setConnectedUsersCount] = useState(0);
  const [realTimeUsers, setRealTimeUsers] = useState<any[]>([]);
  
  // Setup WebSocket listeners for user updates
  useEffect(() => {
    if (socketConnected) {
      // Listen for users list updates
      socketService.on('users_update', (users: any[]) => {
        setRealTimeUsers(users);
      });
      
      return () => {
        socketService.off('users_update');
      };
    }
  }, [socketConnected]);
  
  // Function to get connected users from the socket or mock database
  const getConnectedUsers = () => {
    try {
      if (socketConnected && realTimeUsers.length > 0) {
        // Use real-time users from WebSocket
        const socketUsers = realTimeUsers
          .filter(user => user.id !== socketService.getSocketId()) // Exclude current user
          .map(user => ({
            id: user.id,
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
        
        return [...socketUsers, ...bots];
      } else {
        // Fallback to mock database
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
      }
    } catch (error) {
      console.error("Error fetching connected users:", error);
      // Fallback to just bot profiles if there's an error
      return botProfiles.map(bot => ({
        ...bot,
        isBot: true
      }));
    }
  };
  
  // Effect to gather all available countries from our data
  useEffect(() => {
    // Use the full countries list from our countryData.ts
    const countryNames = countries.map(country => country.name);
    setAvailableCountries(countryNames);
  }, []);
  
  // Effect to update the users list when filter changes
  useEffect(() => {
    try {
      const allUsers = getConnectedUsers();
      
      // Apply filters
      let filteredUsers = allUsers;
      
      // Apply gender filter
      if (filter !== 'all') {
        filteredUsers = filteredUsers.filter(user => {
          if (filter === 'online') return user.isOnline !== false;
          if (filter === 'male') return user.gender === 'Male';
          if (filter === 'female') return user.gender === 'Female';
          return true;
        });
      }
      
      // Apply country filter
      if (countryFilter.length > 0) {
        filteredUsers = filteredUsers.filter(user => 
          countryFilter.includes(user.country)
        );
      }
      
      // Apply age range filter
      filteredUsers = filteredUsers.filter(user => 
        user.age >= ageRange[0] && user.age <= ageRange[1]
      );
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.username.toLowerCase().includes(query) ||
          user.country.toLowerCase().includes(query)
        );
      }
      
      // Count real connected users (excluding bots and excluding the current user)
      let realConnectedCount = 0;
      if (socketConnected) {
        // Count from WebSocket users
        realConnectedCount = realTimeUsers.filter(user => 
          user.id !== socketService.getSocketId() && 
          user.isOnline
        ).length;
      } else {
        try {
          // Count from mock database
          realConnectedCount = Array.from(mockConnectedUsers.entries())
            .filter(([id, user]) => 
              user.sessionId !== userProfile.sessionId && 
              user.isOnline !== false
            ).length;
        } catch (error) {
          console.error("Error counting connected users:", error);
          realConnectedCount = 0;
        }
      }
      setConnectedUsersCount(realConnectedCount);
      
      setUsersList(filteredUsers);
    } catch (error) {
      console.error("Error filtering users:", error);
      setUsersList(botProfiles.map(bot => ({
        ...bot,
        isBot: true
      })));
    }
  }, [filter, searchQuery, userProfile, countryFilter, ageRange, socketConnected, realTimeUsers]);
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleCountryFilter = (country: string) => {
    setCountryFilter(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country) 
        : [...prev, country]
    );
  };
  
  const handleAgeRangeChange = (value: number[]) => {
    setAgeRange([value[0], value[1]]);
  };
  
  const clearFilters = () => {
    setFilter('all');
    setCountryFilter([]);
    setAgeRange([18, 80]);
    setSearchQuery('');
  };
  
  // Helper function to get flag emoji for a country name
  const getCountryFlag = (countryName: string): string => {
    const country = countries.find(c => c.name === countryName);
    return country ? country.flag : '🌍';
  };

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
            {socketConnected && (
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900">Live</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-accent" : ""}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-[60vh] overflow-auto">
                <DropdownMenuLabel>User Filters</DropdownMenuLabel>
                <DropdownMenuSeparator />
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
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Countries</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {availableCountries.map(country => (
                  <DropdownMenuCheckboxItem
                    key={country}
                    checked={countryFilter.includes(country)}
                    onCheckedChange={() => toggleCountryFilter(country)}
                  >
                    <span className="mr-2">{getCountryFlag(country)}</span>
                    {country}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters}>
                  Clear Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
        
        {showFilters && (
          <div className="mt-3 p-3 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Advanced Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">
                  Age Range: {ageRange[0]} - {ageRange[1]}
                </label>
                <div className="pt-2 px-1">
                  <Slider
                    value={[ageRange[0], ageRange[1]]}
                    min={18}
                    max={80}
                    step={1}
                    onValueChange={handleAgeRangeChange}
                  />
                </div>
              </div>
              
              {countryFilter.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Selected Countries:</label>
                  <div className="flex flex-wrap gap-1">
                    {countryFilter.map(country => (
                      <Badge key={country} variant="outline" className="flex items-center gap-1">
                        <span>{getCountryFlag(country)}</span> {country}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1" 
                          onClick={() => toggleCountryFilter(country)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
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
