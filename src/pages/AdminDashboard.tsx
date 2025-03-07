
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  User,
  Shield,
  Calendar,
  MapPin,
  Ban,
  Crown,
  Eye,
  EyeOff,
  MoreHorizontal,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import socketService from '@/services/socketService';

interface ConnectedUser {
  id: string;
  username: string;
  gender: string;
  age: number;
  country: string;
  city?: string;
  isOnline?: boolean;
  isAdmin?: boolean;
  isVip?: boolean;
  interests?: string[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    onlyOnline: true,
    genders: [] as string[],
    countries: [] as string[],
  });

  useEffect(() => {
    // Check admin authentication
    const isAdmin = sessionStorage.getItem('adminAuthenticated');
    if (!isAdmin) {
      toast.error('Admin authentication required');
      navigate('/admin/login');
      return;
    }

    // Get connected users
    if (socketService.isConnected()) {
      // Get users from socket service
      socketService.on('users_update', (users: any[]) => {
        setConnectedUsers(users);
      });
    } else {
      // Mock data for development
      const mockUsers: ConnectedUser[] = [
        {
          id: "user-1",
          username: "Reincarnated",
          gender: "Female",
          age: 26,
          country: "Turkey",
          city: "Istanbul",
          isOnline: true,
          interests: ["cyan interest", "gold interest"]
        },
        {
          id: "user-2",
          username: "Shinhoff",
          gender: "Male",
          age: 32,
          country: "Turkey",
          city: "Istanbul",
          isOnline: true,
          interests: ["volcano", "gold interest", "lime interest"]
        },
        {
          id: "user-3",
          username: "Naisees",
          gender: "Male",
          age: 32,
          country: "Turkey",
          city: "Istanbul",
          isOnline: true,
          interests: ["green", "orange", "lime interest"]
        },
        {
          id: "user-4",
          username: "Moreor",
          gender: "Male",
          age: 32,
          country: "Turkey",
          city: "Istanbul",
          isOnline: true,
          interests: ["volcano interest", "orange interest"]
        },
        {
          id: "user-5",
          username: "Silky",
          gender: "Male",
          age: 32,
          country: "Turkey",
          city: "Istanbul",
          isOnline: true,
          interests: ["volcano", "gold interest", "lime interest"]
        },
        {
          id: "user-6",
          username: "Mason",
          gender: "Male",
          age: 32,
          country: "Turkey",
          city: "Istanbul",
          isOnline: true,
          interests: ["volcano interest", "orange interest"]
        },
        {
          id: "user-7",
          username: "Jason",
          gender: "Male",
          age: 32,
          country: "Turkey",
          city: "Istanbul",
          isOnline: true,
          interests: ["volcano", "gold interest", "lime interest"]
        },
        {
          id: "user-8",
          username: "Ludacris",
          gender: "Male",
          age: 32,
          country: "Turkey",
          city: "Istanbul",
          isOnline: true,
          interests: ["volcano interest", "orange interest"]
        }
      ];
      setConnectedUsers(mockUsers);
    }

    // Cleanup
    return () => {
      if (socketService.isConnected()) {
        socketService.off('users_update');
      }
    };
  }, [navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getInterestBadgeVariant = (interest: string) => {
    const interestMap: Record<string, string> = {
      'gold': 'warning',
      'gold interest': 'warning',
      'volcano': 'destructive',
      'volcano interest': 'destructive',
      'lime': 'success',
      'lime interest': 'success',
      'green': 'success',
      'cyan': 'info',
      'cyan interest': 'info',
      'orange': 'warning',
      'orange interest': 'warning',
    };
    
    return interestMap[interest.toLowerCase()] || 'secondary';
  };

  const filteredUsers = connectedUsers.filter(user => {
    // Apply search filter
    if (searchQuery && !user.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply online filter
    if (filters.onlyOnline && !user.isOnline) {
      return false;
    }
    
    // Apply gender filter
    if (filters.genders.length > 0 && !filters.genders.includes(user.gender)) {
      return false;
    }
    
    // Apply country filter
    if (filters.countries.length > 0 && !filters.countries.includes(user.country)) {
      return false;
    }
    
    return true;
  });

  const handleUserAction = (action: string, userId: string) => {
    const user = connectedUsers.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'ban':
        toast.success(`Banned user: ${user.username}`);
        break;
      case 'kick':
        toast.success(`Kicked user: ${user.username}`);
        break;
      case 'upgrade':
        toast.success(`Upgraded user to VIP: ${user.username}`);
        break;
      case 'message':
        toast.success(`Messaging user: ${user.username}`);
        break;
      case 'view-profile':
        toast.success(`Viewing profile: ${user.username}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Admin Dashboard | Chatiwy</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-60"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter Users</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilters({ ...filters, onlyOnline: !filters.onlyOnline })}
                  >
                    {filters.onlyOnline ? '✓ ' : ''}Only Online Users
                  </DropdownMenuItem>
                  <DropdownMenuLabel>Gender</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      const newGenders = filters.genders.includes('Male')
                        ? filters.genders.filter(g => g !== 'Male')
                        : [...filters.genders, 'Male'];
                      setFilters({ ...filters, genders: newGenders });
                    }}
                  >
                    {filters.genders.includes('Male') ? '✓ ' : ''}Male
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const newGenders = filters.genders.includes('Female')
                        ? filters.genders.filter(g => g !== 'Female')
                        : [...filters.genders, 'Female'];
                      setFilters({ ...filters, genders: newGenders });
                    }}
                  >
                    {filters.genders.includes('Female') ? '✓ ' : ''}Female
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilters({
                      onlyOnline: true,
                      genders: [],
                      countries: []
                    })}
                  >
                    Reset Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="flex justify-between items-center px-6 py-3 bg-muted/50">
                  <div className="font-medium">People <Badge variant="outline">{filteredUsers.length}</Badge></div>
                  <div>
                    <Button variant="outline" size="sm">Filters</Button>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="px-6 py-4 hover:bg-muted/50 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                              <img 
                                src={`https://api.dicebear.com/7.x/personas/svg?seed=${user.username}`} 
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {user.isVip && (
                              <span className="absolute -top-1 -right-1">
                                <Crown className="h-4 w-4 text-yellow-500" />
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{user.username}</span>
                              <span className="text-sm text-muted-foreground">
                                {user.gender}, {user.age}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-muted-foreground space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{user.city}, {user.country}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {user.interests && user.interests.map((interest, idx) => (
                            <Badge key={idx} variant={getInterestBadgeVariant(interest) as any}>
                              {interest}
                            </Badge>
                          ))}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUserAction('view-profile', user.id)}>
                                <User className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction('message', user.id)}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Message User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUserAction('upgrade', user.id)}>
                                <Crown className="h-4 w-4 mr-2" />
                                Upgrade to VIP
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUserAction('kick', user.id)}>
                                <X className="h-4 w-4 mr-2" />
                                Kick User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction('ban', user.id)} className="text-destructive focus:text-destructive">
                                <Ban className="h-4 w-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg">No users found</h3>
                      <p className="text-muted-foreground">Try changing your search or filters</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
