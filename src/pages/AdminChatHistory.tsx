
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  Calendar,
  User,
  MessageCircle,
  Eye,
  Clock,
  Image,
  Mic,
  FileText,
  Download,
  ChevronDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  type: 'text' | 'image' | 'voice' | 'file';
  content?: string; // URL for media content
  timestamp: Date;
  isAdminMessage: boolean;
}

interface ChatSession {
  id: string;
  user1Id: string;
  user1Name: string;
  user2Id: string;
  user2Name: string;
  lastMessagePreview: string;
  lastMessageTime: Date;
  messageCount: number;
  isAdminInvolved: boolean;
}

// Mock data for chat sessions
const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'chat-1',
    user1Id: 'admin-1',
    user1Name: 'Admin',
    user2Id: 'user-1',
    user2Name: 'Reincarnated',
    lastMessagePreview: 'Thank you for your help!',
    lastMessageTime: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    messageCount: 15,
    isAdminInvolved: true
  },
  {
    id: 'chat-2',
    user1Id: 'user-2',
    user1Name: 'Shinhoff',
    user2Id: 'user-3',
    user2Name: 'Naisees',
    lastMessagePreview: 'I'll see you tomorrow then.',
    lastMessageTime: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    messageCount: 28,
    isAdminInvolved: false
  },
  {
    id: 'chat-3',
    user1Id: 'bot-1',
    user1Name: 'Emma',
    user2Id: 'user-5',
    user2Name: 'Silky',
    lastMessagePreview: 'How can I help you today?',
    lastMessageTime: new Date(Date.now() - 3600000 * 1), // 1 hour ago
    messageCount: 7,
    isAdminInvolved: false
  }
];

// Mock data for chat messages
const MOCK_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'chat-1': [
    {
      id: 'msg-1-1',
      senderId: 'admin-1',
      senderName: 'Admin',
      receiverId: 'user-1',
      receiverName: 'Reincarnated',
      message: 'Hello, how can I help you today?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 3), // 3 hours ago
      isAdminMessage: true
    },
    {
      id: 'msg-1-2',
      senderId: 'user-1',
      senderName: 'Reincarnated',
      receiverId: 'admin-1',
      receiverName: 'Admin',
      message: 'I have a question about my account',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 2.9), // 2.9 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-1-3',
      senderId: 'user-1',
      senderName: 'Reincarnated',
      receiverId: 'admin-1',
      receiverName: 'Admin',
      message: 'Here's a screenshot of the issue',
      type: 'image',
      content: 'https://picsum.photos/400/300',
      timestamp: new Date(Date.now() - 3600000 * 2.8), // 2.8 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-1-4',
      senderId: 'admin-1',
      senderName: 'Admin',
      receiverId: 'user-1',
      receiverName: 'Reincarnated',
      message: 'I see the issue. Let me help you resolve that.',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 2.5), // 2.5 hours ago
      isAdminMessage: true
    },
    {
      id: 'msg-1-5',
      senderId: 'admin-1',
      senderName: 'Admin',
      receiverId: 'user-1',
      receiverName: 'Reincarnated',
      message: 'Voice instructions',
      type: 'voice',
      content: 'Voice recording (15s)',
      timestamp: new Date(Date.now() - 3600000 * 2.3), // 2.3 hours ago
      isAdminMessage: true
    },
    {
      id: 'msg-1-6',
      senderId: 'user-1',
      senderName: 'Reincarnated',
      receiverId: 'admin-1',
      receiverName: 'Admin',
      message: 'Thank you for your help!',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      isAdminMessage: false
    }
  ],
  'chat-2': [
    {
      id: 'msg-2-1',
      senderId: 'user-2',
      senderName: 'Shinhoff',
      receiverId: 'user-3',
      receiverName: 'Naisees',
      message: 'Hey there!',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 6), // 6 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-2-2',
      senderId: 'user-3',
      senderName: 'Naisees',
      receiverId: 'user-2',
      receiverName: 'Shinhoff',
      message: 'Hi! How are you?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 5.9), // 5.9 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-2-3',
      senderId: 'user-2',
      senderName: 'Shinhoff',
      receiverId: 'user-3',
      receiverName: 'Naisees',
      message: 'I'm good. Want to meet up tomorrow?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 5.5), // 5.5 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-2-4',
      senderId: 'user-3',
      senderName: 'Naisees',
      receiverId: 'user-2',
      receiverName: 'Shinhoff',
      message: 'Sure, what time?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 5.2), // 5.2 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-2-5',
      senderId: 'user-2',
      senderName: 'Shinhoff',
      receiverId: 'user-3',
      receiverName: 'Naisees',
      message: 'How about 3pm?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 5.1), // 5.1 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-2-6',
      senderId: 'user-3',
      senderName: 'Naisees',
      receiverId: 'user-2',
      receiverName: 'Shinhoff',
      message: 'I'll see you tomorrow then.',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 5), // 5 hours ago
      isAdminMessage: false
    }
  ],
  'chat-3': [
    {
      id: 'msg-3-1',
      senderId: 'user-5',
      senderName: 'Silky',
      receiverId: 'bot-1',
      receiverName: 'Emma',
      message: 'Hello',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 1.5), // 1.5 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-3-2',
      senderId: 'bot-1',
      senderName: 'Emma',
      receiverId: 'user-5',
      receiverName: 'Silky',
      message: 'Hi there! How can I help you today?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 1.4), // 1.4 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-3-3',
      senderId: 'user-5',
      senderName: 'Silky',
      receiverId: 'bot-1',
      receiverName: 'Emma',
      message: 'I'm bored',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 1.3), // 1.3 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-3-4',
      senderId: 'bot-1',
      senderName: 'Emma',
      receiverId: 'user-5',
      receiverName: 'Silky',
      message: 'I can suggest some activities or we can chat!',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 1.2), // 1.2 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-3-5',
      senderId: 'user-5',
      senderName: 'Silky',
      receiverId: 'bot-1',
      receiverName: 'Emma',
      message: 'Let's chat',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 1.1), // 1.1 hours ago
      isAdminMessage: false
    },
    {
      id: 'msg-3-6',
      senderId: 'bot-1',
      senderName: 'Emma',
      receiverId: 'user-5',
      receiverName: 'Silky',
      message: 'Great! What would you like to talk about?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 1), // 1 hour ago
      isAdminMessage: false
    }
  ]
};

