
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types';
import { updateQuickRepliesForResponse } from './quickReplyService';

export async function processMessageWithAI(
  messageToSend: string,
  userId: string,
  recentMessages: Message[],
  analysisType = "general",
  specificCategory: string | null = null,
  currencyCode = 'USD'
) {
  if (!userId) {
    console.error("Cannot process AI message: User ID is null or undefined");
    throw new Error("You must be logged in to use Finny");
  }

  // Get enhanced user profile data for personalization
  try {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name, age, gender, preferred_currency')
      .eq('id', userId)
      .single();

    console.log("Processing message with AI:", {
      messageToSend,
      userId,
      userProfileFound: !!userProfile,
      analysisType,
      specificCategory
    });
      
    const { data, error } = await supabase.functions.invoke('finny-chat', {
      body: {
        message: messageToSend,
        userId,
        chatHistory: recentMessages,
        analysisType,
        specificCategory,
        currencyCode: userProfile?.preferred_currency || currencyCode,
        userName: userProfile?.full_name,
        userAge: userProfile?.age,
        userGender: userProfile?.gender,
      },
    });

    if (error) {
      console.error('Error calling Finny:', error);
      throw new Error(`Failed to get response: ${error.message}`);
    }
    
    // Check if the response indicates an expense was added
    if (data.action && data.action.type === 'add_expense') {
      console.log('Expense was added, triggering refresh events');
      
      // Dispatch multiple events with different timings to ensure all components refresh
      
      // Immediate event dispatch
      const event = new CustomEvent('expense-added', { 
        detail: { 
          timestamp: Date.now(),
          expenseData: data.action
        }
      });
      window.dispatchEvent(event);
      
      // Follow-up event in 300ms
      setTimeout(() => {
        const updateEvent = new CustomEvent('expenses-updated', { 
          detail: { 
            timestamp: Date.now(),
            expenseData: data.action
          }
        });
        window.dispatchEvent(updateEvent);
      }, 300);
      
      // Final refresh event in 1000ms
      setTimeout(() => {
        const finalEvent = new CustomEvent('expense-refresh', { 
          detail: { 
            timestamp: Date.now(),
            expenseData: data.action
          }
        });
        window.dispatchEvent(finalEvent);
      }, 1000);
    }
    // Also handle budget and goal changes
    else if (data.action && 
      (data.action.type === 'set_budget' || data.action.type === 'update_budget' || 
       data.action.type === 'delete_budget')) {
      // Dispatch budget update event
      const budgetEvent = new CustomEvent('budget-updated', { 
        detail: { 
          timestamp: Date.now(),
          budgetData: data.action
        }
      });
      window.dispatchEvent(budgetEvent);
    }
    else if (data.action && 
      (data.action.type === 'set_goal' || data.action.type === 'update_goal' || 
       data.action.type === 'delete_goal')) {
      // Dispatch goal update event
      const goalEvent = new CustomEvent('goal-updated', { 
        detail: { 
          timestamp: Date.now(),
          goalData: data.action
        }
      });
      window.dispatchEvent(goalEvent);
    }

    return data;
  } catch (error) {
    console.error('Error processing AI message:', error);
    throw error;
  }
}
