
import React from 'react';
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
import { Check, X } from 'lucide-react';

interface GuidancePopupProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function GuidancePopup({ onAccept, onDecline }: GuidancePopupProps) {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-teal-500">
            Chatiwy Guidelines
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-4">
            <p>
              Welcome to Chatiwy! Before you start chatting, please read and agree to our guidelines:
            </p>
            
            <div className="space-y-2 mt-4">
              <h3 className="font-semibold text-foreground">Chat Rules:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Be respectful to other users.</li>
                <li>Do not share personal information (address, phone number, etc.).</li>
                <li>No spamming or sending duplicate messages.</li>
                <li>No harassment, bullying, or hate speech.</li>
                <li>No sharing of explicit content.</li>
                <li>No impersonation of others.</li>
                <li>No promotion of illegal activities.</li>
              </ul>
            </div>
            
            <div className="space-y-2 mt-4">
              <h3 className="font-semibold text-foreground">Standard User Limits:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Message character limit: 140 characters</li>
                <li>Image sharing: 10 images per day</li>
                <li>Chat history retention: 1 hour</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                By clicking "I Agree", you confirm that you have read and accept these guidelines. 
                Violations may result in temporary or permanent bans from the platform.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onDecline}
            className="mt-0 w-full sm:w-auto border-red-500 hover:bg-red-500 hover:text-white"
          >
            <X className="mr-2 h-4 w-4" />
            I Disagree
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onAccept}
            className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600"
          >
            <Check className="mr-2 h-4 w-4" />
            I Agree
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
