
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
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, age, gender, preferred_currency')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error('Error fetching profile for AI:', profileError);
  }

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

  return data;
}
