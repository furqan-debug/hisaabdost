import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onError?: (error: Error, attempt: number) => void;
  onSuccess?: () => void;
}

export function useRetry(options: UseRetryOptions = {}) {
  const { 
    maxAttempts = 3, 
    delay = 1000, 
    backoff = true,
    onError,
    onSuccess 
  } = options;
  
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const retry = useCallback(async (fn: () => Promise<any>) => {
    setIsRetrying(true);
    let currentAttempt = 0;

    const executeAttempt = async (): Promise<any> => {
      try {
        const result = await fn();
        setAttemptCount(0);
        setIsRetrying(false);
        onSuccess?.();
        return result;
      } catch (error) {
        currentAttempt++;
        setAttemptCount(currentAttempt);
        
        if (currentAttempt >= maxAttempts) {
          setIsRetrying(false);
          onError?.(error as Error, currentAttempt);
          toast({
            title: "Operation Failed",
            description: `Failed after ${maxAttempts} attempts. Please try again later.`,
            variant: "destructive",
          });
          throw error;
        }

        const waitTime = backoff ? delay * Math.pow(2, currentAttempt - 1) : delay;
        
        toast({
          title: "Retrying...",
          description: `Attempt ${currentAttempt} failed. Retrying in ${waitTime / 1000}s...`,
        });

        await new Promise(resolve => setTimeout(resolve, waitTime));
        return executeAttempt();
      }
    };

    return executeAttempt();
  }, [maxAttempts, delay, backoff, onError, onSuccess]);

  const reset = useCallback(() => {
    setAttemptCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    isRetrying,
    attemptCount,
    reset,
    hasExceededMaxAttempts: attemptCount >= maxAttempts
  };
}