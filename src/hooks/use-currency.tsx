
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
      console.log('Currency changing from:', currencyCode, 'to:', code);
      
      // Update state immediately
      setCurrencyCodeState(code);
      
      // Increment version to force re-renders
      const newVersion = version + 1;
      setVersion(newVersion);
      
      // Save to localStorage
      localStorage.setItem('preferred-currency', code);
      
      // Force immediate re-render of all components with multiple strategies
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('currency-updated', { 
          detail: { code, version: newVersion } 
        }));
      }, 0);
      
      // Additional force update for stubborn components
      setTimeout(() => {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'preferred-currency',
          newValue: code,
          oldValue: currencyCode
        }));
      }, 50);
      
      console.log('Currency change completed, new version:', newVersion);
      
    } catch (error) {
      console.error('Error setting currency:', error);
    }
  };

  // Listen for storage changes from other tabs/windows and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferred-currency' && e.newValue && e.newValue !== currencyCode) {
        console.log('Storage change detected:', e.newValue);
        setCurrencyCodeState(e.newValue as CurrencyCode);
        setVersion(prev => prev + 1);
      }
    };

    const handleCurrencyChange = (e: CustomEvent) => {
      console.log('Custom currency change event:', e.detail);
      if (e.detail.code !== currencyCode) {
        setCurrencyCodeState(e.detail.code);
        setVersion(e.detail.version);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('currency-updated', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currency-updated', handleCurrencyChange as EventListener);
    };
  }, [currencyCode]);

  return (
    <CurrencyContext.Provider value={{ currencyCode, setCurrencyCode, version }}>
      {children}
    </CurrencyContext.Provider>
  );
};
