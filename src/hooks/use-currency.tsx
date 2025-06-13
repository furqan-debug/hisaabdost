
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

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage if available
  const [currencyCode, setCurrencyCodeState] = useState<CurrencyCode>(() => {
    try {
      const savedCurrency = localStorage.getItem('preferred-currency');
      console.log('Loading currency from localStorage:', savedCurrency);
      return (savedCurrency as CurrencyCode) || DEFAULT_CURRENCY_CODE;
    } catch (error) {
      console.error('Error loading currency from localStorage:', error);
      return DEFAULT_CURRENCY_CODE;
    }
  });

  // Custom setter that also saves to localStorage
  const setCurrencyCode = (code: CurrencyCode) => {
    console.log('Setting currency code:', code);
    try {
      setCurrencyCodeState(code);
      localStorage.setItem('preferred-currency', code);
      console.log('Currency saved to localStorage:', code);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('currency-changed', { detail: code }));
    } catch (error) {
      console.error('Error saving currency to localStorage:', error);
    }
  };

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('preferred-currency', currencyCode);
      console.log('Currency persisted:', currencyCode);
    } catch (error) {
      console.error('Error persisting currency:', error);
    }
  }, [currencyCode]);

  console.log('CurrencyProvider rendering with currency:', currencyCode);

  return (
    <CurrencyContext.Provider value={{ currencyCode, setCurrencyCode }}>
      {children}
    </CurrencyContext.Provider>
  );
};
