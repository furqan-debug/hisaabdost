
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  name?: string;
}

export function DateField({ 
  value, 
  onChange, 
  label = "Date", 
  placeholder = "Select date...",
  id = "expense-date",
  name = "date"
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  // Format the displayed date if there's a value
  const displayValue = value ? format(new Date(value), "PP") : "";
  
  // Check if this is today's date
  const today = new Date().toISOString().split('T')[0];
  const isToday = value === today;
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const formattedDate = format(date, "yyyy-MM-dd");
    onChange(formattedDate);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            name={name}
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-start text-left font-normal touch-target",
              !value && "text-muted-foreground",
              isToday && "border-primary/70"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-background/95 backdrop-blur-sm border border-border date-picker-popover" 
          align="start"
        >
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={handleDateSelect}
            initialFocus
            defaultMonth={value ? new Date(value) : new Date()}
          />
        </PopoverContent>
      </Popover>
      {displayValue && (
        <div className={cn(
          "text-xs", 
          isToday ? "text-primary font-medium" : "text-muted-foreground"
        )}>
          {isToday ? "Today" : displayValue}
        </div>
      )}
    </div>
  );
}
