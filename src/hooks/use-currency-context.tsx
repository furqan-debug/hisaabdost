
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type CurrencySymbol = "$" | "₹" | "€" | "£" | "¥" | "₽" | "₩" | "A$" | "C$" | "Fr" | "₺" | "R" | "₴" | "₪" | "Rs";

interface CurrencyContextType {
  currencySymbol: CurrencySymbol;
  setCurrencySymbol: (symbol: CurrencySymbol) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currencySymbol, setCurrencySymbolState] = useState<CurrencySymbol>("$");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved currency preference on mount
  useEffect(() => {
    const loadCurrencyPreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Look for currency preference in the budgets table
        const { data, error } = await supabase
          .from('budgets')
          .select('monthly_income, period')
          .eq('user_id', user.id)
          .eq('category', 'CurrencyPreference')
          .maybeSingle();

        if (error) {
          console.error("Error loading currency preference:", error);
        } else if (data && data.period) {
          // We're using the 'period' field to store the currency symbol
          setCurrencySymbolState(data.period as CurrencySymbol);
        }
      } catch (error) {
        console.error("Error loading currency:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrencyPreference();
  }, [user]);

  // Function to update currency symbol and save to database
  const setCurrencySymbol = async (symbol: CurrencySymbol) => {
    if (!user) return;

    setCurrencySymbolState(symbol);
    
    try {
      // Check if currency preference record exists
      const { data, error: checkError } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', 'CurrencyPreference')
        .maybeSingle();

      if (checkError) {
        console.error("Error checking currency preference:", checkError);
        return;
      }

      if (data) {
        // Update existing record
        const { error } = await supabase
          .from('budgets')
          .update({ period: symbol })
          .eq('id', data.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('budgets')
          .insert({ 
            user_id: user.id, 
            category: 'CurrencyPreference',
            period: symbol,
            amount: 0  // Required field, but not used for our purpose
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving currency preference:", error);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencySymbol,
        setCurrencySymbol
      }}
    >
      {!isLoading && children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
