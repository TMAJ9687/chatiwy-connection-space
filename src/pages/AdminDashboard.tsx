import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  X,
  MessageCircle,
  Plus,
  Image,
  Mic,
  Send,
  Paperclip,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import socketService from '@/services/socketService';
import { botProfiles, BotProfile } from '@/utils/botProfiles';

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
  isBot?: boolean;
  isBanned?: boolean;
}

type UserType = 'all' | 'vip' | 'standard' | 'bot' | 'banned';

type MessageType = {
  sender: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'voice';
  content?: string; // URL for images or voice messages
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    onlyOnline: true,
    genders: [] as string[],
    countries: [] as string[],
  });
  const [userTypeFilter, setUserTypeFilter] = useState<UserType>('all');
  const [selectedUser, setSelectedUser] = useState<ConnectedUser | null>(null);
  
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<MessageType[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [botDialogOpen, setBotDialogOpen] = useState(false);
  const [newBot, setNewBot] = useState<Partial<BotProfile>>({
    username: '',
    age: 25,
    gender: 'Female',
    country: 'United States',
    interests: []
  });

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('adminAuthenticated');
    if (!isAdmin) {
      toast.error('Admin authentication required');
      navigate('/admin/login');
      return;
    }

    if (socketService.isConnected()) {
      socketService.on('users_update', (users: any[]) => {
        setConnectedUsers(users);
      });
    } else {
      const mockBots = botProfiles.map(bot => ({
        id: bot.id,
        username: bot.username,
        gender: bot.gender,
        age: bot.age,
        country: bot.country,
        isOnline: bot.isOnline || false,
        interests: bot.interests,
        isBot: true,
        isAdmin: bot.isAdmin,
        isVip: false
      }));
      
      const mockUsers: ConnectedUser[] = [
        {
          id: "user-1",
          username: "Reincarnated",
          gender: "Female",
          age: 26,
          country: "Turkey",
          city: "Istanbul",
          isOnline: true,
          isVip: true,
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
          interests: ["volcano interest", "orange interest"],
          isBanned: true
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
      
      setConnectedUsers([...mockUsers, ...mockBots]);
    }

    return () => {
      if (socketService.isConnected()) {
        socketService.off('users_update');
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    let interval: number | null = null;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

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
    if (searchQuery && !user.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filters.onlyOnline && !user.isOnline) {
      return false;
    }
    
    if (filters.genders.length > 0 && !filters.genders.includes(user.gender)) {
      return false;
    }
    
    if (filters.countries.length > 0 && !filters.countries.includes(user.country)) {
      return false;
    }
    
    switch(userTypeFilter) {
      case 'vip':
        return user.isVip === true;
      case 'standard':
        return !user.isVip && !user.isBot && !user.isBanned && !user.isAdmin;
      case 'bot':
        return user.isBot === true;
      case 'banned':
        return user.isBanned === true;
      default:
        return true;
    }
  });

  const handleUserAction = (action: string, userId: string) => {
    const user = connectedUsers.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'chat':
        setSelectedUser(user);
        setChatHistory([]);
        setChatDialogOpen(true);
        break;
      case 'ban':
        setConnectedUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, isBanned: true } : u
          )
        );
        toast.success(`Banned user: ${user.username}`);
        break;
      case 'unban':
        setConnectedUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, isBanned: false } : u
          )
        );
        toast.success(`Unbanned user: ${user.username}`);
        break;
      case 'kick':
        toast.success(`Kicked user: ${user.username}`);
        break;
      case 'upgrade':
        setConnectedUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, isVip: true } : u
          )
        );
        toast.success(`Upgraded user to VIP: ${user.username}`);
        break;
      case 'view-profile':
        toast.success(`Viewing profile: ${user.username}`);
        break;
      default:
        break;
    }
  };

  const handleSendMessage = () => {
    if ((!chatMessage.trim() && !imagePreview) || !selectedUser) return;
    
    if (chatMessage.trim()) {
      setChatHistory(prev => [
        ...prev, 
        { 
          sender: 'admin', 
          message: chatMessage,
          timestamp: new Date(),
          type: 'text'
        }
      ]);
      
      setChatMessage('');
    }
    
    if (imagePreview) {
      setChatHistory(prev => [
        ...prev, 
        { 
          sender: 'admin', 
          message: 'Sent an image',
          timestamp: new Date(),
          type: 'image',
          content: imagePreview
        }
      ]);
      
      setImagePreview(null);
    }
    
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev, 
        { 
          sender: selectedUser.username, 
          message: `Thanks for reaching out! This is an automated response from ${selectedUser.username}.`,
          timestamp: new Date(),
          type: 'text'
        }
      ]);
    }, 1000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartVoiceRecording = () => {
    setIsRecording(true);
    toast.info('Voice recording started...');
    
    setTimeout(() => {
      if (isRecording) {
        handleStopVoiceRecording();
      }
    }, 10000);
  };

  const handleStopVoiceRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    toast.success('Voice recording completed');
    
    setChatHistory(prev => [
      ...prev, 
      { 
        sender: 'admin', 
        message: 'Voice message',
        timestamp: new Date(),
        type: 'voice',
        content: `Voice recording (${recordingTime}s)`
      }
    ]);
  };

  const handleAddBot = () => {
    if (!newBot.username) {
      toast.error('Bot name is required');
      return;
    }

    const bot: BotProfile = {
      id: `bot-${Date.now()}`,
      username: newBot.username,
      age: newBot.age || 25,
      gender: newBot.gender as 'Male' | 'Female' || 'Female',
      country: newBot.country || 'United States',
      flag: '🇺🇸',
      interests: newBot.interests || [],
      isOnline: true
    };

    setConnectedUsers(prev => [
      ...prev,
      {
        id: bot.id,
        username: bot.username,
        gender: bot.gender,
        age: bot.age,
        country: bot.country,
        isOnline: true,
        isBot: true,
        interests: bot.interests
      }
    ]);

    setNewBot({
      username: '',
      age: 25,
      gender: 'Female',
      country: 'United States',
      interests: []
    });
    setBotDialogOpen(false);
    toast.success(`Bot "${bot.username}" added successfully!`);
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
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => setBotDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Bot
              </Button>
              
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
                  <div className="flex items-center space-x-2">
                    <Select 
                      defaultValue="all"
                      onValueChange={(value) => setUserTypeFilter(value as UserType)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            All Users
                          </div>
                        </SelectItem>
                        <SelectItem value="vip">
                          <div className="flex items-center">
                            <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                            VIP Users
                          </div>
                        </SelectItem>
                        <SelectItem value="standard">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Standard Users
                          </div>
                        </SelectItem>
                        <SelectItem value="bot">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-blue-500" />
                            Bot Users
                          </div>
                        </SelectItem>
                        <SelectItem value="banned">
                          <div className="flex items-center">
                            <Ban className="h-4 w-4 mr-2 text-destructive" />
                            Banned Users
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="px-6 py-4 hover:bg-muted/50 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-full bg-accent flex items-center justify-center overflow-hidden ${user.isAdmin ? 'ring-2 ring-primary' : ''}`}>
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
                            {user.isBot && (
                              <span className="absolute -bottom-1 -right-1">
                                <Badge variant="outline" className="h-4 w-4 flex items-center justify-center p-0 bg-background">
                                  <span className="text-[10px]">BOT</span>
                                </Badge>
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${user.isAdmin ? 'text-primary' : ''} ${user.isVip ? 'text-amber-500' : ''} ${user.isBanned ? 'text-destructive line-through' : ''}`}>
                                {user.username}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {user.gender}, {user.age}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-muted-foreground space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{user.city ? `${user.city}, ` : ''}{user.country}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {user.interests && user.interests.map((interest, idx) => (
                            <Badge key={idx} variant={getInterestBadgeVariant(interest) as any}>
                              {interest}
                            </Badge>
                          ))}
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleUserAction('chat', user.id)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          
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
                              <DropdownMenuItem onClick={() => handleUserAction('chat', user.id)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Message User
                              </DropdownMenuItem>
                              {!user.isVip && !user.isBot && !user.isAdmin && (
                                <DropdownMenuItem onClick={() => handleUserAction('upgrade', user.id)}>
                                  <Crown className="h-4 w-4 mr-2" />
                                  Upgrade to VIP
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {!user.isAdmin && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUserAction('kick', user.id)}>
                                    <X className="h-4 w-4 mr-2" />
                                    Kick User
                                  </DropdownMenuItem>
                                  {!user.isBanned ? (
                                    <DropdownMenuItem onClick={() => handleUserAction('ban', user.id)} className="text-destructive focus:text-destructive">
                                      <Ban className="h-4 w-4 mr-2" />
                                      Ban User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleUserAction('unban', user.id)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Unban User
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
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
      
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chat with {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Direct message as admin
            </DialogDescription>
          </DialogHeader>
          
          <div 
            ref={chatContainerRef}
            className="h-[300px] overflow-y-auto border rounded-md p-4 mb-4"
          >
            {chatHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === 'admin' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      {msg.type === 'text' && <p>{msg.message}</p>}
                      
                      {msg.type === 'image' && msg.content && (
                        <div className="space-y-2">
                          <p className="text-xs opacity-70">Image:</p>
                          <img 
                            src={msg.content} 
                            alt="Shared image" 
                            className="rounded-md max-w-full max-h-48 object-contain"
                          />
                        </div>
                      )}
                      
                      {msg.type === 'voice' && (
                        <div className="flex items-center space-x-2">
                          <Mic className="h-4 w-4" />
                          <span>{msg.content}</span>
                        </div>
                      )}
                      
                      <div className="text-[10px] opacity-70 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {imagePreview && (
            <div className="relative border rounded-md p-2 mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80"
                onClick={() => setImagePreview(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="rounded-md max-h-24 max-w-full mx-auto object-contain"
              />
            </div>
          )}
          
          {isRecording && (
            <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-2">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse mr-2"></div>
                <span>Recording: {recordingTime}s</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleStopVoiceRecording}
              >
                Stop
              </Button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Input 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isRecording}
            />
            
            <div className="flex space-x-1">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording}
              >
                <Image className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={isRecording ? handleStopVoiceRecording : handleStartVoiceRecording}
                className={isRecording ? 'text-destructive' : ''}
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button onClick={handleSendMessage} disabled={(!chatMessage.trim() && !imagePreview) || isRecording}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={botDialogOpen} onOpenChange={setBotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Bot</DialogTitle>
            <DialogDescription>
              Create a new bot user with customized attributes
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="botname" className="text-right">
                Name
              </label>
              <Input
                id="botname"
                value={newBot.username}
                onChange={(e) => setNewBot({...newBot, username: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="botage" className="text-right">
                Age
              </label>
              <Input
                id="botage"
                type="number"
                value={newBot.age}
                onChange={(e) => setNewBot({...newBot, age: Number(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="botgender" className="text-right">
                Gender
              </label>
              <Select 
                value={newBot.gender} 
                onValueChange={(value: 'Male' | 'Female') => setNewBot({...newBot, gender: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="botcountry" className="text-right">
                Country
              </label>
              <Input
                id="botcountry"
                value={newBot.country}
                onChange={(e) => setNewBot({...newBot, country: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="botinterests" className="text-right">
                Interests
              </label>
              <Input
                id="botinterests"
                placeholder="Comma separated interests"
                onChange={(e) => setNewBot({
                  ...newBot, 
                  interests: e.target.value.split(',').map(i => i.trim()).filter(i => i)
                })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBotDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBot}>Add Bot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
