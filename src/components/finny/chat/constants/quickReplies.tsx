
import { QuickReply } from '../types';
import { PieChart, DollarSign, Plus, PiggyBank } from 'lucide-react';

export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { text: "Spending summary", action: "Show me a summary of my recent spending", icon: <PieChart size={14} /> },
  { text: "Budget advice", action: "I need advice for creating a budget", icon: <DollarSign size={14} /> },
  { text: "Add expense", action: "I want to add a new expense", icon: <Plus size={14} /> },
  { text: "Set a goal", action: "I'd like to set a savings goal", icon: <PiggyBank size={14} /> }
];

export const FINNY_MESSAGES = {
  GREETING: "Hi there! 👋 I'm Finny, your personal finance assistant. I can help you track expenses, set budgets, manage goals, and more. How can I help you today?",
  AUTH_PROMPT: "I'll need you to log in first so I can access your personal financial information.",
  CONNECTING: "Connecting to your financial data..."
};
