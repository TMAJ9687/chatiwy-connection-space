
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Bot, 
  Search, 
  Edit, 
  Trash, 
  PlusCircle, 
  List, 
  Shield, 
  Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { botProfiles, BotProfile } from '@/utils/botProfiles';

const AdminBots = () => {
  const [bots, setBots] = useState<BotProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBot, setSelectedBot] = useState<BotProfile | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    onlyOnline: false,
    genders: [] as string[],
    countries: [] as string[],
  });
  
  const [newBot, setNewBot] = useState<Partial<BotProfile>>({
    username: '',
    age: 25,
    gender: 'Female',
    country: 'United States',
    flag: '🇺🇸',
    interests: []
  });

  useEffect(() => {
    // Load bots from botProfiles utility
    setBots(botProfiles.filter(bot => bot.id !== 'admin-1'));
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredBots = bots.filter(bot => {
    if (searchQuery && !bot.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filters.onlyOnline && !bot.isOnline) {
      return false;
    }
    
    if (filters.genders.length > 0 && !filters.genders.includes(bot.gender)) {
      return false;
    }
    
    if (filters.countries.length > 0 && !filters.countries.includes(bot.country)) {
      return false;
    }
    
    return true;
  });

  const handleAddBot = () => {
    if (!newBot.username) {
      toast.error('Bot name is required');
      return;
    }

    const bot: BotProfile = {
      id: `bot-${Date.now()}`,
      username: newBot.username || '',
      age: newBot.age || 25,
      gender: newBot.gender as 'Male' | 'Female',
      country: newBot.country || 'United States',
      flag: newBot.flag || '🇺🇸',
      interests: newBot.interests || [],
      isOnline: true
    };

    setBots(prev => [...prev, bot]);
    setNewBot({
      username: '',
      age: 25,
      gender: 'Female',
      country: 'United States',
      flag: '🇺🇸',
      interests: []
    });
    setIsAddDialogOpen(false);
    toast.success(`Bot "${bot.username}" added successfully!`);
  };

  const handleEditBot = () => {
    if (!selectedBot || !selectedBot.username) {
      toast.error('Bot name is required');
      return;
    }

    setBots(prev => prev.map(bot => 
      bot.id === selectedBot.id ? selectedBot : bot
    ));
    
    setIsEditDialogOpen(false);
    toast.success(`Bot "${selectedBot.username}" updated successfully!`);
  };

  const handleDeleteBot = (botId: string) => {
    const botToDelete = bots.find(bot => bot.id === botId);
    if (!botToDelete) return;

    setBots(prev => prev.filter(bot => bot.id !== botId));
    toast.success(`Bot "${botToDelete.username}" deleted successfully!`);
  };

  const handleBotAction = (action: string, botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;

    switch (action) {
      case 'edit':
        setSelectedBot(bot);
        setIsEditDialogOpen(true);
        break;
      case 'delete':
        handleDeleteBot(botId);
        break;
      case 'toggle-status':
        setBots(prev => prev.map(b => 
          b.id === botId ? { ...b, isOnline: !b.isOnline } : b
        ));
        toast.success(`Bot "${bot.username}" is now ${!bot.isOnline ? 'online' : 'offline'}`);
        break;
      default:
        break;
    }
  };

  const handleFieldChange = (field: keyof BotProfile, value: string | number | string[]) => {
    if (selectedBot) {
      setSelectedBot({
        ...selectedBot,
        [field]: value
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Bot Management | Chatiwy Admin</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Bot Management</h1>
          
          <div className="flex justify-between items-center mb-6">
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Bot
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search bots..."
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
                  <DropdownMenuLabel>Filter Bots</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilters({ ...filters, onlyOnline: !filters.onlyOnline })}
                  >
                    {filters.onlyOnline ? '✓ ' : ''}Only Online Bots
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
                      onlyOnline: false,
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
            <CardHeader>
              <CardTitle>Manage Bots</CardTitle>
              <CardDescription>
                Create, edit and delete bot profiles that interact with users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBots.length > 0 ? (
                <div className="divide-y">
                  {filteredBots.map((bot) => (
                    <div key={bot.id} className="py-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${bot.isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <img 
                              src={`https://api.dicebear.com/7.x/personas/svg?seed=${bot.username}`} 
                              alt={bot.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${bot.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                        
                        <div>
                          <div className="font-medium">
                            {bot.username}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {bot.gender}, {bot.age}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{bot.flag} {bot.country}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {bot.interests && bot.interests.map((interest, idx) => (
                          <Badge key={idx} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <List className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleBotAction('edit', bot.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Bot
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBotAction('toggle-status', bot.id)}>
                              <Shield className="h-4 w-4 mr-2" />
                              {bot.isOnline ? 'Set Offline' : 'Set Online'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleBotAction('delete', bot.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Bot
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No bots found</h3>
                  <p className="text-muted-foreground">Try changing your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Bot Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                value={newBot.gender as string} 
                onValueChange={(value) => setNewBot({...newBot, gender: value as 'Male' | 'Female'})}
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
              <label htmlFor="botflag" className="text-right">
                Flag
              </label>
              <Input
                id="botflag"
                value={newBot.flag}
                onChange={(e) => setNewBot({...newBot, flag: e.target.value})}
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
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBot}>Add Bot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Bot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bot</DialogTitle>
            <DialogDescription>
              Update bot attributes and settings
            </DialogDescription>
          </DialogHeader>
          
          {selectedBot && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editbotname" className="text-right">
                  Name
                </label>
                <Input
                  id="editbotname"
                  value={selectedBot.username}
                  onChange={(e) => handleFieldChange('username', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editbotage" className="text-right">
                  Age
                </label>
                <Input
                  id="editbotage"
                  type="number"
                  value={selectedBot.age}
                  onChange={(e) => handleFieldChange('age', Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editbotgender" className="text-right">
                  Gender
                </label>
                <Select 
                  value={selectedBot.gender} 
                  onValueChange={(value) => handleFieldChange('gender', value as 'Male' | 'Female')}
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
                <label htmlFor="editbotcountry" className="text-right">
                  Country
                </label>
                <Input
                  id="editbotcountry"
                  value={selectedBot.country}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editbotflag" className="text-right">
                  Flag
                </label>
                <Input
                  id="editbotflag"
                  value={selectedBot.flag}
                  onChange={(e) => handleFieldChange('flag', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editbotinterests" className="text-right">
                  Interests
                </label>
                <Input
                  id="editbotinterests"
                  placeholder="Comma separated interests"
                  value={selectedBot.interests.join(', ')}
                  onChange={(e) => handleFieldChange(
                    'interests', 
                    e.target.value.split(',').map(i => i.trim()).filter(i => i)
                  )}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditBot}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBots;
