
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
  const { data, error } = await supabase.functions.invoke('finny-chat', {
    body: {
      message: messageToSend,
      userId,
      chatHistory: recentMessages,
      analysisType,
      specificCategory,
      currencyCode
    },
  });

  if (error) {
    console.error('Error calling Finny:', error);
    throw new Error(`Failed to get response: ${error.message}`);
  }

  return data;
}
