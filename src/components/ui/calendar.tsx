import * as React from "react";
import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DayPicker,
  CaptionProps
} from "react-day-picker";
import {
  format,
  addMonths,
  subMonths,
  setYear,
  getYear,
  getMonth
} from "date-fns";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(props.defaultMonth || new Date());
  const [showYearPicker, setShowYearPicker] = React.useState(false);

  const handlePrev = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNext = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const handleYearSelect = (year: number) => {
    const updated = setYear(currentMonth, year);
    setCurrentMonth(updated);
    setShowYearPicker(false);
  };

  const renderYearPicker = () => {
    const currentYear = getYear(currentMonth);
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    return (
      <div className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 bg-background rounded-lg shadow-md p-2 max-h-[200px] overflow-y-auto border w-32">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearSelect(year)}
            className={cn(
              "w-full text-sm py-1 px-2 rounded hover:bg-accent text-center",
              year === currentYear && "bg-primary text-primary-foreground"
            )}
          >
            {year}
          </button>
        ))}
      </div>
    );
  };

  function CustomCaption({ displayMonth }: CaptionProps) {
    const year = getYear(displayMonth);

    return (
      <div className="relative flex justify-between items-center px-2 py-3">
        <button
          onClick={handlePrev}
          className="rounded-full p-2 hover:bg-accent/70 transition"
        >
          <ChevronLeft className="h-4 w-4 text-primary" />
        </button>

        <button
          className="text-base sm:text-lg font-semibold text-foreground focus:outline-none"
          onClick={() => setShowYearPicker((prev) => !prev)}
        >
          {format(displayMonth, "MMMM yyyy")}
        </button>

        <button
          onClick={handleNext}
          className="rounded-full p-2 hover:bg-accent/70 transition"
        >
          <ChevronRight className="h-4 w-4 text-primary" />
        </button>

        {showYearPicker && renderYearPicker()}
      </div>
    );
  }

  return (
    <DayPicker
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      showOutsideDays={showOutsideDays}
      className={cn("bg-background rounded-xl p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-2",
        caption: "text-center mb-2",
        head_row: "flex justify-between",
        head_cell: "w-10 text-xs font-medium text-muted-foreground text-center",
        row: "flex justify-between",
        cell: cn(
          "h-10 w-10 text-center text-sm text-foreground rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          "[&:has([aria-selected])]:bg-primary [&:has([aria-selected])]:text-primary-foreground"
        ),
        day: "w-full h-full flex items-center justify-center cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary",
        day_today: "border border-primary text-accent-foreground",
        day_outside: "text-muted-foreground/50",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";
export { Calendar };
