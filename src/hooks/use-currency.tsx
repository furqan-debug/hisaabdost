
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, DEFAULT_CURRENCY_CODE } from '@/utils/currencyUtils';

interface CurrencyContextType {
  currencyCode: CurrencyCode;
  setCurrencyCode: (code: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencyCode: DEFAULT_CURRENCY_CODE,
  setCurrencyCode: () => {}
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage if available
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    const savedCurrency = localStorage.getItem('preferred-currency');
    return (savedCurrency as CurrencyCode) || DEFAULT_CURRENCY_CODE;
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('preferred-currency', currencyCode);
  }, [currencyCode]);

  return (
    <CurrencyContext.Provider value={{ currencyCode, setCurrencyCode }}>
      {children}
    </CurrencyContext.Provider>
  );
};
