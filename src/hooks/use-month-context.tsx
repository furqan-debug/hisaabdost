
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { startOfMonth, format } from 'date-fns';

interface MonthData {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalBalance: number;
  savingsRate: number;
  // Budget-related data
  totalBudget: number;
  remainingBudget: number;
  budgetUsagePercentage: number;
  // Tab states
  activeTab: string;
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
  totalBudget: 0,
  remainingBudget: 0,
  budgetUsagePercentage: 0,
  activeTab: 'overview',
};

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [monthsData, setMonthsData] = useState<Record<string, MonthData>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Update debounce ref
  const updateDebounceRef = useRef<Record<string, number>>({});

  // Load stored data from localStorage on initial render
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const savedData = localStorage.getItem('monthsData');
        if (savedData) {
          setMonthsData(JSON.parse(savedData));
        }
        
        // Add console log to verify data is loaded correctly
        console.log('Loaded months data from localStorage:', savedData);
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
        // Save to storage immediately to ensure persistence
        localStorage.setItem('monthsData', JSON.stringify(updated));
        console.log('Created new month data entry for:', currentMonthKey);
        return updated;
      });
    }
    
    // Reset loading state when month changes to indicate data is ready
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [selectedMonth, monthsData]);

  // Format current month as a key (e.g., "2023-01")
  const getCurrentMonthKey = useCallback(() => format(selectedMonth, 'yyyy-MM'), [selectedMonth]);

  // Get data for current month with fallback to default values
  const getCurrentMonthData = useCallback((): MonthData => {
    const monthKey = getCurrentMonthKey();
    const data = monthsData[monthKey] || { ...DEFAULT_MONTH_DATA };
    
    // Add debug logging
    console.log('Getting current month data for:', monthKey, data);
    
    return data;
  }, [getCurrentMonthKey, monthsData]);

  // Update data for a specific month with debouncing
  const updateMonthData = useCallback((monthKey: string, data: Partial<MonthData>) => {
    // Clear any existing timeout for this month
    if (updateDebounceRef.current[monthKey]) {
      window.clearTimeout(updateDebounceRef.current[monthKey]);
    }
    
    // Debounce the update (reduce frequency of state changes)
    updateDebounceRef.current[monthKey] = window.setTimeout(() => {
      setMonthsData(prevData => {
        const currentData = prevData[monthKey] || { ...DEFAULT_MONTH_DATA };
        
        // Create updated data
        const updatedData = { 
          ...prevData, 
          [monthKey]: { ...currentData, ...data } 
        };
        
        // Debug logging
        console.log('Updating month data for:', monthKey, {
          previous: currentData,
          changes: data,
          new: updatedData[monthKey]
        });
        
        // Save to localStorage immediately
        localStorage.setItem('monthsData', JSON.stringify(updatedData));
        
        return updatedData;
      });
    }, 50); // Reduced debounce time to 50ms for more immediate updates
    
    return () => {
      // Clear any pending timeouts when component unmounts
      if (updateDebounceRef.current[monthKey]) {
        window.clearTimeout(updateDebounceRef.current[monthKey]);
      }
    };
  }, []);

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
