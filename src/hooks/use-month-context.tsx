
import React, { createContext, useContext, useState, useEffect } from "react";
import { startOfMonth, subMonths } from "date-fns";

type MonthContextType = {
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  isLoading: boolean;
};

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export const MonthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [isLoading, setIsLoading] = useState(false);

  // Effect to simulate data loading when month changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedMonth]);

  return (
    <MonthContext.Provider value={{ selectedMonth, setSelectedMonth, isLoading }}>
      {children}
    </MonthContext.Provider>
  );
};

export const useMonthContext = () => {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error("useMonthContext must be used within a MonthProvider");
  }
  return context;
};
