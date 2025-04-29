
import { useState } from 'react';
import { toast } from 'sonner';
import { Message, QuickReply } from '../types';
import { processMessageWithAI } from '../services/aiService';
import { updateQuickRepliesForResponse } from '../services/quickReplyService';
import { PATTERNS } from '../utils/messagePatterns';
import { User } from '@supabase/supabase-js';

export const useMessageProcessing = (
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  setQuickReplies: (replies: QuickReply[]) => void,
  saveMessage: (message: Message) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const processMessage = async (
    messageText: string, 
    user: User | null, 
    currencyCode: string
  ) => {
    if (!messageText.trim() || isLoading || !user) {
      if (!user) toast.error("Please log in to chat with Finny");
      return;
    }

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
      const recentMessages = [...messages.slice(-5), userMessage];

      const categoryMatch = messageText.match(PATTERNS.CATEGORY);
      const summaryMatch = messageText.match(PATTERNS.SUMMARY);
      const deleteExpenseMatch = messageText.match(PATTERNS.DELETE_EXPENSE);
      const deleteBudgetMatch = messageText.match(PATTERNS.DELETE_BUDGET);
      const deleteGoalMatch = messageText.match(PATTERNS.DELETE_GOAL);
      const visualizationMatch = messageText.match(PATTERNS.VISUALIZATION);
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
      } else if (visualizationMatch) {
        analysisType = "visualization";
        specificCategory = visualizationMatch[2];
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

      const data = await processMessageWithAI(messageText, user.id, recentMessages, analysisType, specificCategory, currencyCode);
      
      setIsTyping(false);

      const hasAction = data.response.includes('✅') || data.rawResponse.includes('[ACTION:');
      
      const needsVisualization = 
        messageText.toLowerCase().includes('spending') || 
        messageText.toLowerCase().includes('budget') ||
        messageText.toLowerCase().includes('breakdown') ||
        messageText.toLowerCase().includes('summary') ||
        messageText.toLowerCase().includes('show me') ||
        messageText.toLowerCase().includes('visualize') ||
        messageText.toLowerCase().includes('chart') ||
        messageText.toLowerCase().includes('graph') ||
        data.response.includes('$') ||
        hasAction;

      const newMessage = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        hasAction: hasAction,
        visualData: data.visualData || (needsVisualization ? { type: 'spending-chart', summary: true } : null),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      setMessages(prev => [...prev, newMessage]);
      saveMessage(newMessage);

      const updatedReplies = updateQuickRepliesForResponse(messageText, data.response, categoryMatch);
      setQuickReplies(updatedReplies);

    } catch (error) {
      console.error('Error in chat:', error);
      toast.error(`Sorry, I couldn't process that request: ${error.message}`);
      
      setIsTyping(false);
      const errorMessage = {
        id: Date.now().toString(),
        content: "Sorry, I'm having trouble processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      
      setMessages(prev => [...prev, errorMessage]);
      saveMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (
    e: React.FormEvent | null, 
    user: User | null, 
    currencyCode: string,
    customMessage?: string
  ) => {
    if (e) e.preventDefault();
    const messageText = customMessage || newMessage;
    await processMessage(messageText, user, currencyCode);
  };

  const handleQuickReply = async (
    reply: QuickReply, 
    user: User | null, 
    currencyCode: string
  ) => {
    if (isLoading || !user) return;
    await processMessage(reply.action, user, currencyCode);
  };

  return {
    newMessage,
    setNewMessage,
    isLoading,
    isTyping,
    setIsTyping,
    handleSendMessage,
    handleQuickReply
  };
};
