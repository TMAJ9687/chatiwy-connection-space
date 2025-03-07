
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  Trash, 
  Ban,
  Calendar,
  Filter,
  Wifi,
  Plus,
  User,
  AlertCircle,
  Shield
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
import { format } from 'date-fns';

interface BannedIP {
  id: string;
  ipAddress: string;
  userId: string;
  username: string;
  reason: string;
  timestamp: Date;
  bannedBy: string;
  expiresAt: Date | null;
}

const MOCK_BANNED_IPS: BannedIP[] = [
  {
    id: 'ban-1',
    ipAddress: '192.168.1.101',
    userId: 'user-4',
    username: 'Moreor',
    reason: 'Inappropriate content',
    timestamp: new Date(Date.now() - 86400000 * 1), // 1 day ago
    bannedBy: 'Admin',
    expiresAt: new Date(Date.now() + 86400000 * 30), // 30 days from now
  },
  {
    id: 'ban-2',
    ipAddress: '192.168.1.102',
    userId: 'user-5',
    username: 'Silky',
    reason: 'Repeated harassment',
    timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
    bannedBy: 'Admin',
    expiresAt: null, // permanent ban
  },
  {
    id: 'ban-3',
    ipAddress: '192.168.1.103',
    userId: 'user-8',
    username: 'Ludacris',
    reason: 'Spam',
    timestamp: new Date(Date.now() - 86400000 * 0.5), // 12 hours ago
    bannedBy: 'Admin',
    expiresAt: new Date(Date.now() + 86400000 * 7), // 7 days from now
  },
];

const AdminBannedIPs = () => {
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addBanDialogOpen, setAddBanDialogOpen] = useState(false);
  const [newBan, setNewBan] = useState({
    ipAddress: '',
    userId: '',
    username: '',
    reason: '',
    permanent: false
  });

  useEffect(() => {
    // Load banned IPs - in a real app, this would fetch from an API
    setBannedIPs(MOCK_BANNED_IPS);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredBannedIPs = bannedIPs.filter(ban => {
    if (searchQuery && 
        !ban.ipAddress.includes(searchQuery) &&
        !ban.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleUnban = (banId: string) => {
    setBannedIPs(prev => prev.filter(ban => ban.id !== banId));
    toast.success('IP address unbanned successfully');
  };

  const handleAddBan = () => {
    if (!newBan.ipAddress || !newBan.username || !newBan.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const newBanEntry: BannedIP = {
      id: `ban-${Date.now()}`,
      ipAddress: newBan.ipAddress,
      userId: `user-${Date.now()}`,
      username: newBan.username,
      reason: newBan.reason,
      timestamp: new Date(),
      bannedBy: 'Admin',
      expiresAt: newBan.permanent ? null : new Date(Date.now() + 86400000 * 30)
    };
    
    setBannedIPs(prev => [...prev, newBanEntry]);
    setAddBanDialogOpen(false);
    setNewBan({
      ipAddress: '',
      userId: '',
      username: '',
      reason: '',
      permanent: false
    });
    
    toast.success(`IP ${newBan.ipAddress} banned successfully`);
  };

  const formatBanExpiration = (expiresAt: Date | null) => {
    if (!expiresAt) return 'Permanent';
    
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) return 'Expired';
    return `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Banned IPs | Chatiwy Admin</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Banned IP Addresses</h1>
          
          <div className="flex justify-between items-center mb-6">
            <div className="text-muted-foreground">
              Manage banned IP addresses
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => setAddBanDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Ban
              </Button>
              
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by IP or username..."
                  className="pl-10 w-60"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Banned IP Addresses</CardTitle>
              <CardDescription>
                View and manage banned IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBannedIPs.length > 0 ? (
                <div className="divide-y">
                  {filteredBannedIPs.map((ban) => (
                    <div key={ban.id} className="py-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Ban className="h-8 w-8 text-destructive" />
                        </div>
                        
                        <div>
                          <div className="font-medium flex items-center">
                            <span>IP: {ban.ipAddress}</span>
                            <Badge 
                              variant={ban.expiresAt ? "secondary" : "destructive"}
                              className="ml-2"
                            >
                              {ban.expiresAt ? 'Temporary' : 'Permanent'}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Reason: {ban.reason}
                          </div>
                          
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <User className="h-3 w-3 mr-1" />
                            <span>User: {ban.username}</span>
                            <span className="mx-2">•</span>
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Banned on: {format(new Date(ban.timestamp), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-muted-foreground flex items-center bg-muted py-1 px-2 rounded-full">
                          {formatBanExpiration(ban.expiresAt)}
                        </div>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleUnban(ban.id)}
                        >
                          Remove Ban
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No banned IPs found</h3>
                  <p className="text-muted-foreground">There are no IP bans matching your search</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Ban Dialog */}
      <Dialog open={addBanDialogOpen} onOpenChange={setAddBanDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New IP Ban</DialogTitle>
            <DialogDescription>
              Enter the details to ban an IP address
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="ipAddress" className="text-right">
                IP Address
              </label>
              <Input
                id="ipAddress"
                value={newBan.ipAddress}
                onChange={(e) => setNewBan({...newBan, ipAddress: e.target.value})}
                className="col-span-3"
                placeholder="e.g. 192.168.1.100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right">
                Username
              </label>
              <Input
                id="username"
                value={newBan.username}
                onChange={(e) => setNewBan({...newBan, username: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="reason" className="text-right">
                Reason
              </label>
              <Input
                id="reason"
                value={newBan.reason}
                onChange={(e) => setNewBan({...newBan, reason: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">
                Duration
              </label>
              <div className="col-span-3 flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="permanent"
                  checked={newBan.permanent}
                  onChange={(e) => setNewBan({...newBan, permanent: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="permanent">Permanent ban</label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBanDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleAddBan}>Ban IP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBannedIPs;
