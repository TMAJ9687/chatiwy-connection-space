
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mic, Send, Check, CheckCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender: string;
  senderId?: string;
  content: string;
  timestamp: Date;
  isBot: boolean;
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  image?: {
    url: string;
    blurred: boolean;
  };
  audio?: {
    url: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
  toggleImageBlur: (messageId: string, shouldBlur: boolean) => void;
  openImageInFullResolution: (imageUrl: string) => void;
  messageEndRef: React.RefObject<HTMLDivElement>;
  isVipUser: boolean;
  typingUsers?: Set<string>;
}

export function MessageList({
  messages,
  currentUsername,
  toggleImageBlur,
  openImageInFullResolution,
  messageEndRef,
  isVipUser,
  typingUsers
}: MessageListProps) {
  const renderMessageStatus = (message: Message, isCurrentUser: boolean) => {
    if (!isVipUser || !isCurrentUser || !message.status) return null;
    
    return (
      <span className="ml-1">
        {message.status === 'sent' && (
          <Send size={12} className="inline text-gray-400" />
        )}
        {message.status === 'delivered' && (
          <Check size={12} className="inline text-gray-400" />
        )}
        {message.status === 'read' && (
          <CheckCheck size={12} className="inline text-blue-500" />
        )}
      </span>
    );
  };

  return (
    <ScrollArea className="flex-1 p-4 overflow-auto">
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender === currentUsername || message.senderId === userProfile?.id;
          
          return (
            <div 
              key={message.id} 
              className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-start max-w-[80%]`}>
                <Card className={`p-3 ${
                  isCurrentUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {!isCurrentUser && (
                    <div className="text-xs font-medium mb-1 text-muted-foreground">
                      {message.sender}
                    </div>
                  )}
                  
                  {message.image ? (
                    <div className="mb-2 relative">
                      <div className={message.image.blurred ? 'blur-xl' : ''}>
                        <img 
                          src={message.image.url} 
                          alt="Shared image" 
                          className="max-w-full rounded-md max-h-[300px] object-contain" 
                          onClick={() => !message.image.blurred && openImageInFullResolution(message.image.url)}
                        />
                      </div>
                      {message.image.blurred && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="opacity-90 z-10"
                            onClick={() => toggleImageBlur(message.id, false)}
                          >
                            <Eye size={16} className="mr-1" /> Reveal image
                          </Button>
                        </div>
                      )}
                      {!message.image.blurred && (
                        <div className="absolute bottom-2 right-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="opacity-75 hover:opacity-100"
                            onClick={() => toggleImageBlur(message.id, true)}
                          >
                            <EyeOff size={12} className="mr-1" /> Blur
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : message.audio ? (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Mic size={16} className={message.sender === currentUsername ? 'text-primary-foreground' : ''} />
                        <span className="text-sm">Voice message</span>
                      </div>
                      <audio controls className="w-full max-w-[240px]">
                        <source src={message.audio.url} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <div className="break-words">{message.content}</div>
                  )}
                  <div className={`text-xs mt-1 flex items-center ${
                    isCurrentUser 
                      ? 'text-primary-foreground/80' 
                      : 'text-muted-foreground'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {renderMessageStatus(message, isCurrentUser)}
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isVipUser && typingUsers && typingUsers.size > 0 && (
          <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
            <span>
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        
        <div ref={messageEndRef}></div>
      </div>
    </ScrollArea>
  );
}
