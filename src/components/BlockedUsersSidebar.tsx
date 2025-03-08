
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Ban, UserX } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface BlockedUsersSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockedUsers: string[];
  onUnblock: (userId: string) => void;
  getUsernameById: (userId: string) => string;
}

export function BlockedUsersSidebar({
  open,
  onOpenChange,
  blockedUsers,
  onUnblock,
  getUsernameById
}: BlockedUsersSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-[90vw] p-0">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Blocked Users</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            {blockedUsers.length > 0 ? (
              <div className="px-1">
                {blockedUsers.map(userId => {
                  const username = getUsernameById(userId);
                  return (
                    <div 
                      key={userId}
                      className="p-3 hover:bg-secondary/50 rounded-md cursor-pointer flex items-start justify-between"
                    >
                      <div className="flex gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <UserX className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{username}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Blocked user</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onUnblock(userId)}
                      >
                        Unblock
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <Ban className="h-10 w-10 mb-4 opacity-50" />
                <p className="text-lg font-medium">No blocked users</p>
                <p className="text-sm max-w-xs">When you block someone, they'll appear here.</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
