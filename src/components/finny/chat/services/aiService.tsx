
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types';
import { updateQuickRepliesForResponse } from './quickReplyService';
import { CurrencyCode } from '@/utils/currencyUtils';

export async function processMessageWithAI(
  messageToSend: string,
  userId: string,
  recentMessages: Message[],
  analysisType = "general",
  specificCategory: string | null = null,
  currencyCode: CurrencyCode = 'USD'
) {
  if (!userId) {
    console.error("Cannot process AI message: User ID is null or undefined");
    throw new Error("You must be logged in to use Finny");
  }

  console.log("Processing message with AI:", {
    messageToSend,
    userId,
    analysisType,
    specificCategory,
    currencyCode,
    messageLength: messageToSend.length
  });

  // Get enhanced user profile data for personalization
  try {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name, age, gender, preferred_currency')
      .eq('id', userId)
      .single();

    console.log("User profile retrieved for AI processing:", {
      userProfileFound: !!userProfile,
      profileCurrency: userProfile?.preferred_currency
    });
    
    // Always use the passed currencyCode, but if not provided, fall back to profile preferred_currency
    const effectiveCurrencyCode = currencyCode || userProfile?.preferred_currency || 'USD';
      
    const requestBody = {
      message: messageToSend,
      userId,
      chatHistory: recentMessages,
      analysisType,
      specificCategory,
      currencyCode: effectiveCurrencyCode,
      userName: userProfile?.full_name,
      userAge: userProfile?.age,
      userGender: userProfile?.gender,
    };

    console.log("Calling Finny edge function with:", {
      ...requestBody,
      chatHistory: `${recentMessages.length} messages`
    });

    const { data, error } = await supabase.functions.invoke('finny-chat', {
      body: requestBody,
    });

    if (error) {
      console.error('Error calling Finny edge function:', error);
      throw new Error(`Failed to get response from Finny: ${error.message}`);
    }

    if (!data) {
      console.error('No data received from Finny edge function');
      throw new Error('No response received from Finny service');
    }

    if (!data.response) {
      console.error('Invalid response structure from Finny:', data);
      throw new Error('Invalid response format from Finny service');
    }
    
    console.log('Finny response received successfully:', {
      hasResponse: !!data.response,
      hasAction: !!data.action,
      responseLength: data.response?.length || 0,
      currency: effectiveCurrencyCode
    });
    
    // Handle different types of actions that Finny can perform
    if (data.action) {
      console.log('Processing action from Finny:', data.action);
      
      // Dispatch immediate events based on action type to trigger UI updates
      const dispatchEvent = (eventName: string, detail: any) => {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
        console.log(`Dispatched ${eventName} event:`, detail);
      };

      // Create a base detail object for all events
      const baseDetail = {
        timestamp: Date.now(),
        source: 'finny-chat',
        actionData: data.action
      };

      switch (data.action.type) {
        case 'add_expense':
          console.log('Expense was added, triggering immediate refresh events');
          
          // Dispatch multiple events immediately for expense updates
          dispatchEvent('expense-added', baseDetail);
          dispatchEvent('expenses-updated', baseDetail);
          dispatchEvent('finny-expense-added', baseDetail);
          
          // Additional refresh events with slight delays
          setTimeout(() => dispatchEvent('expense-refresh', baseDetail), 100);
          setTimeout(() => dispatchEvent('expenses-updated', baseDetail), 500);
          break;

        case 'update_expense':
          console.log('Expense was updated, triggering refresh events');
          dispatchEvent('expense-edited', baseDetail);
          dispatchEvent('expenses-updated', baseDetail);
          setTimeout(() => dispatchEvent('expense-refresh', baseDetail), 100);
          break;

        case 'delete_expense':
          console.log('Expense was deleted, triggering refresh events');
          dispatchEvent('expense-deleted', baseDetail);
          dispatchEvent('expenses-updated', baseDetail);
          setTimeout(() => dispatchEvent('expense-refresh', baseDetail), 100);
          break;

        case 'set_budget':
        case 'update_budget':
          console.log('Budget was added or updated, triggering refresh events');
          
          dispatchEvent('budget-updated', baseDetail);
          dispatchEvent('budget-refresh', baseDetail);
          
          // Additional refresh with delay
          setTimeout(() => dispatchEvent('budget-refresh', baseDetail), 200);
          break;

        case 'delete_budget':
          console.log('Budget was deleted, triggering refresh events');
          
          dispatchEvent('budget-deleted', { 
            ...baseDetail, 
            category: data.action.category 
          });
          dispatchEvent('budget-refresh', baseDetail);
          
          setTimeout(() => dispatchEvent('budget-refresh', baseDetail), 200);
          break;

        case 'set_goal':
        case 'update_goal':
        case 'delete_goal':
          console.log('Goal was modified, triggering refresh events');
          
          dispatchEvent('goal-updated', baseDetail);
          dispatchEvent('goals-refresh', baseDetail);
          break;

        case 'add_wallet_funds':
          console.log('Wallet funds were added, triggering refresh events');
          
          dispatchEvent('wallet-updated', baseDetail);
          dispatchEvent('wallet-refresh', baseDetail);
          
          // Also trigger expense-related events since wallet affects dashboard
          setTimeout(() => dispatchEvent('expenses-updated', baseDetail), 100);
          break;

        case 'set_income':
        case 'update_income':
          console.log('Income was updated, triggering refresh events');
          
          dispatchEvent('income-updated', baseDetail);
          dispatchEvent('income-refresh', baseDetail);
          
          // Also trigger expense-related events since income affects dashboard calculations
          setTimeout(() => dispatchEvent('expenses-updated', baseDetail), 100);
          break;

        default:
          console.log('Unknown action type:', data.action.type);
      }
    }

    return data;
  } catch (error) {
    console.error('Error processing AI message:', error);
    
    // Provide more specific error messages
    if (error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Finny service');
    } else if (error.message.includes('timeout')) {
      throw new Error('Request timeout: Finny is taking too long to respond');
    } else if (error.message.includes('Failed to get response')) {
      throw new Error('Service error: Finny service is temporarily unavailable');
    }
    
    throw error;
  }
}
