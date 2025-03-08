
import React, { useState } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReportForm } from '@/components/ReportForm';

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
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  const handleBlockConfirm = () => {
    setShowBlockConfirm(false);
    onBlock();
  };

  const handleReportUser = (username: string) => {
    onReport(username);
    setShowReportForm(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowBlockConfirm(true)}
        className="text-white hover:bg-primary-foreground/20"
        title="Block User"
      >
        <Ban className="h-5 w-5" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowReportForm(true)}
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
              <DropdownMenuItem onClick={() => setShowBlockConfirm(true)} className="text-destructive">
                <Ban className="mr-2 h-4 w-4" />
                <span>Block User</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowReportForm(true)} className="text-destructive">
                <Flag className="mr-2 h-4 w-4" />
                <span>Report User</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block "{username}"? You won't receive messages from them anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReportForm 
        isOpen={showReportForm} 
        onClose={() => setShowReportForm(false)} 
        userName={username}
        onSubmitReport={(reason) => handleReportUser(username)}
      />
    </div>
  );
}
