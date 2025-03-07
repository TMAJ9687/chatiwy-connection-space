import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Bot, 
  PlusCircle, 
  Edit, 
  Trash, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { botProfiles, BotProfile } from '@/utils/botProfiles';

const AdminBots = () => {
  const [bots, setBots] = useState<BotProfile[]>([]);
  const [addBotDialogOpen, setAddBotDialogOpen] = useState(false);
  const [editBotDialogOpen, setEditBotDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [newBot, setNewBot] = useState<Partial<BotProfile>>({
    username: '',
    age: 25,
    gender: 'Female' as 'Male' | 'Female',
    country: 'United States',
    interests: []
  });
  
  const [selectedBot, setSelectedBot] = useState<BotProfile | null>(null);
  
  useEffect(() => {
    setBots(botProfiles);
  }, []);
  
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
      flag: getCountryFlag(newBot.country || 'United States'),
      interests: newBot.interests || [],
      isOnline: true
    };
    
    setBots(prev => [...prev, bot]);
    
    setNewBot({
      username: '',
      age: 25,
      gender: 'Female' as 'Male' | 'Female',
      country: 'United States',
      interests: []
    });
    
    setAddBotDialogOpen(false);
    toast.success(`Bot "${bot.username}" added successfully!`);
  };
  
  const handleEditBot = () => {
    if (!selectedBot || !selectedBot.id) return;
    
    setBots(prev => 
      prev.map(bot => 
        bot.id === selectedBot.id ? selectedBot : bot
      )
    );
    
    setEditBotDialogOpen(false);
    toast.success(`Bot "${selectedBot.username}" updated successfully!`);
  };
  
  const handleDeleteBot = () => {
    if (!selectedBot) return;
    
    setBots(prev => prev.filter(bot => bot.id !== selectedBot.id));
    setDeleteDialogOpen(false);
    toast.success(`Bot "${selectedBot.username}" deleted successfully!`);
  };
  
  const toggleBotStatus = (botId: string) => {
    setBots(prev => 
      prev.map(bot => 
        bot.id === botId ? { ...bot, isOnline: !bot.isOnline } : bot
      )
    );
    
    const bot = bots.find(b => b.id === botId);
    if (bot) {
      toast.success(`Bot "${bot.username}" ${bot.isOnline ? 'deactivated' : 'activated'}`);
    }
  };
  
  const getCountryFlag = (countryName: string): string => {
    const countryFlags: Record<string, string> = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'Australia': '🇦🇺',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Japan': '🇯🇵',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'Russia': '🇷🇺',
      'South Korea': '🇰🇷',
    };
    
    return countryFlags[countryName] || '🌍';
  };
  
  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Bot Management | Chatiwy</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Bot Management</h1>
            <Button onClick={() => setAddBotDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Bot
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Bot List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bots.map((bot) => (
                    <TableRow key={bot.id}>
                      <TableCell className="font-medium">{bot.username}</TableCell>
                      <TableCell>{bot.age}</TableCell>
                      <TableCell>{bot.gender}</TableCell>
                      <TableCell>
                        {bot.country} {getCountryFlag(bot.country)}
                      </TableCell>
                      <TableCell>
                        {bot.interests && bot.interests.length > 0 
                          ? bot.interests.join(', ') 
                          : 'No interests'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedBot(bot);
                              setEditBotDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleBotStatus(bot.id)}>
                              {bot.isOnline ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2 text-destructive" /> 
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> 
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedBot(bot);
                              setDeleteDialogOpen(true);
                            }} className="text-destructive focus:text-destructive">
                              <Trash className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bots.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        No bots found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Bot Dialog */}
      <Dialog open={addBotDialogOpen} onOpenChange={setAddBotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Bot</DialogTitle>
            <DialogDescription>
              Create a new bot profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                id="name" 
                value={newBot.username || ''}
                onChange={(e) => setNewBot({...newBot, username: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">Age</Label>
              <Input 
                id="age" 
                type="number" 
                value={newBot.age || 25}
                onChange={(e) => setNewBot({...newBot, age: Number(e.target.value)})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">Gender</Label>
              <Select onValueChange={(value) => setNewBot({...newBot, gender: value as 'Male' | 'Female'})}>
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
              <Label htmlFor="country" className="text-right">Country</Label>
              <Input 
                id="country" 
                value={newBot.country || 'United States'}
                onChange={(e) => setNewBot({...newBot, country: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interests" className="text-right">Interests</Label>
              <Textarea
                id="interests"
                placeholder="Comma separated interests"
                value={(newBot.interests || []).join(', ')}
                onChange={(e) => setNewBot({
                  ...newBot, 
                  interests: e.target.value.split(',').map(i => i.trim()).filter(i => i)
                })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddBotDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBot}>Add Bot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Bot Dialog */}
      <Dialog open={editBotDialogOpen} onOpenChange={setEditBotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bot</DialogTitle>
            <DialogDescription>
              Edit the selected bot profile.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBot && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input 
                  id="edit-name" 
                  value={selectedBot.username}
                  onChange={(e) => setSelectedBot({...selectedBot, username: e.target.value})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-age" className="text-right">Age</Label>
                <Input 
                  id="edit-age" 
                  type="number" 
                  value={selectedBot.age}
                  onChange={(e) => setSelectedBot({...selectedBot, age: Number(e.target.value)})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-gender" className="text-right">Gender</Label>
                <Select 
                  value={selectedBot.gender}
                  onValueChange={(value) => setSelectedBot({...selectedBot, gender: value as 'Male' | 'Female'})}
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
                <Label htmlFor="edit-country" className="text-right">Country</Label>
                <Input 
                  id="edit-country" 
                  value={selectedBot.country}
                  onChange={(e) => setSelectedBot({...selectedBot, country: e.target.value})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-interests" className="text-right">Interests</Label>
                <Textarea
                  id="edit-interests"
                  placeholder="Comma separated interests"
                  value={selectedBot.interests ? selectedBot.interests.join(', ') : ''}
                  onChange={(e) => setSelectedBot({
                    ...selectedBot, 
                    interests: e.target.value.split(',').map(i => i.trim()).filter(i => i)
                  })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditBotDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditBot}>Update Bot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Bot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteBot}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBots;
