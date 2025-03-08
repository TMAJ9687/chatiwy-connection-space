
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ searchQuery, onChange }: SearchBarProps) {
  return (
    <div className="relative mt-2">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search users..."
        className="pl-8"
        value={searchQuery}
        onChange={onChange}
      />
    </div>
  );
}
