
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Plus, Edit, Trash, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { botProfiles, BotProfile } from '@/utils/botProfiles';

const AdminBots = () => {
  const navigate = useNavigate();
  const [bots, setBots] = useState<BotProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [botDialogOpen, setBotDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBot, setCurrentBot] = useState<Partial<BotProfile>>({
    id: '',
    username: '',
    age: 25,
    gender: 'Female',
    country: 'United States',
    interests: []
  });

  useEffect(() => {
    // Check admin authentication
    const isAdmin = sessionStorage.getItem('adminAuthenticated');
    if (!isAdmin) {
      toast.error('Admin authentication required');
      navigate('/admin/login');
      return;
    }

    // Load bots from the botProfiles utility
    setBots(botProfiles);
  }, [navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredBots = bots.filter(bot => 
    bot.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBot = () => {
    if (!currentBot.username) {
      toast.error('Bot name is required');
      return;
    }

    if (editMode) {
      // Update existing bot
      setBots(prev => prev.map(bot => 
        bot.id === currentBot.id 
          ? { ...bot, ...currentBot } as BotProfile
          : bot
      ));
      toast.success(`Bot "${currentBot.username}" updated successfully!`);
    } else {
      // Create a new bot
      const newBot: BotProfile = {
        id: `bot-${Date.now()}`,
        username: currentBot.username as string,
        age: currentBot.age || 25,
        gender: (currentBot.gender as 'Male' | 'Female') || 'Female',
        country: currentBot.country as string || 'United States',
        flag: '🇺🇸',
        interests: currentBot.interests || [],
        isOnline: true
      };

      setBots(prev => [...prev, newBot]);
      toast.success(`Bot "${newBot.username}" added successfully!`);
    }

    // Reset form and close dialog
    resetForm();
  };

  const handleEditBot = (bot: BotProfile) => {
    setCurrentBot({...bot});
    setEditMode(true);
    setBotDialogOpen(true);
  };

  const handleDeleteBot = (botId: string) => {
    setBots(prev => prev.filter(bot => bot.id !== botId));
    toast.success('Bot deleted successfully!');
  };

  const resetForm = () => {
    setCurrentBot({
      id: '',
      username: '',
      age: 25,
      gender: 'Female',
      country: 'United States',
      interests: []
    });
    setEditMode(false);
    setBotDialogOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Bot Management | Admin Dashboard</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Bot Management</h1>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => {
                  resetForm();
                  setBotDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Bot
              </Button>
              
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search bots..."
                  className="pl-10 w-60"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Bot Users</CardTitle>
              <CardDescription>
                Manage bot users that interact with your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBots.length > 0 ? (
                <div className="space-y-4">
                  {filteredBots.map((bot) => (
                    <div key={bot.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                            <img 
                              src={`https://api.dicebear.com/7.x/personas/svg?seed=${bot.username}`} 
                              alt={bot.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div>
                            <h3 className="font-medium">{bot.username}</h3>
                            <div className="text-sm text-muted-foreground">
                              {bot.gender}, {bot.age} • {bot.country} {bot.flag}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditBot(bot)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteBot(bot.id)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <div className="text-sm font-medium mb-2">Interests:</div>
                        <div className="flex flex-wrap gap-2">
                          {bot.interests.map((interest, idx) => (
                            <div key={idx} className="bg-muted px-2 py-1 rounded-md text-xs">
                              {interest}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No bots found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No bots match your search query" 
                      : "You haven't added any bots yet"}
                  </p>
                  {!searchQuery && (
                    <Button 
                      className="mt-4"
                      onClick={() => setBotDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Bot
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add/Edit Bot Dialog */}
      <Dialog open={botDialogOpen} onOpenChange={setBotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Bot' : 'Add New Bot'}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Update the bot details to change its behavior' 
                : 'Create a new bot user with customized attributes'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="botname" className="text-right">
                Name
              </label>
              <Input
                id="botname"
                value={currentBot.username}
                onChange={(e) => setCurrentBot({...currentBot, username: e.target.value})}
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
                value={currentBot.age}
                onChange={(e) => setCurrentBot({...currentBot, age: Number(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="botgender" className="text-right">
                Gender
              </label>
              <Select 
                value={currentBot.gender} 
                onValueChange={(value) => setCurrentBot({...currentBot, gender: value})}
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
                value={currentBot.country}
                onChange={(e) => setCurrentBot({...currentBot, country: e.target.value})}
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
                value={currentBot.interests?.join(', ')}
                onChange={(e) => setCurrentBot({
                  ...currentBot, 
                  interests: e.target.value.split(',').map(i => i.trim()).filter(i => i)
                })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleAddBot}>{editMode ? 'Save Changes' : 'Add Bot'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBots;
