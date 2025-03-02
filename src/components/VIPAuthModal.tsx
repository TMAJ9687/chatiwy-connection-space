
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, CreditCard, UserPlus } from 'lucide-react';

interface VIPAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VIPAuthModal = ({ isOpen, onClose }: VIPAuthModalProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/vip/login');
  };

  const handleSignup = () => {
    onClose();
    navigate('/vip/signup');
  };

  const handleLearnMore = () => {
    onClose();
    navigate('/vip');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">VIP Membership</DialogTitle>
          <DialogDescription className="text-center">
            Unlock premium features with VIP membership
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button 
            onClick={handleLogin} 
            className="flex flex-col items-center gap-2 h-auto py-4"
            variant="outline"
          >
            <User className="h-6 w-6 text-amber-500" />
            <div className="text-center">
              <div className="font-medium">Login</div>
              <div className="text-xs text-muted-foreground">Existing VIP members</div>
            </div>
          </Button>
          <Button 
            onClick={handleSignup} 
            className="flex flex-col items-center gap-2 h-auto py-4"
            variant="outline"
          >
            <UserPlus className="h-6 w-6 text-amber-500" />
            <div className="text-center">
              <div className="font-medium">Signup</div>
              <div className="text-xs text-muted-foreground">New VIP members</div>
            </div>
          </Button>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-md border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-300 text-center">
            Enjoy unlimited photos, voice messages, 10-hour chat history, and many more premium features for just $5/month.
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="outline" onClick={handleLearnMore}>Learn More</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VIPAuthModal;
