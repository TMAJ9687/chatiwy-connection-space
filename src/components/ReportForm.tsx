
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const ReportForm = ({ isOpen, onClose, userName }: ReportFormProps) => {
  const [reportReason, setReportReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportReason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    
    if (reportReason === 'other' && !otherReason.trim()) {
      toast.error('Please provide details for your report');
      return;
    }
    
    // Get IP address (in a real app, this would come from the server)
    // Here we're just using a placeholder
    const userIpAddress = '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
    
    // Here we would submit the report to the backend
    toast.success(`Report against ${userName} submitted successfully`);
    
    // Reset form and close
    setReportReason('');
    setOtherReason('');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report User: {userName}</DialogTitle>
            <DialogDescription>
              Please select a reason for reporting this user.
              Abuse of the reporting system may result in account restrictions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup 
              value={reportReason} 
              onValueChange={setReportReason} 
              className="space-y-3"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="underage" id="underage" />
                <Label htmlFor="underage" className="font-normal">
                  <div className="font-medium">Underage</div>
                  <div className="text-sm text-muted-foreground">This user appears to be under 18 years old</div>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="exploitation" id="exploitation" />
                <Label htmlFor="exploitation" className="font-normal">
                  <div className="font-medium">Child exploitation and human trafficking</div>
                  <div className="text-sm text-muted-foreground">This user is sharing harmful content related to minors or trafficking</div>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="hate" id="hate" />
                <Label htmlFor="hate" className="font-normal">
                  <div className="font-medium">Hate speech/discrimination</div>
                  <div className="text-sm text-muted-foreground">This user is posting discriminatory or hateful content</div>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="violence" id="violence" />
                <Label htmlFor="violence" className="font-normal">
                  <div className="font-medium">Threat of violence/self-harm</div>
                  <div className="text-sm text-muted-foreground">This user is threatening violence or discussing self-harm</div>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="harassment" id="harassment" />
                <Label htmlFor="harassment" className="font-normal">
                  <div className="font-medium">Harassment/Abuse</div>
                  <div className="text-sm text-muted-foreground">This user is harassing or abusing others</div>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="tos" id="tos" />
                <Label htmlFor="tos" className="font-normal">
                  <div className="font-medium">Violation of Terms of Service</div>
                  <div className="text-sm text-muted-foreground">This user is violating our Terms of Service in other ways</div>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal">
                  <div className="font-medium">Other</div>
                  <div className="text-sm text-muted-foreground">Please specify the reason below</div>
                </Label>
              </div>
            </RadioGroup>
            
            {reportReason === 'other' && (
              <div className="mt-4">
                <Label htmlFor="otherReason">Please provide details (max 150 characters):</Label>
                <Textarea
                  id="otherReason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  maxLength={150}
                  className="mt-1"
                  placeholder="Please explain the issue..."
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {otherReason.length}/150
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
