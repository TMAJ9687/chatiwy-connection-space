
import React from 'react';

interface AdSensePlaceholderProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export function AdSensePlaceholder({ slot, format = 'auto', className = '' }: AdSensePlaceholderProps) {
  return (
    <div 
      className={`ad-container border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 flex items-center justify-center ${className}`}
      data-ad-slot={slot}
      data-ad-format={format}
    >
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>AdSense Placeholder</p>
        <p className="text-xs">Slot: {slot}</p>
      </div>
    </div>
  );
}
