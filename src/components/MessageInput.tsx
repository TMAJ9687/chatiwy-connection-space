
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Smile, Image as ImageIcon, Mic, Send, Square } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const MAX_RECORDING_TIME = 300; // 5 minutes in seconds
  
  useEffect(() => {
    let interval: number | null = null;
    
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRecording]);
  
  const startRecording = async () => {
    if (!isVipUser) {
      toast.info('Voice messages are available for VIP users only. Upgrade to VIP for full access!');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Voice recording started. Maximum duration: 5 minutes.');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Unable to access microphone. Please check your browser permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Voice recording completed');
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      toast.info('Voice recording canceled');
    }
  };
  
  const sendVoiceMessage = () => {
    if (!audioBlob) return;
    
    // Here you would normally upload the audio blob to your server
    // and then send a message with the voice message URL
    
    // For demonstration, we'll create an object URL to display in the chat
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // In a real app, you'd send this URL to your backend
    console.log('Voice message URL:', audioUrl);
    
    // Reset the audio blob
    setAudioBlob(null);
    
    toast.success('Voice message sent!');
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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
      
      {isRecording && (
        <div className="mb-4 border rounded-md p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording voice message: {formatTime(recordingTime)}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={cancelRecording}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={stopRecording}
              >
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
            </div>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${(recordingTime / MAX_RECORDING_TIME) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-right">
            Max duration: 5:00 minutes
          </div>
        </div>
      )}
      
      {audioBlob && !isRecording && (
        <div className="mb-4 border rounded-md p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <audio 
                controls 
                src={URL.createObjectURL(audioBlob)} 
                className="max-w-[250px]"
              ></audio>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAudioBlob(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={sendVoiceMessage}
              >
                Send Voice
              </Button>
            </div>
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
              disabled={isRecording}
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
                  disabled={isRecording}
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
                    disabled={!isVipUser && imageUploads >= getPhotoLimit(isVipUser) || isRecording}
                  >
                    <ImageIcon size={20} />
                  </Button>
                  {!isVipUser && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-1 py-0 min-w-5 h-5 flex items-center justify-center text-xs"
                    >
                      {imageUploads}/{getPhotoLimit(isVipUser)}
                    </Badge>
                  )}
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
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon" 
                  onClick={isRecording ? stopRecording : startRecording}
                  className="h-10 w-10"
                  disabled={audioBlob !== null && !isRecording}
                >
                  <Mic size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isVipUser ? (isRecording ? "Stop recording" : "Voice message") : "Voice messages (VIP only)"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="icon" 
                  onClick={audioBlob ? sendVoiceMessage : onSendMessage}
                  className="h-10 w-10"
                  disabled={isRecording || (messageInput.trim() === '' && !audioBlob && !imagePreview)}
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
