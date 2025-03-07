
import React from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-1 h-8 px-2 bg-background/60 backdrop-blur ${className}`}
        >
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{format(selectedMonth, 'MMMM yyyy')}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {months.map((month) => (
          <DropdownMenuItem
            key={month.toISOString()}
            onClick={() => onChange(month)}
            className="cursor-pointer"
          >
            <span className={`${month.getMonth() === selectedMonth.getMonth() && month.getFullYear() === selectedMonth.getFullYear() ? 'font-medium' : ''}`}>
              {format(month, 'MMMM yyyy')}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
