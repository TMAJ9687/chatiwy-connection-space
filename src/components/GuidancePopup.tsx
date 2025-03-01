
import React from 'react';
import { Button } from '@/components/ui/button';
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

interface GuidancePopupProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function GuidancePopup({ onAccept, onDecline }: GuidancePopupProps) {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome to Chatiwy!</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4 text-foreground">
              <div>
                <h3 className="font-bold mb-2">Chat Rules</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Be respectful and kind to other users</li>
                  <li>Do not share personal contact information</li>
                  <li>Report any suspicious or inappropriate behavior</li>
                  <li>No spam, advertising, or self-promotion</li>
                  <li>No hate speech, discrimination, or harassment</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-2 text-red-500">Important!</h3>
                <div className="text-red-500 font-semibold">
                  Chatiwy is strictly for users 18 years and older. Underage users are not permitted to use this platform.
                </div>
              </div>

              <div>
                By clicking "I Accept", you agree to follow these guidelines and our Terms of Service.
                Violation of these rules may result in account suspension or termination.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>Decline</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>I Accept</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
