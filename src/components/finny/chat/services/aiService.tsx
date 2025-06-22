
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
      
      // Dispatch events based on action type to trigger UI updates
      switch (data.action.type) {
        case 'add_expense':
          console.log('Expense was added, triggering refresh events');
          
          // Dispatch multiple events with different timings to ensure all components refresh
          const expenseEvent = new CustomEvent('expense-added', { 
            detail: { 
              timestamp: Date.now(),
              expenseData: data.action
            }
          });
          window.dispatchEvent(expenseEvent);
          
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
          break;

        case 'set_budget':
        case 'update_budget':
          console.log('Budget was added or updated, triggering refresh events');
          
          // Dispatch budget update event
          const budgetEvent = new CustomEvent('budget-updated', { 
            detail: { 
              timestamp: Date.now(),
              budgetData: data.action
            }
          });
          window.dispatchEvent(budgetEvent);
          
          // Invalidate budget queries after a short delay
          setTimeout(() => {
            const budgetRefreshEvent = new CustomEvent('budget-refresh', {
              detail: {
                timestamp: Date.now()
              }
            });
            window.dispatchEvent(budgetRefreshEvent);
          }, 500);
          break;

        case 'delete_budget':
          console.log('Budget was deleted, triggering refresh events');
          
          // Dispatch budget delete event
          const budgetDeleteEvent = new CustomEvent('budget-deleted', { 
            detail: { 
              timestamp: Date.now(),
              category: data.action.category
            }
          });
          window.dispatchEvent(budgetDeleteEvent);
          
          // Invalidate budget queries after a short delay
          setTimeout(() => {
            const budgetRefreshEvent = new CustomEvent('budget-refresh', {
              detail: {
                timestamp: Date.now()
              }
            });
            window.dispatchEvent(budgetRefreshEvent);
          }, 500);
          break;

        case 'set_goal':
        case 'update_goal':
        case 'delete_goal':
          console.log('Goal was modified, triggering refresh events');
          
          // Dispatch goal update event
          const goalEvent = new CustomEvent('goal-updated', { 
            detail: { 
              timestamp: Date.now(),
              goalData: data.action
            }
          });
          window.dispatchEvent(goalEvent);
          break;

        case 'add_wallet_funds':
          console.log('Wallet funds were added, triggering refresh events');
          
          // Dispatch wallet update event
          const walletEvent = new CustomEvent('wallet-updated', { 
            detail: { 
              timestamp: Date.now(),
              walletData: data.action
            }
          });
          window.dispatchEvent(walletEvent);
          break;

        case 'set_income':
        case 'update_income':
          console.log('Income was updated, triggering refresh events');
          
          // Dispatch income update event
          const incomeEvent = new CustomEvent('income-updated', { 
            detail: { 
              timestamp: Date.now(),
              incomeData: data.action
            }
          });
          window.dispatchEvent(incomeEvent);
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
