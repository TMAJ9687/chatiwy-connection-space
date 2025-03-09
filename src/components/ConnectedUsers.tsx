
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { countries } from '@/utils/countryData';
import socketService from '@/services/socketService';
import { CurrentUserCard } from './connected-users/CurrentUserCard';
import { SearchBar } from './connected-users/SearchBar';
import { FiltersPanel } from './connected-users/FiltersPanel';
import { UsersCardHeader } from './connected-users/CardHeader';
import { UsersList } from './connected-users/UsersList';
import { 
  getConnectedUsers, 
  getCountryFlag, 
  getAvatarUrl,
  fetchCountryFlag 
} from './connected-users/utils';
import './connected-users/types';

interface ConnectedUsersProps {
  userProfile: any;
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
  socketConnected?: boolean;
}

if (!window.unreadMessagesPerUser) {
  window.unreadMessagesPerUser = new Set<string>();
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
  const [countryFlags, setCountryFlags] = useState<Record<string, string>>({});
  
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
  
  // Pre-fetch flags for commonly used countries
  useEffect(() => {
    const commonCountries = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'JP', 'IN', 'BR'];
    
    const fetchFlags = async () => {
      const flags: Record<string, string> = {};
      
      for (const code of commonCountries) {
        try {
          const flagUrl = await fetchCountryFlag(code);
          if (flagUrl) {
            flags[code] = flagUrl;
          }
        } catch (error) {
          console.error(`Error fetching flag for ${code}:`, error);
        }
      }
      
      setCountryFlags(flags);
    };
    
    fetchFlags();
  }, []);
  
  useEffect(() => {
    const countryNames = countries.map(country => country.name);
    setAvailableCountries(countryNames);
  }, []);
  
  useEffect(() => {
    try {
      const allUsers = getConnectedUsers(userProfile, socketConnected, realTimeUsers);
      
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
          user.username?.toLowerCase().includes(query) ||
          user.country?.toLowerCase().includes(query)
        );
      }
      
      // Sort users by VIP status first, then alphabetically by country
      filteredUsers.sort((a, b) => {
        // VIP users first
        if (a.isVIP && !b.isVIP) return -1;
        if (!a.isVIP && b.isVIP) return 1;
        
        // Then sort by country name alphabetically
        return (a.country || '').localeCompare(b.country || '');
      });
      
      let realConnectedCount = 0;
      if (socketConnected) {
        realConnectedCount = realTimeUsers.filter(user => 
          user.id !== userProfile?.id && 
          user.isOnline
        ).length;
      } else {
        realConnectedCount = 2 + allUsers.filter(user => user.isBot).length;
      }
      setConnectedUsersCount(realConnectedCount);
      
      setUsersList(filteredUsers);
    } catch (error) {
      console.error("Error filtering users:", error);
      setUsersList([]);
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

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <UsersCardHeader 
          connectedUsersCount={connectedUsersCount}
          socketConnected={socketConnected}
          showFilters={showFilters}
          filter={filter}
          countryFilter={countryFilter}
          availableCountries={availableCountries}
          onFilterChange={handleFilterChange}
          toggleCountryFilter={toggleCountryFilter}
          clearFilters={clearFilters}
          getCountryFlag={getCountryFlag}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
        
        <SearchBar 
          searchQuery={searchQuery} 
          onChange={handleSearch} 
        />
        
        {showFilters && (
          <FiltersPanel
            ageRange={ageRange}
            countryFilter={countryFilter}
            getCountryFlag={getCountryFlag}
            onAgeRangeChange={handleAgeRangeChange}
            toggleCountryFilter={toggleCountryFilter}
            clearFilters={clearFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </CardHeader>
      <CardContent className="overflow-auto max-h-[calc(70vh-8rem)]">
        <div className="space-y-4">
          <CurrentUserCard 
            userProfile={userProfile} 
            getCountryFlag={getCountryFlag} 
            getAvatarUrl={getAvatarUrl} 
          />
              
          <UsersList 
            usersList={usersList}
            selectedUser={selectedUser}
            onUserSelect={onUserSelect}
            getCountryFlag={getCountryFlag}
            getAvatarUrl={getAvatarUrl}
          />
        </div>
      </CardContent>
    </Card>
  );
}
