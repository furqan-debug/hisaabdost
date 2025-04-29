
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
import { ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateRangePicker } from "@/components/expenses/DateRangePicker";
import { motion, AnimatePresence } from "framer-motion";

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
  className?: string;
}

export function ExpenseFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  dateRange,
  setDateRange,
  selectedMonth,
  useCustomDateRange,
  className
}: ExpenseFiltersProps) {
  const isMobile = useIsMobile();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const clearDateRange = () => {
    setDateRange({
      start: '',
      end: ''
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search input always visible */}
      <div className="relative">
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10 rounded-lg bg-background/80 border-border/40 placeholder:text-muted-foreground/70"
        />
        {isMobile && (
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground touch-target"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            aria-label={showAdvancedFilters ? "Hide filters" : "Show filters"}
          >
            <Filter size={18} className={cn(showAdvancedFilters ? "text-primary" : "")} />
          </button>
        )}
      </div>
      
      {/* Month filter message */}
      {!useCustomDateRange && (
        <Alert variant="default" className="bg-muted/40 border-border/40 py-2">
          <AlertDescription className="flex items-center text-xs text-muted-foreground">
            Showing expenses for {format(selectedMonth, 'MMMM yyyy')}. Use a custom range to override.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Advanced filters for desktop or when expanded on mobile */}
      <AnimatePresence>
        {(!isMobile || showAdvancedFilters) && (
          <motion.div 
            initial={isMobile ? { opacity: 0, height: 0 } : { opacity: 1 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={isMobile ? { opacity: 0, height: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "space-y-3",
              isMobile ? "p-3 bg-muted/30 rounded-lg border border-border/40 overflow-hidden" : ""
            )}
          >
            <div className={cn(
              isMobile ? "flex-col space-y-3" : "sm:flex sm:items-start sm:justify-between sm:gap-2",
              "flex"
            )}>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className={cn(
                  "rounded-lg bg-background/80 border-border/40",
                  isMobile ? "w-full" : "w-[180px]"
                )}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="touch-scroll-container max-h-[40vh]">
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(CATEGORY_COLORS).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <DateRangePicker 
                startDate={dateRange.start}
                endDate={dateRange.end}
                onStartDateChange={(value) => setDateRange({...dateRange, start: value})}
                onEndDateChange={(value) => setDateRange({...dateRange, end: value})}
                onClear={clearDateRange}
                label=""
                className={cn(
                  isMobile ? "w-full" : "w-auto",
                )}
              />
            </div>
            
            {isMobile && (
              <div className="text-right">
                <button 
                  className="text-xs text-primary flex items-center gap-1 ml-auto touch-target py-2 px-1"
                  onClick={() => setShowAdvancedFilters(false)}
                  aria-label="Hide filters"
                >
                  Hide filters <ChevronDown size={14} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
