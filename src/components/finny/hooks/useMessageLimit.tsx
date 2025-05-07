
import { useState, useEffect } from 'react';
import { MAX_DAILY_MESSAGES, DAILY_MESSAGE_COUNT_KEY } from '../context/FinnyContext';

interface User {
  id: string;
}

export const useMessageLimit = (user: User | null) => {
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [remainingDailyMessages, setRemainingDailyMessages] = useState(MAX_DAILY_MESSAGES);
  const [isMessageLimitReached, setIsMessageLimitReached] = useState(false);

  // Load and initialize daily message count
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const storageKey = `${DAILY_MESSAGE_COUNT_KEY}_${user.id}_${today}`;
      
      try {
        const storedCount = localStorage.getItem(storageKey);
        const count = storedCount ? parseInt(storedCount, 10) : 0;
        setDailyMessageCount(count);
        setRemainingDailyMessages(MAX_DAILY_MESSAGES - count);
        setIsMessageLimitReached(count >= MAX_DAILY_MESSAGES);
      } catch (error) {
        console.error("Error loading message count from storage:", error);
        // Default to 0 if there's an error
        setDailyMessageCount(0);
        setRemainingDailyMessages(MAX_DAILY_MESSAGES);
        setIsMessageLimitReached(false);
      }
    }
  }, [user]);

  // Update remaining messages and local storage whenever count changes
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `${DAILY_MESSAGE_COUNT_KEY}_${user.id}_${today}`;
      
      try {
        localStorage.setItem(storageKey, dailyMessageCount.toString());
        setRemainingDailyMessages(MAX_DAILY_MESSAGES - dailyMessageCount);
        setIsMessageLimitReached(dailyMessageCount >= MAX_DAILY_MESSAGES);
      } catch (error) {
        console.error("Error saving message count to storage:", error);
      }
    }
  }, [dailyMessageCount, user]);

  const incrementMessageCount = () => {
    if (user) {
      setDailyMessageCount(prevCount => {
        const newCount = prevCount + 1;
        return newCount;
      });
    }
  };

  return {
    dailyMessageCount,
    remainingDailyMessages,
    isMessageLimitReached,
    incrementMessageCount
  };
};
