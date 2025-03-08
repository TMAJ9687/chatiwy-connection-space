
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface FiltersPanelProps {
  ageRange: [number, number];
  countryFilter: string[];
  getCountryFlag: (countryName?: string) => string;
  onAgeRangeChange: (value: number[]) => void;
  toggleCountryFilter: (country: string) => void;
  clearFilters: () => void;
  onClose: () => void;
}

export function FiltersPanel({
  ageRange,
  countryFilter,
  getCountryFlag,
  onAgeRangeChange,
  toggleCountryFilter,
  clearFilters,
  onClose
}: FiltersPanelProps) {
  return (
    <div className="mt-3 p-3 border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Advanced Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">
            Age Range: {ageRange[0]} - {ageRange[1]}
          </label>
          <div className="pt-2 px-1">
            <Slider
              value={[ageRange[0], ageRange[1]]}
              min={18}
              max={80}
              step={1}
              onValueChange={onAgeRangeChange}
            />
          </div>
        </div>
        
        {countryFilter.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Selected Countries:</label>
            <div className="flex flex-wrap gap-1">
              {countryFilter.map(country => (
                <Badge key={country} variant="outline" className="flex items-center gap-1">
                  <span>{getCountryFlag(country)}</span> {country}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 ml-1" 
                    onClick={() => toggleCountryFilter(country)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={clearFilters}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}
