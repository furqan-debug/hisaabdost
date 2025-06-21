
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { processMessageWithAI } from '../services/aiService';
import { updateQuickRepliesForResponse } from '../services/quickReplyService';
import { useFinny } from '../../context/FinnyContext';
import { Message, QuickReply } from '../types';
import { PATTERNS } from '../utils/messagePatterns';
import { CurrencyCode } from '@/utils/currencyUtils';
import { useAutoExpenseProcessing } from './useAutoExpenseProcessing';

export const useMessageSending = (
  messages: Message[],
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
  saveMessage: (message: Message) => void,
  setIsLoading: (loading: boolean) => void,
  setIsTyping: (typing: boolean) => void,
  setQuickReplies: (replies: QuickReply[]) => void,
  currencyCode: CurrencyCode
) => {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { isMessageLimitReached } = useFinny();
  const { processAutoExpense } = useAutoExpenseProcessing(currencyCode);

  const handleSendMessage = async (e: React.FormEvent | null, customMessage?: string) => {
    if (e) e.preventDefault();
    
    let messageText = customMessage || newMessage;
    if (!messageText.trim() || isLoading) return;

    if (!user) {
      toast.error("Please log in to chat with Finny");
      return;
    }

    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (10 messages). Please try again tomorrow.`);
      return;
    }

    console.log("Sending message to Finny:", messageText);

    // Try auto-processing first
    const autoResult = await processAutoExpense(messageText);

    const userMessage = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessage(userMessage);
    setNewMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // If we auto-processed something, provide immediate feedback
      if (autoResult.processed) {
        setIsTyping(false);
        const autoResponseMessage = {
          id: (Date.now() + 1).toString(),
          content: autoResult.message + "\n\nIs there anything else I can help you with? 😊",
          isUser: false,
          timestamp: new Date(),
          hasAction: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        setMessages(prev => [...prev, autoResponseMessage]);
        saveMessage(autoResponseMessage);
        setIsLoading(false);
        return;
      }

      const recentMessages = [...messages.slice(-5), userMessage];

      // Pattern matching for different types of requests
      const categoryMatch = messageText.match(PATTERNS.CATEGORY);
      const summaryMatch = messageText.match(PATTERNS.SUMMARY);
      const deleteExpenseMatch = messageText.match(PATTERNS.DELETE_EXPENSE);
      const deleteBudgetMatch = messageText.match(PATTERNS.DELETE_BUDGET);
      const deleteGoalMatch = messageText.match(PATTERNS.DELETE_GOAL);
      const goalMatch = messageText.match(PATTERNS.GOAL);

      let analysisType = "general";
      let specificCategory = null;

      if (goalMatch) {
        messageText = `${messageText}\n\nPlease create a goal with the following details: 
        - amount: ${goalMatch[1]}
        - deadline: ${goalMatch[2]}
        - title: "Savings Goal"
        - category: Savings`;
      }

      if (categoryMatch) {
        analysisType = "category";
        specificCategory = categoryMatch[1];
      } else if (summaryMatch) {
        analysisType = "summary";
      } else if (deleteExpenseMatch) {
        analysisType = "delete_expense";
        specificCategory = deleteExpenseMatch[1].trim();
      } else if (deleteBudgetMatch) {
        analysisType = "delete_budget";
        specificCategory = deleteBudgetMatch[1].trim();
      } else if (deleteGoalMatch) {
        analysisType = "delete_goal";
        specificCategory = deleteGoalMatch[1].trim();
      }

      console.log(`Processing message with currency ${currencyCode} for Finny chat`);
      
      const data = await processMessageWithAI(messageText, user.id, recentMessages, analysisType, specificCategory, currencyCode);
      
      console.log("Received response from Finny:", data);
      
      setIsTyping(false);

      if (!data || !data.response) {
        throw new Error("Invalid response from Finny service");
      }

      const hasAction = data.response.includes('✅') || (data.rawResponse && data.rawResponse.includes('[ACTION:'));
      
      const finnyResponseMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        hasAction: hasAction,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      setMessages(prev => [...prev, finnyResponseMessage]);
      saveMessage(finnyResponseMessage);

      try {
        const updatedReplies = updateQuickRepliesForResponse(messageText, data.response, categoryMatch);
        setQuickReplies(updatedReplies);
      } catch (replyError) {
        console.error("Error updating quick replies:", replyError);
      }

    } catch (error) {
      console.error('Error in Finny chat:', error);
      
      let errorMessage = "Sorry, I'm having trouble processing your request right now.";
      
      if (error.message.includes("Failed to get response")) {
        errorMessage = "I'm having connectivity issues. Please try again in a moment.";
      } else if (error.message.includes("Invalid response")) {
        errorMessage = "I received an unexpected response. Please try rephrasing your message.";
      }
      
      toast.error(errorMessage);
      
      setIsTyping(false);
      const errorResponseMessage = {
        id: (Date.now() + 1).toString(),
        content: `❌ ${errorMessage} Please try again later.`,
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      
      setMessages(prev => [...prev, errorResponseMessage]);
      saveMessage(errorResponseMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    newMessage,
    setNewMessage,
    handleSendMessage
  };
};
