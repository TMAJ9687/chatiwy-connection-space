
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, SlidersHorizontal } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';
import { FilterMenu } from './FilterMenu';

interface CardHeaderProps {
  connectedUsersCount: number;
  socketConnected: boolean;
  showFilters: boolean;
  filter: string;
  countryFilter: string[];
  availableCountries: string[];
  onFilterChange: (filter: string) => void;
  toggleCountryFilter: (country: string) => void;
  clearFilters: () => void;
  getCountryFlag: (countryName?: string) => string;
  onToggleFilters: () => void;
}

export function UsersCardHeader({
  connectedUsersCount,
  socketConnected,
  showFilters,
  filter,
  countryFilter,
  availableCountries,
  onFilterChange,
  toggleCountryFilter,
  clearFilters,
  getCountryFlag,
  onToggleFilters
}: CardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="text-lg font-medium">Users</CardTitle>
        <Badge variant="secondary" className="ml-1">
          {connectedUsersCount} online
        </Badge>
        {socketConnected && (
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900">Live</Badge>
        )}
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleFilters}
          className={showFilters ? "bg-accent" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <FilterMenu 
          filter={filter}
          countryFilter={countryFilter}
          availableCountries={availableCountries}
          onFilterChange={onFilterChange}
          toggleCountryFilter={toggleCountryFilter}
          clearFilters={clearFilters}
          getCountryFlag={getCountryFlag}
        />
      </div>
    </div>
  );
}
