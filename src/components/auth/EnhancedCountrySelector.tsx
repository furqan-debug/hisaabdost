import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Check, ChevronDown, Loader2 } from 'lucide-react';
import { countries, popularCountries, Country } from '@/data/countries';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

interface EnhancedCountrySelectorProps {
  value: string;
  onChange: (dialCode: string, country: Country) => void;
  className?: string;
}

export const EnhancedCountrySelector = ({ value, onChange, className }: EnhancedCountrySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { detectLocation, loading: locationLoading, isSupported } = useGeolocation();

  const selectedCountry = countries.find(country => country.dialCode === value);
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    country.dialCode.includes(searchValue) ||
    country.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    onChange(country.dialCode, country);
    setOpen(false);
    setSearchValue('');
  };

  const handleLocationDetect = async () => {
    const detectedCountry = await detectLocation();
    if (detectedCountry) {
      onChange(detectedCountry.dialCode, detectedCountry);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-background/50 border-border/50 hover:bg-background/70 hover:border-border/70 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200",
            className
          )}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {selectedCountry ? (
              <>
                <span className="text-lg flex-shrink-0">{selectedCountry.flag}</span>
                <span className="font-mono text-sm flex-shrink-0">{selectedCountry.dialCode}</span>
                <span className="text-sm text-muted-foreground truncate hidden sm:block">
                  {selectedCountry.name}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Select country...</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 bg-popover/95 backdrop-blur-sm border-border/50" align="start">
        <Command className="bg-transparent">
          <div className="border-b border-border/30 p-2">
            <CommandInput 
              placeholder="Search countries..." 
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-0 focus:ring-0 bg-transparent"
            />
            
            {/* Location Detection Button */}
            {isSupported && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLocationDetect}
                  disabled={locationLoading}
                  className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                >
                  {locationLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  {locationLoading ? 'Detecting location...' : 'Detect my location'}
                </Button>
              </motion.div>
            )}
          </div>

          <CommandList className="max-h-80">
            <CommandEmpty>No country found.</CommandEmpty>
            
            {/* Popular Countries */}
            {!searchValue && (
              <CommandGroup heading="Popular">
                {popularCountries.map((country) => (
                  <CommandItem
                    key={`popular-${country.code}-${country.dialCode}`}
                    value={`${country.name} ${country.dialCode} ${country.code}`}
                    onSelect={() => handleSelect(country)}
                    className="flex items-center justify-between cursor-pointer hover:bg-accent/50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{country.flag}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{country.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{country.dialCode}</span>
                      </div>
                    </div>
                    <AnimatePresence>
                      {selectedCountry?.dialCode === country.dialCode && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="h-4 w-4 text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* All Countries */}
            <CommandGroup heading={searchValue ? "Results" : "All Countries"}>
              {filteredCountries.map((country) => (
                <CommandItem
                  key={`${country.code}-${country.dialCode}`}
                  value={`${country.name} ${country.dialCode} ${country.code}`}
                  onSelect={() => handleSelect(country)}
                  className="flex items-center justify-between cursor-pointer hover:bg-accent/50"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{country.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{country.dialCode}</span>
                    </div>
                  </div>
                  <AnimatePresence>
                    {selectedCountry?.dialCode === country.dialCode && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};