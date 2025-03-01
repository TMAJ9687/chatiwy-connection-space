
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Image, 
  Mic, 
  Smile, 
  MoreHorizontal, 
  AlertTriangle,
  User,
  Flag
} from 'lucide-react';
import { toast } from 'sonner';
import { botProfiles, getRandomBotResponse, getRandomConversationStarter } from '@/utils/botProfiles';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isBot: boolean;
  isRead?: boolean;
}

interface ChatInterfaceProps {
  userProfile: any;
}

export function ChatInterface({ userProfile }: ChatInterfaceProps) {
  const [currentChat, setCurrentChat] = useState<{
    userId: string;
    username: string;
    isBot: boolean;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [imageUploads, setImageUploads] = useState(0);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Initialize with the first bot as the current chat
  useEffect(() => {
    if (botProfiles.length > 0) {
      const randomBot = botProfiles[Math.floor(Math.random() * botProfiles.length)];
      setCurrentChat({
        userId: randomBot.id,
        username: randomBot.username,
        isBot: true
      });
    }
  }, []);

  // Bot sends initial message
  useEffect(() => {
    if (currentChat?.isBot && messages.length === 0) {
      // Add a small delay to make it feel more natural
      const timer = setTimeout(() => {
        const starter = getRandomConversationStarter();
        setMessages([
          {
            id: Math.random().toString(36).substring(7),
            sender: currentChat.username,
            content: starter,
            timestamp: new Date(),
            isBot: true
          }
        ]);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentChat, messages.length]);

  // Bot responds to user messages
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === userProfile.username) {
      // Bot is "typing"
      const typingDelay = Math.floor(Math.random() * 3000) + 1000; // Random delay between 1-4 seconds
      
      const timer = setTimeout(() => {
        const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
        let responseCategory: 'greeting' | 'interests' | 'weather' | 'generic' = 'generic';
        
        // Simple message analysis to determine response type
        if (lastUserMessage.includes('hi') || 
            lastUserMessage.includes('hello') || 
            lastUserMessage.includes('hey') ||
            lastUserMessage.includes('how are you')) {
          responseCategory = 'greeting';
        } else if (lastUserMessage.includes('weather') || 
                  lastUserMessage.includes('raining') || 
                  lastUserMessage.includes('sunny')) {
          responseCategory = 'weather';
        } else if (userProfile.interests.some((interest: string) => 
                  lastUserMessage.includes(interest.toLowerCase()))) {
          responseCategory = 'interests';
        }
        
        // Get bot response
        let botResponse = getRandomBotResponse(responseCategory);
        
        // Replace placeholders in the response
        if (responseCategory === 'interests') {
          const matchedInterest = userProfile.interests.find((interest: string) => 
            lastUserMessage.includes(interest.toLowerCase())
          ) || userProfile.interests[0];
          botResponse = botResponse.replace('[interest]', matchedInterest);
        } else if (responseCategory === 'weather') {
          const weatherTypes = ['sunny', 'rainy', 'cloudy', 'windy', 'stormy', 'beautiful'];
          const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
          const bot = botProfiles.find(b => b.username === currentChat?.username);
          botResponse = botResponse
            .replace('[country]', bot?.country || 'my country')
            .replace('[weather_type]', randomWeather);
        }
        
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            sender: currentChat?.username || 'Bot',
            content: botResponse,
            timestamp: new Date(),
            isBot: true
          }
        ]);
      }, typingDelay);
      
      return () => clearTimeout(timer);
    }
  }, [messages, currentChat, userProfile]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Check for character limit (140 for standard users)
    if (messageInput.length > 140) {
      toast.warning('Standard users are limited to 140 characters per message');
      return;
    }
    
    // Check for consecutive numbers (max 4)
    const consecutiveNumbersMatch = messageInput.match(/\d{5,}/);
    if (consecutiveNumbersMatch) {
      toast.warning('Message contains too many consecutive numbers');
      return;
    }
    
    // Check for duplicate messages
    const isDuplicate = messages.some(
      m => m.sender === userProfile.username && 
      m.content === messageInput && 
      new Date().getTime() - new Date(m.timestamp).getTime() < 60000 // Within last minute
    );
    
    if (isDuplicate) {
      toast.warning('Please avoid sending duplicate messages');
      return;
    }
    
    // Add message to chat
    setMessages([
      ...messages,
      {
        id: Math.random().toString(36).substring(7),
        sender: userProfile.username,
        content: messageInput,
        timestamp: new Date(),
        isBot: false
      }
    ]);
    
    // Clear input
    setMessageInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = () => {
    if (imageUploads >= 10) {
      toast.error('Standard users can only upload 10 images per day');
      return;
    }
    
    toast.info('Image upload feature will be available soon!');
    setImageUploads(prev => prev + 1);
  };

  const handleVoiceMessage = () => {
    toast.info('Voice messages are only available for VIP users');
  };

  return (
    <div className="rounded-lg border shadow-sm h-[70vh] flex flex-col bg-background">
      {currentChat ? (
        <>
          {/* Chat header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                botProfiles.find(b => b.id === currentChat.userId)?.gender === 'Male' 
                  ? 'bg-blue-500' 
                  : 'bg-pink-500'
              }`}>
                {currentChat.username.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium">{currentChat.username}</h3>
                <div className="flex items-center text-sm text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Profile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Flag className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Report User</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More Options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Message area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === userProfile.username ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] ${
                      message.sender === userProfile.username 
                        ? 'bg-teal-500 text-white rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-2xl' 
                        : 'bg-gray-100 dark:bg-gray-800 rounded-tr-2xl rounded-tl-sm rounded-bl-2xl rounded-br-2xl'
                    } px-4 py-2 shadow-sm`}
                  >
                    <p>{message.content}</p>
                    <div 
                      className={`text-xs mt-1 ${
                        message.sender === userProfile.username 
                          ? 'text-teal-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.sender === userProfile.username && (
                        <span className="ml-1">✓</span> // Simple "sent" indicator
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
          </ScrollArea>
          
          {/* Message input */}
          <div className="p-4 border-t">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="resize-none min-h-[60px] max-h-[120px]"
                  maxLength={140} // Enforce character limit
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>{messageInput.length}/140 characters</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleImageUpload}
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleVoiceMessage}
                  className="opacity-50" // Disabled for standard users
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a user to start chatting
        </div>
      )}
    </div>
  );
}
