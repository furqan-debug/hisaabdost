
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { MAX_DAILY_MESSAGES, DAILY_MESSAGE_COUNT_KEY } from "../context/FinnyContext";
import { supabase } from "@/integrations/supabase/client";

export function useMessageLimit(user: User | null) {
  const [remainingDailyMessages, setRemainingDailyMessages] = useState(MAX_DAILY_MESSAGES);
  const [isMessageLimitReached, setIsMessageLimitReached] = useState(false);
  
  // Load message count from database when user changes
  useEffect(() => {
    const fetchMessageCount = async () => {
      if (!user) {
        // Reset message count if not logged in
        setRemainingDailyMessages(MAX_DAILY_MESSAGES);
        setIsMessageLimitReached(false);
        return;
      }

      try {
        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Count messages from today
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString());

        if (error) {
          console.error('Error fetching message count:', error);
          return;
        }

        const messageCount = data?.length || 0;
        const remaining = Math.max(0, MAX_DAILY_MESSAGES - messageCount);
        
        setRemainingDailyMessages(remaining);
        setIsMessageLimitReached(remaining === 0);
      } catch (error) {
        console.error('Error checking message limit:', error);
      }
    };

    fetchMessageCount();
  }, [user]);

  // Function to increment the message count
  const incrementMessageCount = () => {
    setRemainingDailyMessages(prev => {
      const newCount = Math.max(0, prev - 1);
      setIsMessageLimitReached(newCount === 0);
      return newCount;
    });
  };

  return {
    remainingDailyMessages,
    isMessageLimitReached,
    incrementMessageCount
  };
}
