
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
import { MAX_DAILY_MESSAGES } from '../../context/FinnyContext';

export const useMessageSending = (
  messages: Message[],
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
  saveMessage: (message: Message) => void,
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void,
  setIsTyping: (typing: boolean) => void,
  setQuickReplies: (replies: QuickReply[]) => void,
  currencyCode: CurrencyCode
) => {
  const [newMessage, setNewMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const { isMessageLimitReached, remainingDailyMessages } = useFinny();
  const { processAutoExpense } = useAutoExpenseProcessing(currencyCode);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  const handleSendMessage = async (e: React.FormEvent | null, customMessage?: string, isRetry = false) => {
    if (e) e.preventDefault();
    
    let messageText = customMessage || newMessage;
    if (!messageText?.trim() || isLoading) return;

    // Validate user authentication
    if (!user) {
      toast.error("Please log in to chat with Finny");
      return;
    }

    // Check message limits
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
      return;
    }

    if (remainingDailyMessages <= 0) {
      toast.error(`You have reached your daily limit of ${MAX_DAILY_MESSAGES} messages. Please try again tomorrow.`);
      return;
    }

    console.log("Sending message to Finny:", messageText);
    console.log(`Messages remaining today: ${remainingDailyMessages}`);

    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    try {
      // Try auto-processing first
      const autoResult = await processAutoExpense(messageText);

      setMessages(prev => [...prev, userMessage]);
      saveMessage(userMessage);
      if (!isRetry) setNewMessage('');
      setIsLoading(true);
      setIsTyping(true);

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
        setRetryCount(0);
        return;
      }

      const recentMessages = [...messages.slice(-5), userMessage];

      // Enhanced pattern matching
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
      
      // Process with AI with timeout
      const data = await Promise.race([
        processMessageWithAI(messageText, user.id, recentMessages, analysisType, specificCategory, currencyCode),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ]);
      
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

      // Enhanced refresh event handling
      if (hasAction) {
        console.log("Finny response indicates action taken, triggering comprehensive refresh events");
        
        const triggerRefreshEvents = () => {
          const events = [
            'expense-added',
            'expenses-updated', 
            'expense-refresh',
            'finny-expense-added',
            'wallet-updated',
            'income-updated',
            'budget-updated',
            'dashboard-refresh'
          ];
          
          events.forEach(eventName => {
            const event = new CustomEvent(eventName, { 
              detail: { 
                timestamp: Date.now(),
                source: 'finny-chat',
                action: 'finny_response',
                responseContent: data.response
              }
            });
            window.dispatchEvent(event);
            console.log(`Dispatched ${eventName} event from Finny response`);
          });
        };

        // Multiple refresh triggers with different timings
        triggerRefreshEvents();
        setTimeout(triggerRefreshEvents, 100);
        setTimeout(triggerRefreshEvents, 500);
        setTimeout(triggerRefreshEvents, 1000);
        setTimeout(triggerRefreshEvents, 1500);
      }

      // Update quick replies
      try {
        const updatedReplies = updateQuickRepliesForResponse(messageText, data.response, categoryMatch);
        setQuickReplies(updatedReplies);
      } catch (replyError) {
        console.error("Error updating quick replies:", replyError);
      }

      // Reset retry count on success
      setRetryCount(0);

    } catch (error) {
      console.error('Error in Finny chat:', error);
      
      setIsTyping(false);
      
      // Retry logic
      if (!isRetry && retryCount < MAX_RETRIES && error.message.includes('timeout')) {
        console.log(`Retrying message (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
        
        toast.info(`Request timed out. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        
        setTimeout(() => {
          handleSendMessage(null, messageText, true);
        }, RETRY_DELAY * (retryCount + 1));
        
        return;
      }
      
      let errorMessage = "Sorry, I'm having trouble processing your request right now.";
      
      if (error.message.includes("timeout")) {
        errorMessage = "The request took too long to process. Please try again with a simpler question.";
      } else if (error.message.includes("Failed to get response")) {
        errorMessage = "I'm having connectivity issues. Please check your internet connection and try again.";
      } else if (error.message.includes("Invalid response")) {
        errorMessage = "I received an unexpected response. Please try rephrasing your message.";
      } else if (error.message.includes("Network error")) {
        errorMessage = "Network connection failed. Please check your internet and try again.";
      }
      
      toast.error(errorMessage);
      
      const errorResponseMessage = {
        id: (Date.now() + 1).toString(),
        content: `❌ ${errorMessage}\n\n${retryCount >= MAX_RETRIES ? 'Maximum retries reached. ' : ''}Please try again later or contact support if the issue persists.`,
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      
      setMessages(prev => [...prev, errorResponseMessage]);
      saveMessage(errorResponseMessage);
      
      // Reset retry count after max retries
      if (retryCount >= MAX_RETRIES) {
        setRetryCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    newMessage,
    setNewMessage,
    handleSendMessage,
    retryCount
  };
};
