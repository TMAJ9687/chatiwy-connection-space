
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ imageUrl, isOpen, onClose }: ImageModalProps) {
  if (!isOpen || !imageUrl) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div className="relative max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <Button 
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full" 
          size="icon"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
        <img src={imageUrl} alt="Full resolution" className="max-w-full max-h-[90vh] object-contain" />
      </div>
    </div>
  );
}
