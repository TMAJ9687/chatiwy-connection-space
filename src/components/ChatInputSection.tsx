
import React, { useState, useRef, ChangeEvent } from 'react';
import { MessageInput } from '@/components/MessageInput';
import { EmojiPicker } from '@/components/EmojiPicker';
import { AlertTriangle } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES } from '@/utils/chatUtils';

interface ChatInputSectionProps {
  isBlocked: boolean;
  blockedUsername?: string;
  messageInput: string;
  imagePreview: string | null;
  isVipUser: boolean;
  imageUploads: number;
  maxMessageLength: number;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onImageUpload: () => void;
  onSendImage: () => void;
  onCancelImage: () => void;
  onEmojiClick: (emoji: string) => void;
}

export function ChatInputSection({
  isBlocked,
  blockedUsername,
  messageInput,
  imagePreview,
  isVipUser,
  imageUploads,
  maxMessageLength,
  onInputChange,
  onKeyDown,
  onSendMessage,
  onImageUpload,
  onSendImage,
  onCancelImage,
  onEmojiClick
}: ChatInputSectionProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleEmojiPickerToggle = () => setShowEmojiPicker(!showEmojiPicker);
  
  const handleEmojiSelection = (emoji: string) => {
    onEmojiClick(emoji);
    setShowEmojiPicker(false);
  };
  
  if (isBlocked) {
    return (
      <div className="p-4 border-t text-center text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>You have blocked {blockedUsername || 'this user'}.</p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {showEmojiPicker && (
        <EmojiPicker onEmojiClick={handleEmojiSelection} />
      )}
      
      <MessageInput 
        messageInput={messageInput}
        imagePreview={imagePreview}
        isVipUser={isVipUser}
        imageUploads={imageUploads}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        onSendMessage={onSendMessage}
        onEmojiPickerToggle={handleEmojiPickerToggle}
        onImageUpload={onImageUpload}
        onSendImage={onSendImage}
        onCancelImage={onCancelImage}
        maxMessageLength={maxMessageLength}
        showEmojiPicker={showEmojiPicker}
      />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
              // Handle file change logic
            }
          }
        }}
      />
    </div>
  );
}
