
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, History } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface ChatHistory {
  userId: string;
  username: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
    image?: { url: string };
  };
  messageCount: number;
}

interface ChatHistorySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatHistories: ChatHistory[];
  onSelectUser: (userId: string) => void;
}

export function ChatHistorySidebar({
  open,
  onOpenChange,
  chatHistories,
  onSelectUser
}: ChatHistorySidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-[90vw] p-0">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Chat History</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            {chatHistories.length > 0 ? (
              <div className="px-1">
                {chatHistories.map((history) => (
                  <div 
                    key={history.userId}
                    className="p-3 hover:bg-secondary/50 rounded-md cursor-pointer flex items-start justify-between"
                    onClick={() => {
                      onSelectUser(history.userId);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{history.username}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {history.lastMessage?.content || '(Image)'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {history.lastMessage ? new Date(history.lastMessage.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">{history.messageCount}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <History className="h-10 w-10 mb-4 opacity-50" />
                <p className="text-lg font-medium">No chat history</p>
                <p className="text-sm max-w-xs">Start conversations with users to see your chat history here.</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
