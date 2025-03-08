
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Check } from "lucide-react";
import { MALE_AVATARS, FEMALE_AVATARS, STANDARD_AVATARS } from '@/components/connected-users/types';

interface VIPAvatarSelectorProps {
  gender: string;
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export function VIPAvatarSelector({ gender, currentAvatar, onAvatarChange }: VIPAvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar || '');
  
  const avatars = gender.toLowerCase() === 'male' ? MALE_AVATARS : FEMALE_AVATARS;
  
  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    onAvatarChange(avatarUrl);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Change Avatar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select VIP Avatar</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] p-4">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {avatars.map((avatar, index) => {
              const isSelected = selectedAvatar === avatar;
              
              return (
                <div key={index} className="relative">
                  <Avatar 
                    className={`w-16 h-16 cursor-pointer border-2 ${isSelected ? 'border-amber-500' : 'border-transparent'}`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Export the standard avatars for non-VIP users
export const getStandardAvatar = (gender: string): string => {
  return gender.toLowerCase() === 'male' ? STANDARD_AVATARS.male : STANDARD_AVATARS.female;
};
