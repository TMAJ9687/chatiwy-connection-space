
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Check } from "lucide-react";

const MALE_AVATARS = [
  '/avatars/male-1.png',
  '/avatars/male-2.png',
  '/avatars/male-3.png',
  '/avatars/male-4.png',
  '/avatars/male-5.png',
  '/avatars/male-6.png',
  '/avatars/male-7.png',
  '/avatars/male-8.png',
  '/avatars/male-9.png',
  '/avatars/male-10.png',
];

const FEMALE_AVATARS = [
  '/avatars/female-1.png',
  '/avatars/female-2.png',
  '/avatars/female-3.png',
  '/avatars/female-4.png',
  '/avatars/female-5.png',
  '/avatars/female-6.png',
  '/avatars/female-7.png',
  '/avatars/female-8.png',
  '/avatars/female-9.png',
  '/avatars/female-10.png',
];

// Default avatar URLs using DiceBear API for demonstration
const getDefaultAvatarUrl = (index: number, gender: string): string => {
  const style = gender === 'male' ? 'male' : 'female';
  return `https://api.dicebear.com/7.x/personas/svg?seed=${style}${index + 1}`;
};

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
              // Use DiceBear for demo avatars
              const avatarUrl = getDefaultAvatarUrl(index, gender); 
              const isSelected = selectedAvatar === avatarUrl;
              
              return (
                <div key={index} className="relative">
                  <Avatar 
                    className={`w-16 h-16 cursor-pointer border-2 ${isSelected ? 'border-amber-500' : 'border-transparent'}`}
                    onClick={() => handleAvatarSelect(avatarUrl)}
                  >
                    <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
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
