
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, subMonths, addMonths } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface MonthSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ selectedDate, onChange }: MonthSelectorProps) {
  const isMobile = useIsMobile();
  
  const handlePrevMonth = () => {
    onChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onChange(addMonths(selectedDate, 1));
  };

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  // Generate years (5 years back, 5 years forward)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // Month names
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthChange = (value: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(value));
    onChange(newDate);
  };

  const handleYearChange = (value: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(value));
    onChange(newDate);
  };

  return (
    <div className="flex items-center gap-2 justify-between md:justify-start w-full md:w-auto">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {isMobile ? (
          <div className="font-medium">
            {format(selectedDate, "MMM yyyy")}
          </div>
        ) : (
          <div className="flex gap-2">
            <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[90px] h-8">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {isMobile && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onChange(new Date())}
          className="text-xs h-8"
        >
          Today
        </Button>
      )}
    </div>
  );
}
