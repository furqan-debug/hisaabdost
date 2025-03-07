
import React from "react";
import { format, subMonths } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface DateRange {
  start: string;
  end: string;
}

interface MonthSelectorProps {
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
}

export function MonthSelector({ selectedMonth, setSelectedMonth }: MonthSelectorProps) {
  const isMobile = useIsMobile();
  
  // Generate the last 12 months as options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: date.toISOString(),
      label: format(date, "MMMM yyyy")
    };
  });

  const handleMonthSelect = (value: string) => {
    setSelectedMonth(new Date(value));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={isMobile ? "icon-sm" : "sm"} 
          className="gap-1 hover:bg-muted transition-all duration-300"
        >
          <Calendar className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4 mr-1'}`} />
          {!isMobile && (
            <span className="font-medium">{format(selectedMonth, "MMMM yyyy")}</span>
          )}
          {!isMobile && <ChevronDown className="h-3.5 w-3.5 ml-1" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover">
        {monthOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleMonthSelect(option.value)}
            className={`${
              format(selectedMonth, "MMMM yyyy") === option.label
                ? "bg-muted"
                : ""
            } cursor-pointer`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
