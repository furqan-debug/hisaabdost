
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Save, Clock } from 'lucide-react';
import { CATEGORY_COLORS } from '@/utils/chartUtils';
import { DateRangePicker } from './DateRangePicker';

interface FilterState {
  searchTerm: string;
  categories: string[];
  amountRange: {
    min: string;
    max: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  paymentMethods: string[];
  hasReceipt: boolean | null;
  hasNotes: boolean | null;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

interface AdvancedExpenseFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export function AdvancedExpenseFilters({ onFiltersChange, currentFilters }: AdvancedExpenseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    const saved = localStorage.getItem('expense-filters');
    return saved ? JSON.parse(saved) : [];
  });

  const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Digital Wallet', 'Check'];

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...currentFilters, ...updates };
    onFiltersChange(newFilters);
  };

  const toggleCategory = (category: string) => {
    const categories = currentFilters.categories.includes(category)
      ? currentFilters.categories.filter(c => c !== category)
      : [...currentFilters.categories, category];
    updateFilters({ categories });
  };

  const togglePaymentMethod = (method: string) => {
    const methods = currentFilters.paymentMethods.includes(method)
      ? currentFilters.paymentMethods.filter(m => m !== method)
      : [...currentFilters.paymentMethods, method];
    updateFilters({ paymentMethods: methods });
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterState = {
      searchTerm: '',
      categories: [],
      amountRange: { min: '', max: '' },
      dateRange: { start: '', end: '' },
      paymentMethods: [],
      hasReceipt: null,
      hasNotes: null
    };
    onFiltersChange(emptyFilters);
  };

  const saveCurrentFilters = () => {
    if (!saveFilterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: saveFilterName,
      filters: currentFilters,
      createdAt: new Date().toISOString()
    };
    
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('expense-filters', JSON.stringify(updated));
    setSaveFilterName('');
  };

  const loadSavedFilter = (filter: SavedFilter) => {
    onFiltersChange(filter.filters);
  };

  const deleteSavedFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('expense-filters', JSON.stringify(updated));
  };

  const hasActiveFilters = currentFilters.searchTerm ||
    currentFilters.categories.length > 0 ||
    currentFilters.amountRange.min ||
    currentFilters.amountRange.max ||
    currentFilters.dateRange.start ||
    currentFilters.dateRange.end ||
    currentFilters.paymentMethods.length > 0 ||
    currentFilters.hasReceipt !== null ||
    currentFilters.hasNotes !== null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search & Filters
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <div>
          <Label>Search</Label>
          <Input
            placeholder="Search by description, merchant, or notes..."
            value={currentFilters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {currentFilters.categories.map(category => (
              <Badge key={category} variant="secondary" className="gap-1">
                {category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleCategory(category)}
                />
              </Badge>
            ))}
            {currentFilters.paymentMethods.map(method => (
              <Badge key={method} variant="outline" className="gap-1">
                {method}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => togglePaymentMethod(method)}
                />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Categories */}
            <div>
              <Label>Categories</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {Object.keys(CATEGORY_COLORS).map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={currentFilters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={currentFilters.amountRange.min}
                  onChange={(e) => updateFilters({
                    amountRange: { ...currentFilters.amountRange, min: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Max Amount</Label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  value={currentFilters.amountRange.max}
                  onChange={(e) => updateFilters({
                    amountRange: { ...currentFilters.amountRange, max: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <Label>Date Range</Label>
              <DateRangePicker
                startDate={currentFilters.dateRange.start}
                endDate={currentFilters.dateRange.end}
                onStartDateChange={(value) => updateFilters({
                  dateRange: { ...currentFilters.dateRange, start: value }
                })}
                onEndDateChange={(value) => updateFilters({
                  dateRange: { ...currentFilters.dateRange, end: value }
                })}
                onClear={() => updateFilters({ dateRange: { start: '', end: '' } })}
                className="mt-1"
              />
            </div>

            {/* Payment Methods */}
            <div>
              <Label>Payment Methods</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {paymentMethods.map(method => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={`payment-${method}`}
                      checked={currentFilters.paymentMethods.includes(method)}
                      onCheckedChange={() => togglePaymentMethod(method)}
                    />
                    <Label htmlFor={`payment-${method}`} className="text-sm">
                      {method}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div className="space-y-2">
              <Label>Additional Filters</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-receipt"
                    checked={currentFilters.hasReceipt === true}
                    onCheckedChange={(checked) => 
                      updateFilters({ hasReceipt: checked ? true : null })
                    }
                  />
                  <Label htmlFor="has-receipt" className="text-sm">
                    Has Receipt
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-notes"
                    checked={currentFilters.hasNotes === true}
                    onCheckedChange={(checked) => 
                      updateFilters({ hasNotes: checked ? true : null })
                    }
                  />
                  <Label htmlFor="has-notes" className="text-sm">
                    Has Notes
                  </Label>
                </div>
              </div>
            </div>

            {/* Save Filters */}
            <div className="border-t pt-4">
              <Label>Save Current Filter</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Filter name..."
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                />
                <Button 
                  onClick={saveCurrentFilters}
                  disabled={!saveFilterName.trim()}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div>
                <Label>Saved Filters</Label>
                <div className="space-y-2 mt-2">
                  {savedFilters.map(filter => (
                    <div key={filter.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{filter.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadSavedFilter(filter)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavedFilter(filter.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
