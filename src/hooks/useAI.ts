
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateResponse = async (prompt: string, type: 'chat' | 'analyze' = 'chat') => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('openai', {
        body: { prompt, type },
      });

      if (error) throw error;

      options.onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateResponse,
    isLoading,
    error,
  };
}
