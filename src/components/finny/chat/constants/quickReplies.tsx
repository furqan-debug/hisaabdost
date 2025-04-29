
import { Plus, BarChart3, Calendar, Clock, Info } from 'lucide-react';
import { QuickReply } from '../types';

export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  {
    text: 'Add expense',
    action: 'Help me add a new expense',
    icon: <Plus size={14} />
  },
  {
    text: 'View spending',
    action: 'Show my spending summary for this month',
    icon: <BarChart3 size={14} />
  },
  {
    text: 'Set budget',
    action: 'I want to set up a new monthly budget',
    icon: <Calendar size={14} />
  }
];

export const FINNY_MESSAGES = {
  GREETING: "👋 Hi there! I'm Finny, your financial assistant. How can I help you today?",
  AUTH_PROMPT: "I'll need you to log in first so I can access your personal financial information.",
  AUTH_SUCCESS: "Great! Now I can help you with your finances. What would you like to do today?",
  HELP_MESSAGE: "I can help you track expenses, set budgets, analyze spending patterns, and work toward financial goals. Just let me know what you need!"
};
