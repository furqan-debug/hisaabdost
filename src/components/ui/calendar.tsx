
import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, setYear, getYear } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(props.defaultMonth || new Date());

  // Custom caption component with month/year dropdown
  function CustomCaption({ 
    displayMonth, 
    goToMonth 
  }: { 
    displayMonth: Date;
    goToMonth: (month: Date) => void;
  }) {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = getYear(displayMonth);
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    // Handle month change
    const handleMonthChange = (month: string) => {
      const newMonth = months.indexOf(month);
      const newDate = new Date(displayMonth);
      newDate.setMonth(newMonth);
      goToMonth(newDate);
      setCurrentMonth(newDate);
    };

    // Handle year change
    const handleYearChange = (year: string) => {
      const newDate = setYear(displayMonth, parseInt(year));
      goToMonth(newDate);
      setCurrentMonth(newDate);
    };

    return (
      <div className="flex items-center justify-center space-x-2">
        <Select
          value={months[displayMonth.getMonth()]}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="h-8 w-[110px] text-xs sm:text-sm font-medium bg-background">
            <SelectValue>{months[displayMonth.getMonth()]}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {months.map((month) => (
              <SelectItem key={month} value={month} className="text-xs sm:text-sm cursor-pointer">
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={currentYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="h-8 w-[80px] text-xs sm:text-sm font-medium bg-background">
            <SelectValue>{currentYear}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {years.map((year) => (
              <SelectItem 
                key={year} 
                value={year.toString()} 
                className="text-xs sm:text-sm cursor-pointer"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex relative items-center justify-between pt-1 pb-3",
        caption_label: "text-sm font-medium text-foreground hidden", // Hide default label as we use custom
        caption_dropdowns: "flex gap-1 text-sm",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent border border-border p-0 opacity-80 hover:opacity-100 transition-opacity"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] sm:text-sm text-center",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50 rounded-md",
          "h-9 w-9 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        day_today: "border border-primary text-accent-foreground",
        day_outside: "text-muted-foreground/50 opacity-50 aria-selected:bg-accent/40 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/40 opacity-40",
        day_range_middle: "aria-selected:bg-accent/80 aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth, goToMonth }) => (
          <CustomCaption displayMonth={displayMonth} goToMonth={goToMonth} />
        ),
      }}
      onMonthChange={setCurrentMonth}
      month={currentMonth}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
