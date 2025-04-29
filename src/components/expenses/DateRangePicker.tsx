
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
  label?: string;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  label = "Date Range",
  className
}: DateRangePickerProps) {
  const handleDateSelect = (type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    
    const formattedDate = format(date, "yyyy-MM-dd");
    
    if (type === 'start') {
      onStartDateChange(formattedDate);
    } else {
      onEndDateChange(formattedDate);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              className={cn(
                "justify-start text-left w-full sm:w-40",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                format(new Date(startDate), "MMM d, yyyy")
              ) : (
                "Start Date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date) => handleDateSelect('start', date)}
              initialFocus
              disabled={(date) => 
                endDate ? date > new Date(endDate) : false
              }
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              className={cn(
                "justify-start text-left w-full sm:w-40",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? (
                format(new Date(endDate), "MMM d, yyyy")
              ) : (
                "End Date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate ? new Date(endDate) : undefined}
              onSelect={(date) => handleDateSelect('end', date)}
              initialFocus
              disabled={(date) => 
                startDate ? date < new Date(startDate) : false
              }
            />
          </PopoverContent>
        </Popover>
        
        {(startDate || endDate) && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClear}
            className="h-10 w-10 p-0 sm:self-start"
            title="Clear date range"
            aria-label="Clear date range"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
