import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps } from "react-day-picker";
import { format, addMonths, subMonths, setYear, getYear, getMonth, setMonth } from "date-fns";
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
  const [showMonthPicker, setShowMonthPicker] = React.useState(false);

  const handlePrev = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNext = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const handleYearSelect = (year: number) => {
    const updated = setYear(currentMonth, year);
    setCurrentMonth(updated);
    setShowYearPicker(false);
    setShowMonthPicker(false);
  };

  const handleMonthSelect = (month: number) => {
    const updated = setMonth(currentMonth, month);
    setCurrentMonth(updated);
    setShowMonthPicker(false);
    setShowYearPicker(false);
  };

  const renderBackdrop = () => (
    <motion.div
      className="fixed inset-0 bg-black/30 z-10 sm:rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  );

  const renderYearPicker = () => {
    const currentYear = getYear(currentMonth);
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative z-20 mt-2 bg-background rounded-lg shadow-inner border w-full max-h-[200px] overflow-y-auto"
      >
        <div className="grid grid-cols-3 gap-2 p-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className={cn(
                "text-sm py-1 rounded hover:bg-accent text-center",
                year === currentYear && "bg-primary text-primary-foreground"
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderMonthPicker = () => {
    const currentMonthIndex = getMonth(currentMonth);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative z-20 mt-2 bg-background rounded-lg shadow-inner border w-full max-h-[200px] overflow-y-auto"
      >
        <div className="grid grid-cols-3 gap-2 p-2">
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthSelect(index)}
              className={cn(
                "text-sm py-1 rounded hover:bg-accent text-center",
                index === currentMonthIndex && "bg-primary text-primary-foreground"
              )}
            >
              {month}
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  function CustomCaption({ displayMonth }: CaptionProps) {
    const year = getYear(displayMonth);
    const month = format(displayMonth, "MMMM");

    return (
      <div className="flex flex-col items-center relative">
        <div className="flex justify-between items-center w-full px-2 py-3">
          <button
            onClick={handlePrev}
            className="rounded-full p-2 hover:bg-accent/70 transition"
          >
            <ChevronLeft className="h-4 w-4 text-primary" />
          </button>

          <div className="flex flex-col items-center gap-1">
            <button
              className="text-base sm:text-lg font-semibold text-foreground focus:outline-none"
              onClick={() => {
                setShowMonthPicker((prev) => !prev);
                setShowYearPicker(false);
              }}
            >
              {month}
            </button>
            <button
              className="text-sm text-muted-foreground focus:outline-none"
              onClick={() => {
                setShowYearPicker((prev) => !prev);
                setShowMonthPicker(false);
              }}
            >
              {year}
            </button>
          </div>

          <button
            onClick={handleNext}
            className="rounded-full p-2 hover:bg-accent/70 transition"
          >
            <ChevronRight className="h-4 w-4 text-primary" />
          </button>
        </div>

        <AnimatePresence>{(showMonthPicker || showYearPicker) && renderBackdrop()}</AnimatePresence>
        <AnimatePresence>{showMonthPicker && renderMonthPicker()}</AnimatePresence>
        <AnimatePresence>{showYearPicker && renderYearPicker()}</AnimatePresence>
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
