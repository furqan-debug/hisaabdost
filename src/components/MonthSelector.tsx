
import React, { useMemo } from "react";
import { Calendar } from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => {
      return subMonths(startOfMonth(new Date()), i);
    }),
  []);

  // Group months by year
  const groupedMonths = useMemo(() => {
    const groups: Record<string, Date[]> = {};
    
    months.forEach(month => {
      const year = format(month, 'yyyy');
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(month);
    });
    
    return Object.entries(groups)
      .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)); // Sort years descending
  }, [months]);

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
          "w-full h-9 px-2 gap-1 py-1 transition-all duration-300",
          "bg-accent/20 hover:bg-accent/30 focus:ring-1 border-border/40 hover:border-border/70",
          className
        )}
        aria-label="Select month"
      >
        <Calendar className="h-4 w-4 text-primary" />
        <SelectValue placeholder={format(selectedMonth, 'MMMM yyyy')}>
          {format(selectedMonth, 'MMM yyyy')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="center"
        className="w-auto min-w-[180px] p-1 animate-scale-in max-h-[300px]"
      >
        {groupedMonths.map(([year, yearMonths]) => (
          <SelectGroup key={year}>
            <SelectLabel className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {year}
            </SelectLabel>
            {yearMonths.map((month) => {
              const isSelected = month.getMonth() === selectedMonth.getMonth() && 
                               month.getFullYear() === selectedMonth.getFullYear();
              
              return (
                <SelectItem
                  key={month.toISOString()}
                  value={month.toISOString()}
                  className={cn(
                    "cursor-pointer transition-colors duration-150 hover:bg-accent rounded-sm px-3",
                    isSelected && "bg-primary/10 text-primary font-bold border-l-2 border-primary pl-2"
                  )}
                >
                  {format(month, 'MMMM')}
                </SelectItem>
              );
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
