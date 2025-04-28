
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
  // Get enhanced user profile data for personalization
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name, age, gender, preferred_currency')
    .eq('id', userId)
    .single();
    
  const { data, error } = await supabase.functions.invoke('finny-chat', {
    body: {
      message: messageToSend,
      userId,
      chatHistory: recentMessages,
      analysisType,
      specificCategory,
      currencyCode: userProfile?.preferred_currency || currencyCode,
      // User profile data is now fetched directly in the edge function
    },
  });

  if (error) {
    console.error('Error calling Finny:', error);
    throw new Error(`Failed to get response: ${error.message}`);
  }

  return data;
}
