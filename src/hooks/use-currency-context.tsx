
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type CurrencySymbol = "$" | "₹" | "€" | "£" | "¥";

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
        const { data, error } = await supabase
          .from('user_preferences')
          .select('currency_symbol')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error loading currency preference:", error);
        } else if (data && data.currency_symbol) {
          setCurrencySymbolState(data.currency_symbol as CurrencySymbol);
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
      // Check if record exists
      const { data, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking preferences:", checkError);
        return;
      }

      if (data) {
        // Update existing record
        const { error } = await supabase
          .from('user_preferences')
          .update({ currency_symbol: symbol })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, currency_symbol: symbol });

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
