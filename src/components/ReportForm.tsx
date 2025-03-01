
import React, { useState } from 'react';
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
import { 
  RadioGroup,
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Flag } from 'lucide-react';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function ReportForm({ isOpen, onClose, userName }: ReportFormProps) {
  const [reason, setReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");

  const handleSubmit = () => {
    const reportReason = reason === "Other" ? otherReason : reason;
    
    if (!reportReason) {
      toast.error("Please select a reason for your report");
      return;
    }
    
    if (reason === "Other" && otherReason.trim().length === 0) {
      toast.error("Please provide details for your report");
      return;
    }
    
    // In a real app, this would send the report to a server
    toast.success(`Report submitted for ${userName}`);
    onClose();
    
    // Reset form
    setReason("");
    setOtherReason("");
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report User: {userName}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please select a reason for reporting this user. Your report will be reviewed by our moderation team.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Underage" id="underage" />
                <Label htmlFor="underage">Underage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Child exploitation and human trafficking" id="exploitation" />
                <Label htmlFor="exploitation">Child exploitation and human trafficking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Hate speech/discrimination" id="hate" />
                <Label htmlFor="hate">Hate speech/discrimination</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Threat of violence/self-harm" id="violence" />
                <Label htmlFor="violence">Threat of violence/self-harm</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Harassment/Abuse" id="harassment" />
                <Label htmlFor="harassment">Harassment/Abuse</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Violation of Terms of Service" id="tos" />
                <Label htmlFor="tos">Violation of Terms of Service</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
              
              {reason === "Other" && (
                <div className="mt-3">
                  <Textarea 
                    placeholder="Please provide details (max 150 characters)"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    maxLength={150}
                    className="w-full h-24"
                  />
                  <p className="text-xs text-right mt-1 text-muted-foreground">
                    {otherReason.length}/150 characters
                  </p>
                </div>
              )}
            </div>
          </RadioGroup>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-600"
          >
            Submit Report
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
