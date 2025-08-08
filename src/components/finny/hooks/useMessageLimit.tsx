
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
        // Get today's date range in user's timezone
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // Count USER messages only from today (not including AI responses)
        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_user', true) // Only count user messages, not AI responses
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString());

        if (error) {
          console.error('Error fetching message count:', error);
          return;
        }

        const messageCount = count || 0;
        const remaining = Math.max(0, MAX_DAILY_MESSAGES - messageCount);
        
        console.log(`Daily message limit check: ${messageCount}/${MAX_DAILY_MESSAGES} messages used today`);
        
        setRemainingDailyMessages(remaining);
        setIsMessageLimitReached(remaining === 0);
      } catch (error) {
        console.error('Error checking message limit:', error);
      }
    };

    fetchMessageCount();
  }, [user]);

  // Function to decrement remaining messages and save to database
  const incrementMessageCount = async () => {
    if (!user || isMessageLimitReached) {
      return false; // Don't allow if no user or limit reached
    }

    // Optimistically update the UI
    setRemainingDailyMessages(prev => {
      const newCount = Math.max(0, prev - 1);
      setIsMessageLimitReached(newCount === 0);
      return newCount;
    });

    try {
      // Save the user message to database to track the count
      // REMOVED expires_at field to prevent chat history deletion
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          content: 'Message count tracking',
          is_user: true
        });

      if (error) {
        console.error('Error saving message count:', error);
        // Revert the optimistic update on error
        setRemainingDailyMessages(prev => Math.min(MAX_DAILY_MESSAGES, prev + 1));
        setIsMessageLimitReached(false);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing message count:', error);
      // Revert the optimistic update on error
      setRemainingDailyMessages(prev => Math.min(MAX_DAILY_MESSAGES, prev + 1));
      setIsMessageLimitReached(false);
      return false;
    }
  };

  return {
    remainingDailyMessages,
    isMessageLimitReached,
    incrementMessageCount
  };
}
