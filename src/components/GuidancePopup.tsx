
import React, { useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface GuidancePopupProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function GuidancePopup({ onAccept, onDecline }: GuidancePopupProps) {
  const GUIDANCE_ACCEPTED_KEY = 'chatiwy_guidance_accepted';
  
  useEffect(() => {
    // Check if guidance was already accepted
    const guidanceAccepted = localStorage.getItem(GUIDANCE_ACCEPTED_KEY) === 'true';
    if (guidanceAccepted) {
      // If already accepted, auto-accept again to make the popup go away
      onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    // Save acceptance to localStorage to persist across refreshes
    localStorage.setItem(GUIDANCE_ACCEPTED_KEY, 'true');
    onAccept();
  };

  return (
    <AlertDialog defaultOpen={true}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome to Chatiwy!</AlertDialogTitle>
          <AlertDialogDescription>
            Before you start chatting, please read and accept our community guidelines.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-[300px] overflow-y-auto my-4 text-sm space-y-4">
          <p>
            <strong>Chatiwy Community Guidelines</strong>
          </p>
          <p>
            Welcome to Chatiwy, a place for respectful conversations and connections. By using our platform, you agree to follow these guidelines:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Respect Others:</strong> Treat everyone with kindness and respect. Harassment, hate speech, and bullying are not tolerated.
            </li>
            <li>
              <strong>Appropriate Content:</strong> Do not share explicit, illegal, or harmful content. This includes but is not limited to pornography, violence, or content that promotes illegal activities.
            </li>
            <li>
              <strong>Privacy:</strong> Respect others' privacy. Do not share personal information about others without their consent.
            </li>
            <li>
              <strong>No Spam:</strong> Do not send unsolicited messages, advertisements, or engage in activities that disrupt the platform.
            </li>
            <li>
              <strong>Age Requirement:</strong> You must be at least 18 years old to use Chatiwy.
            </li>
            <li>
              <strong>Report Violations:</strong> If you encounter a user violating these guidelines, please report them using the report feature.
            </li>
          </ol>
          <p>
            Failure to comply with these guidelines may result in warnings, temporary restrictions, or permanent bans from Chatiwy.
          </p>
          <p>
            Thank you for helping us maintain a positive and safe environment for all users!
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>Decline</AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept}>Accept</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
