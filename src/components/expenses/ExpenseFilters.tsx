
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChevronDown, Filter, Calendar } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExpenseFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  dateRange: {
    start: string;
    end: string;
  };
  setDateRange: (dateRange: { start: string; end: string; }) => void;
  selectedMonth: Date;
  useCustomDateRange: boolean;
}

export function ExpenseFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  dateRange,
  setDateRange,
  selectedMonth,
  useCustomDateRange
}: ExpenseFiltersProps) {
  const isMobile = useIsMobile();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="space-y-3">
      {/* Search input always visible */}
      <div className="relative">
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-8 rounded-lg"
        />
        {isMobile && (
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter size={18} className={cn(showAdvancedFilters ? "text-primary" : "")} />
          </button>
        )}
      </div>
      
      {/* Month filter message */}
      {!useCustomDateRange && (
        <Alert variant="default" className="bg-muted/40 border-border/40 py-2">
          <AlertDescription className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1 text-primary" />
            Showing expenses for {format(selectedMonth, 'MMMM yyyy')}. Use a custom range to override.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Advanced filters for desktop or when expanded on mobile */}
      {(!isMobile || showAdvancedFilters) && (
        <div className={cn(
          "space-y-3 animated-fade-in",
          isMobile ? "p-2 bg-muted/30 rounded-lg border border-border/40" : ""
        )}>
          <div className={cn(
            isMobile ? "flex-col space-y-2" : "sm:flex-row sm:items-center sm:justify-between gap-2",
            "flex"
          )}>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className={cn(
                "rounded-lg",
                isMobile ? "w-full" : "w-[180px]"
              )}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.keys(CATEGORY_COLORS).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className={cn(
              "flex gap-2",
              isMobile ? "justify-between" : ""
            )}>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  start: e.target.value
                })}
                className={cn(
                  "rounded-lg",
                  isMobile ? "w-[48%]" : "w-auto"
                )}
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  end: e.target.value
                })}
                className={cn(
                  "rounded-lg",
                  isMobile ? "w-[48%]" : "w-auto"
                )}
              />
            </div>
          </div>
          
          {isMobile && (
            <div className="text-right">
              <button 
                className="text-xs text-primary flex items-center gap-1 ml-auto"
                onClick={() => setShowAdvancedFilters(false)}
              >
                Hide filters <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
