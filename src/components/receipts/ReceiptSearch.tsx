
import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar, DollarSign, Store } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardViewportFix } from '@/hooks/useKeyboardViewportFix';

interface ReceiptSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export interface SearchFilters {
  searchTerm: string;
  dateRange?: DateRange;
  minAmount?: number;
  maxAmount?: number;
  merchant?: string;
  category?: string;
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Other'
];

export function ReceiptSearch({ onSearch, onClear }: ReceiptSearchProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Enable keyboard viewport fix for mobile
  useKeyboardViewportFix({
    sheetRef: containerRef,
    scrollRef: scrollRef,
    enabled: isMobile
  });

  const hasActiveFilters = () => {
    return searchTerm || dateRange || minAmount || maxAmount || merchant || category;
  };

  const handleSearch = () => {
    const filters: SearchFilters = {
      searchTerm,
      dateRange,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      merchant: merchant || undefined,
      category: category || undefined,
    };
    onSearch(filters);
  };

  const handleClear = () => {
    setSearchTerm('');
    setDateRange(undefined);
    setMinAmount('');
    setMaxAmount('');
    setMerchant('');
    setCategory('');
    onClear();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (dateRange) count++;
    if (minAmount || maxAmount) count++;
    if (merchant) count++;
    if (category) count++;
    return count;
  };

  return (
    <Card ref={containerRef}>
      <CardContent className="p-4 space-y-4">
        <div ref={scrollRef} className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search receipts by merchant, description, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={(e) => {
                  // Ensure search input is visible on mobile when keyboard appears
                  if (isMobile) {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 150);
                  }
                }}
              />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
          <Button onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Amount Range
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Merchant */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Merchant
                </label>
                <Input
                  placeholder="Enter merchant name"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSearch} size="sm">
                Apply Filters
              </Button>
              {hasActiveFilters() && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {searchTerm && (
                  <Badge variant="secondary">
                    Search: {searchTerm}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setSearchTerm('')}
                    />
                  </Badge>
                )}
                {dateRange && (
                  <Badge variant="secondary">
                    Date range selected
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setDateRange(undefined)}
                    />
                  </Badge>
                )}
                {(minAmount || maxAmount) && (
                  <Badge variant="secondary">
                    Amount: {minAmount || '0'} - {maxAmount || '∞'}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => {
                        setMinAmount('');
                        setMaxAmount('');
                      }}
                    />
                  </Badge>
                )}
                {merchant && (
                  <Badge variant="secondary">
                    Merchant: {merchant}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setMerchant('')}
                    />
                  </Badge>
                )}
                {category && (
                  <Badge variant="secondary">
                    Category: {category}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setCategory('')}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
