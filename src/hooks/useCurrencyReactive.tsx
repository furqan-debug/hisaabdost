
import { useEffect, useState } from 'react';
import { useCurrency } from './use-currency';

/**
 * Hook that forces component re-renders when currency changes
 * Use this in components that display currency values to ensure immediate updates
 */
export const useCurrencyReactive = () => {
  const { currencyCode, version } = useCurrency();
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const handleCurrencyUpdate = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('currency-updated', handleCurrencyUpdate);
    window.addEventListener('storage', handleCurrencyUpdate);
    
    return () => {
      window.removeEventListener('currency-updated', handleCurrencyUpdate);
      window.removeEventListener('storage', handleCurrencyUpdate);
    };
  }, []);

  return { currencyCode, version };
};
