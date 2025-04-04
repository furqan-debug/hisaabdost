
import React, { createContext, useContext, useState, useEffect } from "react";
import { startOfMonth, subMonths, format } from "date-fns";

// Type for each month's data
interface MonthData {
  totalBudget?: number;
  remainingBudget?: number;
  budgetUsagePercentage?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  totalBalance?: number;
  savingsRate?: number;
  activeTab?: string;
}

type MonthContextType = {
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  isLoading: boolean;
  getCurrentMonthData: () => MonthData;
  updateMonthData: (monthKey: string, data: Partial<MonthData>) => void;
};

// Create an empty initial context
const MonthContext = createContext<MonthContextType | undefined>(undefined);

// Store data for each month
const monthlyDataMap = new Map<string, MonthData>();

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

  // Get the current month's data
  const getCurrentMonthData = (): MonthData => {
    const monthKey = format(selectedMonth, 'yyyy-MM');
    return monthlyDataMap.get(monthKey) || {};
  };

  // Update data for a specific month
  const updateMonthData = (monthKey: string, data: Partial<MonthData>) => {
    const currentData = monthlyDataMap.get(monthKey) || {};
    const newData = { ...currentData, ...data };
    monthlyDataMap.set(monthKey, newData);
  };

  return (
    <MonthContext.Provider 
      value={{ 
        selectedMonth, 
        setSelectedMonth, 
        isLoading,
        getCurrentMonthData,
        updateMonthData
      }}
    >
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
