
import React, { useState, useRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Smile, Image as ImageIcon, Mic, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getPhotoLimit } from '@/utils/siteSettings';

interface MessageInputProps {
  messageInput: string;
  imagePreview: string | null;
  isVipUser: boolean;
  imageUploads: number;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onEmojiPickerToggle: () => void;
  onImageUpload: () => void;
  onSendImage: () => void;
  onCancelImage: () => void;
  maxMessageLength: number;
  showEmojiPicker: boolean;
}

export function MessageInput({
  messageInput,
  imagePreview,
  isVipUser,
  imageUploads,
  onInputChange,
  onKeyDown,
  onSendMessage,
  onEmojiPickerToggle,
  onImageUpload,
  onSendImage,
  onCancelImage,
  maxMessageLength,
  showEmojiPicker
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleVoiceMessage = () => {
    if (!isVipUser) {
      toast.info('Voice messages are available for VIP users only. Upgrade to VIP for full access!');
    } else {
      toast.info('Voice recording started...');
    }
  };
  
  return (
    <div className="p-4 border-t">
      {imagePreview && (
        <div className="mb-4 border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Image preview</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancelImage}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Cancel</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </Button>
          </div>
          <img 
            src={imagePreview} 
            alt="Upload preview" 
            className="max-h-[200px] rounded-md mx-auto object-contain" 
          />
          <div className="flex justify-end mt-2">
            <Button onClick={onSendImage} size="sm">
              Send Image
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="flex h-10 w-full items-center relative">
            <Input
              value={messageInput}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="Type a message..."
              className="pr-16 h-10"
              maxLength={maxMessageLength}
            />
            <div className="absolute right-2 text-xs text-muted-foreground pointer-events-none">
              {messageInput.length}/{maxMessageLength}
            </div>
          </div>
        </div>
        
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={onEmojiPickerToggle}
                  className="h-10 w-10"
                >
                  <Smile size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add emoji</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={onImageUpload}
                    className="h-10 w-10"
                    disabled={!isVipUser && imageUploads >= getPhotoLimit(isVipUser)}
                  >
                    <ImageIcon size={20} />
                    {!isVipUser && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-3 -right-3 px-1 py-0 min-w-5 h-5 flex items-center justify-center text-xs"
                      >
                        {imageUploads}/{getPhotoLimit(isVipUser)}
                      </Badge>
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {!isVipUser && imageUploads >= getPhotoLimit(false) 
                    ? 'Daily image upload limit reached' 
                    : isVipUser ? 'Add image (unlimited)' : `Add image (${imageUploads}/${getPhotoLimit(false)})`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleVoiceMessage}
                  className="h-10 w-10"
                >
                  <Mic size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voice messages (VIP only)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="icon" 
                  onClick={onSendMessage}
                  className="h-10 w-10"
                >
                  <Send size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/jpeg,image/png,image/gif,image/jpg"
      />
    </div>
  );
}
