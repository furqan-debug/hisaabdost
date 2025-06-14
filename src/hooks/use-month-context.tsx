import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { startOfMonth, format } from 'date-fns';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface MonthData {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalBalance: number;
  savingsRate: number;
  walletBalance: number; // Added walletBalance
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
  incomeDate: number; // Added incomeDate
}

const DEFAULT_MONTH_DATA: MonthData = {
  monthlyIncome: 0,
  monthlyExpenses: 0,
  totalBalance: 0,
  savingsRate: 0,
  walletBalance: 0, // Added walletBalance default
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
  const [incomeDate, setIncomeDate] = React.useState<number>(1);

  const { user } = useAuth();

  // Fetch income date from profile
  const { data: incomeDateData } = useQuery({
    queryKey: ["profile-income-date", user?.id],
    queryFn: async () => {
      if (!user) return 1;
      const { data, error } = await supabase
        .from("profiles")
        .select("income_date")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data?.income_date ?? 1;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Set incomeDate state when query data changes
  useEffect(() => {
    if (incomeDateData !== undefined) {
      setIncomeDate(incomeDateData);
    }
  }, [incomeDateData]);

  // Update debounce ref
  const updateDebounceRef = useRef<Record<string, number>>({});

  // Load stored data from localStorage on initial render
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const savedData = localStorage.getItem('monthsData');
        if (savedData) {
          console.log("Loading cached month data from localStorage");
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
        // Save to storage with slight delay to avoid rapid writes
        setTimeout(() => {
          localStorage.setItem('monthsData', JSON.stringify(updated));
        }, 100);
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
    return monthsData[monthKey] || { ...DEFAULT_MONTH_DATA };
  }, [getCurrentMonthKey, monthsData]);

  // Update data for a specific month with debouncing
  const updateMonthData = useCallback((monthKey: string, data: Partial<MonthData>) => {
    console.log(`Updating month data for ${monthKey}:`, data);
    
    // Clear any existing timeout for this month
    if (updateDebounceRef.current[monthKey]) {
      window.clearTimeout(updateDebounceRef.current[monthKey]);
    }
    
    // Debounce the update (reduce frequency of state changes)
    updateDebounceRef.current[monthKey] = window.setTimeout(() => {
      setMonthsData(prevData => {
        const currentData = prevData[monthKey] || { ...DEFAULT_MONTH_DATA };
        
        // Check if data is actually different before updating
        const isDataDifferent = Object.entries(data).some(([key, value]) => {
          const typedKey = key as keyof MonthData;
          return Math.abs(Number(currentData[typedKey]) - Number(value)) > 0.01;
        });
        
        if (!isDataDifferent) return prevData;
        
        const updatedData = { 
          ...prevData, 
          [monthKey]: { ...currentData, ...data } 
        };
        
        // Save to localStorage whenever data changes
        console.log("Saving updated month data to localStorage:", updatedData);
        localStorage.setItem('monthsData', JSON.stringify(updatedData));
        
        return updatedData;
      });
    }, 150); // Debounce for 150ms
  }, []);

  return (
    <MonthContext.Provider value={{ 
      selectedMonth, 
      setSelectedMonth, 
      monthsData, 
      updateMonthData, 
      getCurrentMonthData,
      isLoading,
      incomeDate // Now included in context for use elsewhere if needed
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
