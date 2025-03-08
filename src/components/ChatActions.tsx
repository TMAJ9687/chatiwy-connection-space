
import React from 'react';
import { Button } from '@/components/ui/button';
import { Flag, UserX, Ban, UserMinus, MoreHorizontal, History } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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
    <div className="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-primary-foreground/20"
              onClick={() => onReport(username)}
            >
              <Flag size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Report User</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {!isAdmin && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-primary-foreground/20"
                onClick={onBlock}
              >
                <UserMinus size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Block User</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-primary-foreground/20">
                  <MoreHorizontal size={18} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>More Options</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onViewHistory}>
            <History className="mr-2 h-4 w-4" />
            <span>Message History</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onViewBlocked}>
            <Ban className="mr-2 h-4 w-4" />
            <span>Blocked Users</span>
          </DropdownMenuItem>
          {!isAdmin && (
            <DropdownMenuItem onClick={onBlock}>
              <UserX className="mr-2 h-4 w-4" />
              <span>Block User</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