const AdminChatHistory = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'admin-only'>('all');

  useEffect(() => {
    // Load chat sessions - in a real app, this would fetch from an API
    setChatSessions(MOCK_CHAT_SESSIONS);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      setChatMessages(MOCK_CHAT_MESSAGES[selectedSession] || []);
    }
  }, [selectedSession]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredChatSessions = chatSessions.filter(session => {
    if (searchQuery && 
        !session.user1Name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !session.user2Name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filter === 'admin-only' && !session.isAdminInvolved) {
      return false;
    }
    
    return true;
  });

  const handleViewChat = (sessionId: string) => {
    setSelectedSession(sessionId);
    setIsViewDialogOpen(true);
  };

  const renderMessageContent = (message: ChatMessage) => {
    switch (message.type) {
      case 'text':
        return <p>{message.message}</p>;
      case 'image':
        return (
          <div className="space-y-2">
            <p className="text-xs opacity-70">Image:</p>
            <img 
              src={message.content} 
              alt="Shared" 
              className="rounded-md max-w-full max-h-48 object-contain"
            />
          </div>
        );
      case 'voice':
        return (
          <div className="flex items-center space-x-2">
            <Mic className="h-4 w-4" />
            <span>{message.content}</span>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>{message.content}</span>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return <p>{message.message}</p>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Chat History | Chatiwy Admin</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Chat History</h1>
          
          <div className="flex justify-between items-center mb-6">
            <div className="text-muted-foreground">
              View and monitor chat conversations between users
            </div>
            
            <div className="flex items-center space-x-2">
              <Tabs defaultValue="all" className="w-[200px]" onValueChange={(value) => setFilter(value as 'all' | 'admin-only')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All Chats</TabsTrigger>
                  <TabsTrigger value="admin-only">Admin Only</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search chats..."
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
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Most Recent
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Most Messages
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Chat Sessions</CardTitle>
              <CardDescription>
                Browse and monitor user conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredChatSessions.length > 0 ? (
                <div className="divide-y">
                  {filteredChatSessions.map((session) => (
                    <div key={session.id} className="py-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <MessageCircle className={`h-8 w-8 ${
                            session.isAdminInvolved ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        
                        <div>
                          <div className="font-medium flex items-center">
                            <span>{session.user1Name} and {session.user2Name}</span>
                            {session.isAdminInvolved && (
                              <Badge 
                                variant="outline"
                                className="ml-2 bg-primary/10"
                              >
                                Admin Involved
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Last message: {session.lastMessagePreview}
                          </div>
                          
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span>{session.messageCount} messages</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{format(new Date(session.lastMessageTime), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewChat(session.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No chat sessions found</h3>
                  <p className="text-muted-foreground">No chats match your current filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* View Chat Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedSession && chatSessions.find(s => s.id === selectedSession)?.user1Name} and {selectedSession && chatSessions.find(s => s.id === selectedSession)?.user2Name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 pr-2 -mr-2">
            <div className="space-y-4 py-4">
              {chatMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isAdminMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isAdminMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">
                      {message.senderName} • {format(new Date(message.timestamp), 'h:mm a')}
                    </div>
                    
                    {renderMessageContent(message)}
                    
                    <div className="text-[10px] opacity-70 mt-1 text-right">
                      {format(new Date(message.timestamp), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChatHistory;
