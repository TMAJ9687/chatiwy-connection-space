
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { History, MoreVertical, Flag, Ban, UserX } from 'lucide-react';

interface ChatActionsProps {
  username: string;
  isAdmin?: boolean;
  onBlock: () => void;
  onReport: (username: string) => void;
  onViewHistory: () => void;
  onViewBlocked: () => void;
}

export function ChatActions({
  username,
  isAdmin = false,
  onBlock,
  onReport,
  onViewHistory,
  onViewBlocked
}: ChatActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBlock}
        className="text-white hover:bg-primary-foreground/20"
        title="Block User"
      >
        <Ban className="h-5 w-5" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onReport(username)}
        className="text-white hover:bg-primary-foreground/20"
        title="Report User"
      >
        <Flag className="h-5 w-5" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-primary-foreground/20"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onViewHistory}>
            <History className="mr-2 h-4 w-4" />
            <span>View Message History</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onViewBlocked}>
            <UserX className="mr-2 h-4 w-4" />
            <span>View Blocked Users</span>
          </DropdownMenuItem>
          {!isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBlock} className="text-destructive">
                <Ban className="mr-2 h-4 w-4" />
                <span>Block User</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
