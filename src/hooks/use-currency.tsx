
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, DEFAULT_CURRENCY_CODE } from '@/utils/currencyUtils';

interface CurrencyContextType {
  currencyCode: CurrencyCode;
  setCurrencyCode: (code: CurrencyCode) => void;
  version: number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencyCode: DEFAULT_CURRENCY_CODE,
  setCurrencyCode: () => {},
  version: 0
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
      return (savedCurrency as CurrencyCode) || DEFAULT_CURRENCY_CODE;
    } catch (error) {
      console.error('Error loading currency from localStorage:', error);
      return DEFAULT_CURRENCY_CODE;
    }
  });

  // Version counter to force re-renders
  const [version, setVersion] = useState(0);

  // Custom setter that also saves to localStorage and forces re-renders
  const setCurrencyCode = (code: CurrencyCode) => {
    try {
      // Update state immediately
      setCurrencyCodeState(code);
      
      // Increment version to force re-renders
      setVersion(prev => prev + 1);
      
      // Save to localStorage
      localStorage.setItem('preferred-currency', code);
      
      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('currency-updated', { 
        detail: { code, version: version + 1 } 
      }));
      
      console.log('Currency updated successfully:', code);
    } catch (error) {
      console.error('Error saving currency to localStorage:', error);
    }
  };

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferred-currency' && e.newValue) {
        setCurrencyCodeState(e.newValue as CurrencyCode);
        setVersion(prev => prev + 1);
      }
    };

    const handleCurrencyChange = (e: CustomEvent) => {
      const { code, version: eventVersion } = e.detail;
      console.log('Received currency change event:', code, eventVersion);
      setCurrencyCodeState(code);
      setVersion(eventVersion);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('currency-updated', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currency-updated', handleCurrencyChange as EventListener);
    };
  }, []);

  return (
    <CurrencyContext.Provider value={{ currencyCode, setCurrencyCode, version }}>
      {children}
    </CurrencyContext.Provider>
  );
};
