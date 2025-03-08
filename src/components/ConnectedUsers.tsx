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
  X,
  ShieldCheck
} from 'lucide-react';
import { botProfiles } from '@/utils/botProfiles';
import socketService from '@/services/socketService';
import { countries } from '@/utils/countryData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ConnectedUsersProps {
  userProfile: any;
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
  socketConnected?: boolean;
}

declare global {
  interface Window {
    unreadMessagesPerUser: Set<string>;
  }
}

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
  
  useEffect(() => {
    if (socketConnected) {
      socketService.on('users_update', (users: any[]) => {
        console.log('Received users update:', users);
        // Only include online users and remove offline users immediately
        const onlineUsers = users.filter(user => user.isOnline);
        setRealTimeUsers(onlineUsers);
      });
      
      return () => {
        socketService.off('users_update');
      };
    }
  }, [socketConnected]);
  
  const getConnectedUsers = () => {
    try {
      if (socketConnected && realTimeUsers.length > 0) {
        // Only return users that are not the current user and are online
        const socketUsers = realTimeUsers
          .filter(user => user.id !== userProfile.id && user.isOnline)
          .map(user => ({
            id: user.id,
            username: user.username,
            age: user.age,
            gender: user.gender,
            country: user.country || 'Unknown',
            flag: user.flag || getCountryFlag(user.country),
            isOnline: true,
            isBot: false,
            isVIP: !!user.isVIP,
            avatar: user.avatar || getAvatarUrl(user.username, user.gender)
          }));
        
        const bots = botProfiles.map(bot => ({
          ...bot,
          isBot: false,
          isVIP: false
        }));
        
        return [...socketUsers, ...bots];
      } else {
        const mockUsers = [
          {
            id: "mock-user-1",
            username: "TravelBug",
            age: 28,
            gender: "Female",
            country: "Canada",
            flag: "🇨🇦",
            isOnline: true,
            isBot: false,
            isVIP: true,
            avatar: getAvatarUrl("TravelBug", "Female")
          },
          {
            id: "mock-user-2",
            username: "CoffeeGuy",
            age: 34,
            gender: "Male",
            country: "Italy",
            flag: "🇮🇹",
            isOnline: true,
            isBot: false,
            isVIP: false,
            avatar: getAvatarUrl("CoffeeGuy", "Male")
          }
        ];
        
        const bots = botProfiles.map(bot => ({
          ...bot,
          flag: getCountryFlag(bot.country),
          isBot: false,
          isVIP: false,
          avatar: getAvatarUrl(bot.username, bot.gender)
        }));
        
        return [...mockUsers, ...bots];
      }
    } catch (error) {
      console.error("Error fetching connected users:", error);
      return botProfiles.map(bot => ({
        ...bot,
        flag: getCountryFlag(bot.country),
        isBot: false,
        isVIP: false,
        avatar: getAvatarUrl(bot.username, bot.gender)
      }));
    }
  };
  
  useEffect(() => {
    const countryNames = countries.map(country => country.name);
    setAvailableCountries(countryNames);
  }, []);
  
  useEffect(() => {
    try {
      const allUsers = getConnectedUsers();
      
      let filteredUsers = allUsers;
      
      if (filter !== 'all') {
        filteredUsers = filteredUsers.filter(user => {
          if (filter === 'online') return user.isOnline !== false;
          if (filter === 'male') return user.gender === 'Male';
          if (filter === 'female') return user.gender === 'Female';
          return true;
        });
      }
      
      if (countryFilter.length > 0) {
        filteredUsers = filteredUsers.filter(user => 
          countryFilter.includes(user.country)
        );
      }
      
      filteredUsers = filteredUsers.filter(user => 
        user.age >= ageRange[0] && user.age <= ageRange[1]
      );
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.username.toLowerCase().includes(query) ||
          user.country.toLowerCase().includes(query)
        );
      }
      
      // Sort users by VIP status first, then alphabetically by country
      filteredUsers.sort((a, b) => {
        // VIP users first
        if (a.isVIP && !b.isVIP) return -1;
        if (!a.isVIP && b.isVIP) return 1;
        
        // Then sort by country name alphabetically
        return a.country.localeCompare(b.country);
      });
      
      let realConnectedCount = 0;
      if (socketConnected) {
        realConnectedCount = realTimeUsers.filter(user => 
          user.id !== userProfile.id && 
          user.isOnline
        ).length;
      } else {
        realConnectedCount = 2 + botProfiles.length;
      }
      setConnectedUsersCount(realConnectedCount);
      
      setUsersList(filteredUsers);
    } catch (error) {
      console.error("Error filtering users:", error);
      setUsersList(botProfiles.map(bot => ({
        ...bot,
        flag: getCountryFlag(bot.country),
        isBot: false,
        isVIP: false,
        avatar: getAvatarUrl(bot.username, bot.gender)
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
  
  const getCountryFlag = (countryName?: string): string => {
    if (!countryName || countryName === 'Unknown') return '🌍';
    
    // Find the country in the countries array
    const country = countries.find(c => c.name === countryName);
    return country?.flag || '🌍';
  };

  const getAvatarUrl = (name: string, gender: string): string => {
    // Generate a consistent hash for the name to get the same avatar each time
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Select avatar style based on gender and hash
    const style = gender === 'Male' ? 'male' : 'female';
    const number = Math.abs(hash % 10) + 1; // Numbers 1-10
    
    return `https://api.dicebear.com/7.x/personas/svg?seed=${style}${number}`;
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
              
          {usersList.length > 0 ? (
            usersList.map((user) => {
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
            })
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
