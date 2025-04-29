import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
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
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const handleDateSelect = (type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    const formattedDate = format(date, "yyyy-MM-dd");
    if (type === 'start') {
      onStartDateChange(formattedDate);
      setStartOpen(false);

      // If start date is after end date or no end date is set,
      // update end date to be the same as start date
      if (endDate && new Date(formattedDate) > new Date(endDate)) {
        onEndDateChange(formattedDate);
        toast.info("End date adjusted to match start date");
      }
    } else {
      onEndDateChange(formattedDate);
      setEndOpen(false);

      // If end date is before start date or no start date is set,
      // update start date to be the same as end date
      if (startDate && new Date(formattedDate) < new Date(startDate)) {
        onStartDateChange(formattedDate);
        toast.info("Start date adjusted to match end date");
      }
    }

    // Notify the user when date range is successfully applied
    if (type === 'start' && endDate || type === 'end' && startDate) {
      toast.success("Date filter applied");
    }
  };
  return <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium text-foreground mb-2">{label}</p>}
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left w-full sm:w-[140px]", !startDate && "text-muted-foreground", startDate && "border-primary/70")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(new Date(startDate), "MMM d, yyyy") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0 bg-background/95 backdrop-blur-sm border border-border date-picker-popover px-[15px] mx-[20px] my-0 py-[2px]">
            <Calendar mode="single" selected={startDate ? new Date(startDate) : undefined} onSelect={date => handleDateSelect('start', date)} initialFocus defaultMonth={startDate ? new Date(startDate) : new Date()} className="mx-[26px] my-[5px]" />
          </PopoverContent>
        </Popover>
        
        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left w-full sm:w-[140px]", !endDate && "text-muted-foreground", endDate && "border-primary/70")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(new Date(endDate), "MMM d, yyyy") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0 bg-background/95 backdrop-blur-sm border border-border date-picker-popover">
            <Calendar mode="single" selected={endDate ? new Date(endDate) : undefined} onSelect={date => handleDateSelect('end', date)} initialFocus defaultMonth={endDate ? new Date(endDate) : new Date()} />
          </PopoverContent>
        </Popover>
        
        {(startDate || endDate) && <Button variant="ghost" size="icon" onClick={() => {
        onClear();
        toast.info("Date filter cleared");
      }} className="h-10 w-10 p-0 sm:self-start" title="Clear date range" aria-label="Clear date range">
            <X className="h-4 w-4" />
          </Button>}
      </div>
    </div>;
}