
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender: string;
  senderId?: string;
  content: string;
  timestamp: Date;
  isBot: boolean;
  isRead?: boolean;
  image?: {
    url: string;
    blurred: boolean;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
  toggleImageBlur: (messageId: string, shouldBlur: boolean) => void;
  openImageInFullResolution: (imageUrl: string) => void;
  messageEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({
  messages,
  currentUsername,
  toggleImageBlur,
  openImageInFullResolution,
  messageEndRef
}: MessageListProps) {
  return (
    <ScrollArea className="flex-1 p-4 overflow-auto">
      <div className="space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === currentUsername ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[80%] p-3 ${
              message.sender === currentUsername 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
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
              ) : (
                <div className="break-words">{message.content}</div>
              )}
              <div className={`text-xs mt-1 ${
                message.sender === currentUsername 
                  ? 'text-primary-foreground/80' 
                  : 'text-muted-foreground'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </Card>
          </div>
        ))}
        
        <div ref={messageEndRef}></div>
      </div>
    </ScrollArea>
  );
}
