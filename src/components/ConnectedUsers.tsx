
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Check,
  Ban,
  SlidersHorizontal
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { botProfiles, BotProfile } from '@/utils/botProfiles';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface ConnectedUsersProps {
  userProfile: any;
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
}

// Define an external set so that the blocked users are shared with ChatInterface
const blockedUsers: Set<string> = new Set();

export function ConnectedUsers({ userProfile, selectedUser, onUserSelect }: ConnectedUsersProps) {
  const [users, setUsers] = useState<BotProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [filterError, setFilterError] = useState<string | null>(null);
  
  // Initialize with bot profiles
  useEffect(() => {
    try {
      // Randomize which bots are online
      const randomizedBots = [...botProfiles].map(bot => ({
        ...bot,
        isOnline: Math.random() > 0.3, // 70% chance of being online
        lastActive: bot.isOnline ? 'now' : `${Math.floor(Math.random() * 60) + 1}m ago`
      }));
      
      setUsers(randomizedBots);
      
      // Count online users
      const onlineUsers = randomizedBots.filter(user => user.isOnline && !blockedUsers.has(user.id));
      setOnlineCount(onlineUsers.length);
      
      // Simulate users going online/offline occasionally
      const interval = setInterval(() => {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user => ({
            ...user,
            isOnline: Math.random() > 0.3,
            lastActive: user.isOnline ? 'now' : `${Math.floor(Math.random() * 60) + 1}m ago`
          }));
          
          // Update online count
          const onlineCount = updatedUsers.filter(user => user.isOnline && !blockedUsers.has(user.id)).length;
          setOnlineCount(onlineCount);
          
          return updatedUsers;
        });
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Error initializing users:", error);
      // Fallback to empty array if there's an error
      setUsers([]);
      setOnlineCount(0);
    }
  }, []);

  // Add real user to the list when loaded
  useEffect(() => {
    if (userProfile && userProfile.username) {
      // Check if the user is already in the list
      if (!users.some(u => u.id === userProfile.id)) {
        const currentUser = {
          id: userProfile.id || 'current-user',
          username: userProfile.username,
          age: userProfile.age || 25,
          gender: userProfile.gender || 'Male',
          country: userProfile.country || 'United States',
          flag: userProfile.flag || '🇺🇸',
          interests: userProfile.interests || ['Chat'],
          isOnline: true,
          lastActive: 'now',
          bio: userProfile.bio || 'Currently online'
        };
        
        setUsers(prevUsers => [currentUser, ...prevUsers]);
        setOnlineCount(prevCount => prevCount + 1);
      }
    }
  }, [userProfile, users]);

  // Get unique countries for filter
  const uniqueCountries = Array.from(new Set(botProfiles.map(bot => bot.country)));
  
  // Toggle country selection
  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(country)) {
        return prev.filter(c => c !== country);
      } else {
        // Limit to 3 countries
        if (prev.length >= 3) {
          return [...prev.slice(1), country];
        }
        return [...prev, country];
      }
    });
  };
  
  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    try {
      // Search query filter
      const matchesSearch = 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.interests && user.interests.some(interest => 
          interest.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      
      // Country filter
      const matchesCountry = selectedCountries.length === 0 || selectedCountries.includes(user.country);
      
      // Gender filter
      const matchesGender = !selectedGender || user.gender === selectedGender;
      
      // Age filter
      const matchesAge = user.age >= ageRange[0] && user.age <= ageRange[1];
      
      return matchesSearch && matchesCountry && matchesGender && matchesAge;
    } catch (error) {
      console.error("Error filtering users:", error);
      setFilterError("An error occurred while filtering users. Please try again.");
      return true; // Show all users in case of error
    }
  });
  
  return (
    <div className="rounded-lg border shadow-sm h-[70vh] flex flex-col bg-background">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Connected Users</h2>
          <Badge variant="secondary" className="ml-1">
            {onlineCount} online
          </Badge>
        </div>
        
        <div className="mt-2 relative">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <Popover 
            open={showFilters} 
            onOpenChange={(open) => {
              try {
                setShowFilters(open);
                if (!open) {
                  setFilterError(null); // Clear errors when closing
                }
              } catch (error) {
                console.error("Error toggling filter popover:", error);
                setShowFilters(false);
                setFilterError("An error occurred with filters. Please try again.");
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {(selectedCountries.length > 0 || selectedGender || ageRange[0] !== 18 || ageRange[1] !== 50) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {selectedCountries.length + (selectedGender ? 1 : 0) + (ageRange[0] !== 18 || ageRange[1] !== 50 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 shadow-lg bg-popover">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Countries (Select up to 3)</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {uniqueCountries.map(country => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`country-${country}`} 
                          checked={selectedCountries.includes(country)}
                          onCheckedChange={() => toggleCountry(country)}
                          disabled={selectedCountries.length >= 3 && !selectedCountries.includes(country)}
                        />
                        <label 
                          htmlFor={`country-${country}`}
                          className="text-sm flex items-center cursor-pointer"
                        >
                          <span className="mr-1">
                            {botProfiles.find(bot => bot.country === country)?.flag}
                          </span>
                          {country}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Gender</h3>
                  <Select 
                    value={selectedGender} 
                    onValueChange={setSelectedGender}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All genders</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Age Range</h3>
                    <span className="text-sm text-muted-foreground">
                      {ageRange[0]} - {ageRange[1]}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[18, 50]}
                    min={18}
                    max={50}
                    step={1}
                    value={ageRange}
                    onValueChange={(value) => setAgeRange(value as [number, number])}
                    className="mb-2"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedCountries([]);
                      setSelectedGender('');
                      setAgeRange([18, 50]);
                    }}
                  >
                    Reset
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {(selectedCountries.length > 0 || selectedGender || ageRange[0] !== 18 || ageRange[1] !== 50) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedCountries([]);
                setSelectedGender('');
                setAgeRange([18, 50]);
              }}
            >
              Clear All
            </Button>
          )}
        </div>
        
        {filterError && (
          <div className="mt-2 p-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm rounded-md">
            {filterError}
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isBlocked = blockedUsers.has(user.id);
              
              return (
                <div 
                  key={user.id}
                  className={`p-3 rounded-lg transition-colors cursor-pointer ${
                    selectedUser === user.id 
                      ? 'bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800' 
                      : 'hover:bg-muted border border-transparent'
                  }`}
                  onClick={() => {
                    if (!isBlocked) {
                      onUserSelect(user.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        user.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        {user.username.charAt(0)}
                      </div>
                      {user.isOnline && !isBlocked && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                      )}
                      {isBlocked && (
                        <div className="absolute -top-1 -right-1">
                          <Ban className="h-4 w-4 text-red-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`font-medium truncate ${isBlocked ? 'text-muted-foreground line-through' : ''}`}>
                          {user.username}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.age}
                        </span>
                        <span className="ml-1 text-lg">{user.flag}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1">
                        {user.interests && user.interests.slice(0, 2).map((interest, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs px-1 py-0"
                          >
                            {interest}
                          </Badge>
                        ))}
                        {user.interests && user.interests.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{user.interests.length - 2}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        {isBlocked ? 'blocked' : (user.isOnline ? 'online' : user.lastActive)}
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
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
