import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UseFormAutoSaveOptions {
  key: string;
  interval?: number;
  enabled?: boolean;
}

export function useFormAutoSave<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options: UseFormAutoSaveOptions
) {
  const { key, interval = 30000, enabled = true } = options;
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  // Load saved data on mount
  useEffect(() => {
    if (!enabled) return;
    
    try {
      const saved = localStorage.getItem(`form-autosave-${key}`);
      if (saved) {
        const data = JSON.parse(saved);
        form.reset(data);
      }
    } catch (error) {
      console.warn('Failed to load auto-saved form data:', error);
    }
  }, [key, enabled, form]);

  // Auto-save form data
  useEffect(() => {
    if (!enabled) return;

    const saveForm = () => {
      const currentData = JSON.stringify(form.getValues());
      
      // Only save if data has changed
      if (currentData !== lastSavedRef.current) {
        try {
          localStorage.setItem(`form-autosave-${key}`, currentData);
          lastSavedRef.current = currentData;
        } catch (error) {
          console.warn('Failed to auto-save form data:', error);
        }
      }
    };

    intervalRef.current = setInterval(saveForm, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [key, interval, enabled, form]);

  // Clear saved data
  const clearSaved = () => {
    try {
      localStorage.removeItem(`form-autosave-${key}`);
      lastSavedRef.current = '';
    } catch (error) {
      console.warn('Failed to clear auto-saved form data:', error);
    }
  };

  // Check if there's saved data
  const hasSavedData = () => {
    try {
      return localStorage.getItem(`form-autosave-${key}`) !== null;
    } catch {
      return false;
    }
  };

  return {
    clearSaved,
    hasSavedData: hasSavedData()
  };
}