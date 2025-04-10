
import React, { createContext, useContext, useState, useEffect } from "react";

// Define currency options with names, codes and symbols
export type CurrencyOption = {
  name: string;
  code: string;
  symbol: string;
};

export const currencies: CurrencyOption[] = [
  { name: "United States", code: "USD", symbol: "$" },
  { name: "European Union", code: "EUR", symbol: "€" },
  { name: "United Kingdom", code: "GBP", symbol: "£" },
  { name: "Japan", code: "JPY", symbol: "¥" },
  { name: "China", code: "CNY", symbol: "¥" },
  { name: "India", code: "INR", symbol: "₹" },
  { name: "Pakistan", code: "PKR", symbol: "₨" },
  { name: "Canada", code: "CAD", symbol: "$" },
  { name: "Australia", code: "AUD", symbol: "$" },
  { name: "Brazil", code: "BRL", symbol: "R$" },
  { name: "South Africa", code: "ZAR", symbol: "R" },
];

type CurrencyContextType = {
  selectedCurrency: CurrencyOption;
  setSelectedCurrency: (currency: CurrencyOption) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with USD or get from localStorage
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    return savedCurrency ? JSON.parse(savedCurrency) : currencies[0];
  });

  // Save to localStorage when currency changes
  useEffect(() => {
    localStorage.setItem("selectedCurrency", JSON.stringify(selectedCurrency));
  }, [selectedCurrency]);

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
