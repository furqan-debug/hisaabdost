import * as React from "react";
import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DayPicker,
  CaptionProps
} from "react-day-picker";
import { format, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(props.defaultMonth || new Date());

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  function CustomCaption({ displayMonth }: CaptionProps) {
    return (
      <div className="flex justify-between items-center px-4 py-2">
        <button
          onClick={handlePrevMonth}
          className="bg-orange-400 text-white rounded-full p-2 hover:bg-orange-500 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">
          {format(displayMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={handleNextMonth}
          className="bg-orange-400 text-white rounded-full p-2 hover:bg-orange-500 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <DayPicker
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      showOutsideDays={showOutsideDays}
      className={cn("bg-white rounded-xl shadow-sm p-4", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-2",
        caption: "text-center mb-4",
        head_row: "flex justify-between",
        head_cell: "w-10 text-xs font-medium text-gray-400 text-center",
        row: "flex justify-between",
        cell: cn(
          "h-10 w-10 text-center text-sm text-gray-700 rounded-full",
          "focus:outline-none focus:ring-2 focus:ring-orange-400",
          "[&:has([aria-selected])]:bg-orange-400 [&:has([aria-selected])]:text-white"
        ),
        day: "w-full h-full flex items-center justify-center cursor-pointer rounded-full hover:bg-orange-100",
        day_selected: "bg-orange-400 text-white hover:bg-orange-500",
        day_today: "border border-orange-400 text-orange-600",
        day_outside: "text-gray-300",
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
