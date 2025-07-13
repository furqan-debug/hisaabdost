
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

  if (!messageToSend?.trim()) {
    throw new Error("Message cannot be empty");
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
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, age, gender, preferred_currency')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn("Could not fetch user profile:", profileError);
    }

    console.log("User profile retrieved for AI processing:", {
      userProfileFound: !!userProfile,
      profileCurrency: userProfile?.preferred_currency
    });
    
    // Always use the passed currencyCode, but if not provided, fall back to profile preferred_currency
    const effectiveCurrencyCode = currencyCode || userProfile?.preferred_currency || 'USD';
      
    const requestBody = {
      message: messageToSend,
      userId,
      chatHistory: recentMessages.slice(-10), // Send more context but limit to avoid token limits
      analysisType,
      specificCategory,
      currencyCode: effectiveCurrencyCode,
      userName: userProfile?.full_name,
      userAge: userProfile?.age,
      userGender: userProfile?.gender,
    };

    console.log("Calling Finny edge function with:", {
      ...requestBody,
      chatHistory: `${requestBody.chatHistory.length} messages`
    });

    // Call with timeout and retry logic
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 25 seconds')), 25000)
    );

    const response = await Promise.race([
      supabase.functions.invoke('finny-chat', {
        body: requestBody,
      }),
      timeoutPromise
    ]) as { data: any; error: any };

    const { data, error } = response;

    if (error) {
      console.error('Error calling Finny edge function:', error);
      
      // Handle specific error types
      if (error.message?.includes('timeout')) {
        throw new Error('Request timeout: Finny is taking too long to respond');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error: Unable to connect to Finny service');
      } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        throw new Error('Authentication error: Please log in again');
      } else {
        throw new Error(`Failed to get response from Finny: ${error.message}`);
      }
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
      actionType: data.action?.type,
      currency: effectiveCurrencyCode
    });
    
    // Enhanced action handling with comprehensive event dispatching
    if (data.action) {
      console.log('Processing action from Finny:', data.action);
      
      const dispatchEvent = (eventName: string, detail: any) => {
        try {
          const event = new CustomEvent(eventName, { detail });
          window.dispatchEvent(event);
          console.log(`Dispatched ${eventName} event:`, detail);
        } catch (eventError) {
          console.error(`Error dispatching ${eventName} event:`, eventError);
        }
      };

      // Create a base detail object for all events
      const baseDetail = {
        timestamp: Date.now(),
        source: 'finny-chat',
        actionData: data.action,
        userId,
        currency: effectiveCurrencyCode
      };

      const triggerMultipleEvents = (eventNames: string[], additionalDetail = {}) => {
        const detail = { ...baseDetail, ...additionalDetail };
        
        // Immediate trigger
        eventNames.forEach(eventName => {
          dispatchEvent(eventName, detail);
        });
        
        // Shorter delays for better responsiveness
        setTimeout(() => {
          eventNames.forEach(eventName => {
            dispatchEvent(eventName, detail);
          });
        }, 50);
        
        // Final confirmation trigger
        setTimeout(() => {
          eventNames.forEach(eventName => {
            dispatchEvent(eventName, detail);
          });
        }, 200);
      };

      switch (data.action.type) {
        case 'add_expense':
          console.log('Expense was added, triggering comprehensive refresh events');
          triggerMultipleEvents([
            'expense-added',
            'expenses-updated',
            'finny-expense-added',
            'expense-refresh',
            'dashboard-refresh'
          ], { expenseData: data.action });
          break;

        case 'update_expense':
          console.log('Expense was updated, triggering refresh events');
          triggerMultipleEvents([
            'expense-edited',
            'expenses-updated',
            'expense-refresh',
            'dashboard-refresh'
          ], { expenseData: data.action });
          break;

        case 'delete_expense':
          console.log('Expense was deleted, triggering refresh events');
          triggerMultipleEvents([
            'expense-deleted',
            'expenses-updated',
            'expense-refresh',
            'dashboard-refresh'
          ], { expenseData: data.action });
          break;

        case 'set_budget':
        case 'update_budget':
          console.log('Budget was added or updated, triggering refresh events');
          triggerMultipleEvents([
            'budget-added',
            'budget-updated',
            'budget-refresh',
            'expenses-updated',
            'dashboard-refresh'
          ], { budgetData: data.action });
          break;

        case 'delete_budget':
          console.log('Budget was deleted, triggering refresh events');
          triggerMultipleEvents([
            'budget-deleted',
            'budget-refresh',
            'expenses-updated',
            'dashboard-refresh'
          ], { budgetData: data.action });
          break;

        case 'set_goal':
        case 'update_goal':
          console.log('Goal was added or updated, triggering refresh events');
          triggerMultipleEvents([
            'goal-updated',
            'goal-added',
            'goals-refresh',
            'dashboard-refresh'
          ], { goalData: data.action });
          break;

        case 'delete_goal':
          console.log('Goal was deleted by Finny, triggering comprehensive refresh events');
          triggerMultipleEvents([
            'goal-deleted',
            'goals-refresh',
            'goal-updated',
            'dashboard-refresh'
          ], { goalData: data.action });
          break;

        case 'add_wallet_funds':
          console.log('Wallet funds were added, triggering refresh events');
          triggerMultipleEvents([
            'wallet-updated',
            'wallet-refresh',
            'expenses-updated',
            'dashboard-refresh'
          ], { walletData: data.action });
          break;

        case 'set_income':
        case 'update_income':
          console.log('Income was updated, triggering refresh events');
          triggerMultipleEvents([
            'income-updated',
            'income-refresh',
            'expenses-updated',
            'budget-refresh',
            'dashboard-refresh'
          ], { incomeData: data.action });
          break;

        default:
          console.log('Unknown action type:', data.action.type);
          // Still trigger general refresh for unknown actions
          triggerMultipleEvents(['dashboard-refresh'], { unknownAction: data.action });
      }
    }

    return data;
  } catch (error) {
    console.error('Error processing AI message:', error);
    
    // Provide more specific error messages based on error type
    if (error.message?.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Finny service');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Request timeout: Finny is taking too long to respond');
    } else if (error.message?.includes('Failed to get response')) {
      throw new Error('Service error: Finny service is temporarily unavailable');
    } else if (error.message?.includes('Authentication')) {
      throw new Error('Authentication error: Please log in again');
    } else if (error.message?.includes('Invalid response')) {
      throw new Error('Service error: Received invalid response from Finny');
    }
    
    // Re-throw the original error if it's already well-formatted
    throw error;
  }
}
