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
  
  // Create stable reference to prevent unnecessary re-renders
  const stableMonthsData = useRef(monthsData);
  
  // Flag to prevent localStorage read-write loops  
  const isUpdatingRef = useRef(false);
  // Debounce timer for localStorage writes
  const localStorageWriteTimer = useRef<number | null>(null);

  // Load stored data from localStorage on initial render only
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const savedData = localStorage.getItem('monthsData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setMonthsData(parsedData);
          stableMonthsData.current = parsedData;
        }
      } catch (error) {
        console.error('Error loading month data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Whenever monthsData state changes, update the ref but don't trigger re-renders
  useEffect(() => {
    // Only update if not in the middle of a controlled update
    if (!isUpdatingRef.current) {
      stableMonthsData.current = monthsData;
      
      // Debounce localStorage writes
      if (localStorageWriteTimer.current) {
        window.clearTimeout(localStorageWriteTimer.current);
      }
      
      localStorageWriteTimer.current = window.setTimeout(() => {
        try {
          localStorage.setItem('monthsData', JSON.stringify(monthsData));
        } catch (error) {
          console.error('Error saving month data to localStorage:', error);
        }
        localStorageWriteTimer.current = null;
      }, 1000); // 1 second debounce
    }
  }, [monthsData]);

  // Whenever selectedMonth changes, ensure we have a default entry for it
  useEffect(() => {
    const currentMonthKey = format(selectedMonth, 'yyyy-MM');
    
    if (!stableMonthsData.current[currentMonthKey]) {
      setMonthsData(prev => {
        const updated = { 
          ...prev, 
          [currentMonthKey]: { ...DEFAULT_MONTH_DATA }
        };
        stableMonthsData.current = updated;
        return updated;
      });
    }
    
    // Reset loading state when month changes
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [selectedMonth]);

  // Format current month as a key (e.g., "2023-01")
  const getCurrentMonthKey = useCallback(() => format(selectedMonth, 'yyyy-MM'), [selectedMonth]);

  // Get data for current month with fallback to default values
  const getCurrentMonthData = useCallback((): MonthData => {
    const monthKey = getCurrentMonthKey();
    return stableMonthsData.current[monthKey] || { ...DEFAULT_MONTH_DATA };
  }, [getCurrentMonthKey]);

  // Update data for a specific month with optimized reactivity and debouncing
  const updateMonthData = useCallback((monthKey: string, data: Partial<MonthData>) => {
    // Prevent potential update loops
    if (isUpdatingRef.current) {
      return;
    }
    
    // Set flag to prevent loop
    isUpdatingRef.current = true;
    
    setMonthsData(prevData => {
      const currentData = prevData[monthKey] || { ...DEFAULT_MONTH_DATA };
      const updatedMonthData = { ...currentData, ...data };
      
      // Only update if something actually changed
      const hasChanges = Object.keys(data).some(key => 
        data[key as keyof MonthData] !== currentData[key as keyof MonthData]
      );
      
      if (!hasChanges) {
        isUpdatingRef.current = false;
        return prevData; // No changes, return previous state
      }
      
      // Create updated data object with the new month data
      const updatedData = { 
        ...prevData, 
        [monthKey]: updatedMonthData 
      };
      
      // Update ref immediately to keep it in sync
      stableMonthsData.current = updatedData;
      
      // Schedule a localStorage update with debounce
      if (localStorageWriteTimer.current) {
        window.clearTimeout(localStorageWriteTimer.current);
      }
      
      localStorageWriteTimer.current = window.setTimeout(() => {
        localStorage.setItem('monthsData', JSON.stringify(updatedData));
        localStorageWriteTimer.current = null;
      }, 1000);
      
      // Reset flag after state update
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
      
      return updatedData;
    });
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
