
// src/components/Footer.tsx
import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-2">
      <div className="container flex flex-col items-center justify-between gap-1 md:h-10 md:flex-row">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Chatiwy. All rights reserved.
        </p>
        <div className="flex items-center gap-1">
          <a 
            href="#" 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:underline flex items-center gap-1"
          >
            Terms <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-muted-foreground">·</span>
          <a 
            href="#" 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:underline flex items-center gap-1"
          >
            Privacy <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-muted-foreground">·</span>
          <a 
            href="#" 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:underline flex items-center"
          >
            Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> by Chatiwy Team
          </a>
        </div>
      </div>
    </footer>
  );
}
