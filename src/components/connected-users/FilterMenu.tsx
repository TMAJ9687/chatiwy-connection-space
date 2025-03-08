
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

interface FilterMenuProps {
  filter: string;
  countryFilter: string[];
  availableCountries: string[];
  onFilterChange: (filter: string) => void;
  toggleCountryFilter: (country: string) => void;
  clearFilters: () => void;
  getCountryFlag: (countryName?: string) => string;
}

export function FilterMenu({
  filter,
  countryFilter,
  availableCountries,
  onFilterChange,
  toggleCountryFilter,
  clearFilters,
  getCountryFlag
}: FilterMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[60vh] overflow-auto">
        <DropdownMenuLabel>User Filters</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className={filter === 'all' ? 'bg-accent' : ''}
            onClick={() => onFilterChange('all')}
          >
            All Users
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={filter === 'online' ? 'bg-accent' : ''}
            onClick={() => onFilterChange('online')}
          >
            Online Only
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className={filter === 'male' ? 'bg-accent' : ''}
            onClick={() => onFilterChange('male')}
          >
            Male
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={filter === 'female' ? 'bg-accent' : ''}
            onClick={() => onFilterChange('female')}
          >
            Female
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Countries</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableCountries.map(country => (
          <DropdownMenuCheckboxItem
            key={country}
            checked={countryFilter.includes(country)}
            onCheckedChange={() => toggleCountryFilter(country)}
          >
            <span className="mr-2">{getCountryFlag(country)}</span>
            {country}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={clearFilters}>
          Clear Filters
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
