
import React from "react";
import { Calendar } from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MonthSelectorProps {
  selectedMonth: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function MonthSelector({ selectedMonth, onChange, className }: MonthSelectorProps) {
  // Generate last 12 months including current month
  const months = Array.from({ length: 12 }, (_, i) => {
    return subMonths(startOfMonth(new Date()), i);
  });

  const handleChange = (value: string) => {
    const selectedDate = new Date(value);
    onChange(selectedDate);
  };

  return (
    <Select
      value={selectedMonth.toISOString()}
      onValueChange={handleChange}
    >
      <SelectTrigger 
        className={cn(
          "w-auto h-8 px-2 gap-1.5 bg-background/60 backdrop-blur transition-all duration-300",
          "hover:bg-accent/50 focus:ring-1 border-border/40 hover:border-border/70",
          className
        )}
      >
        <Calendar className="h-3.5 w-3.5 text-primary" />
        <SelectValue placeholder={format(selectedMonth, 'MMMM yyyy')}>
          {format(selectedMonth, 'MMMM yyyy')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        className="w-auto min-w-[180px] p-1 animate-scale-in"
      >
        {months.map((month) => {
          const isSelected = month.getMonth() === selectedMonth.getMonth() && 
                           month.getFullYear() === selectedMonth.getFullYear();
          
          return (
            <SelectItem
              key={month.toISOString()}
              value={month.toISOString()}
              className={cn(
                "cursor-pointer transition-colors duration-150 hover:bg-accent rounded-sm px-3",
                isSelected && "bg-accent/40 font-medium text-accent-foreground"
              )}
            >
              {format(month, 'MMMM yyyy')}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
