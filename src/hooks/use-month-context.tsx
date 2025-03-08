
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { startOfMonth, format } from 'date-fns';

interface MonthData {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalBalance: number;
  savingsRate: number;
  // Add other financial data here as needed
}

interface MonthContextType {
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  monthsData: Record<string, MonthData>;
  updateMonthData: (monthKey: string, data: Partial<MonthData>) => void;
  getCurrentMonthData: () => MonthData;
  isLoading: boolean;
}

const DEFAULT_MONTH_DATA: MonthData = {
  monthlyIncome: 0,
  monthlyExpenses: 0,
  totalBalance: 0,
  savingsRate: 0,
};

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [monthsData, setMonthsData] = useState<Record<string, MonthData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load stored data from localStorage on initial render
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const savedData = localStorage.getItem('monthsData');
        if (savedData) {
          setMonthsData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Error loading month data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Whenever selectedMonth changes, ensure we have a default entry for it
  useEffect(() => {
    const currentMonthKey = format(selectedMonth, 'yyyy-MM');
    
    if (!monthsData[currentMonthKey]) {
      setMonthsData(prev => {
        const updated = { 
          ...prev, 
          [currentMonthKey]: { ...DEFAULT_MONTH_DATA }
        };
        localStorage.setItem('monthsData', JSON.stringify(updated));
        return updated;
      });
    }
  }, [selectedMonth, monthsData]);

  // Format current month as a key (e.g., "2023-01")
  const getCurrentMonthKey = () => format(selectedMonth, 'yyyy-MM');

  // Get data for current month with fallback to default values
  const getCurrentMonthData = (): MonthData => {
    const monthKey = getCurrentMonthKey();
    return monthsData[monthKey] || { ...DEFAULT_MONTH_DATA };
  };

  // Update data for a specific month
  const updateMonthData = (monthKey: string, data: Partial<MonthData>) => {
    setMonthsData(prevData => {
      const currentData = prevData[monthKey] || { ...DEFAULT_MONTH_DATA };
      const updatedData = { ...prevData, [monthKey]: { ...currentData, ...data } };
      
      // Save to localStorage whenever data changes
      localStorage.setItem('monthsData', JSON.stringify(updatedData));
      
      return updatedData;
    });
  };

  return (
    <MonthContext.Provider value={{ 
      selectedMonth, 
      setSelectedMonth, 
      monthsData, 
      updateMonthData, 
      getCurrentMonthData,
      isLoading
    }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonthContext() {
  const context = useContext(MonthContext);
  
  if (context === undefined) {
    throw new Error('useMonthContext must be used within a MonthProvider');
  }
  
  return context;
}
