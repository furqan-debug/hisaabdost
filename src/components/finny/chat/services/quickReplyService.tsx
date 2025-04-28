
import { QuickReply } from '../types';
import { DEFAULT_QUICK_REPLIES } from '../constants/quickReplies';
import { 
  PieChart, BarChart3, Plus, Calendar, DollarSign, 
  Info, ArrowRight, PiggyBank, Trash2, ChartPie 
} from 'lucide-react';

export function updateQuickRepliesForResponse(
  messageContent: string,
  aiResponse: string,
  categoryMatch: RegExpMatchArray | null
): QuickReply[] {
  let updatedReplies: QuickReply[] = [...DEFAULT_QUICK_REPLIES];

  if (messageContent.toLowerCase().includes('budget') || aiResponse.toLowerCase().includes('budget')) {
    updatedReplies = [
      { text: "Show my budget", action: "Show me my budget", icon: <PieChart size={14} /> },
      { text: "Update budget", action: "I'd like to update my budget", icon: <Plus size={14} /> },
      { text: "Budget analysis", action: "How am I doing with my budgets this month?", icon: <BarChart3 size={14} /> },
      { text: "Delete budget", action: "I want to delete a budget", icon: <Trash2 size={14} /> }
    ];
  } else if (messageContent.toLowerCase().includes('expense') || aiResponse.toLowerCase().includes('expense')) {
    updatedReplies = [
      { text: "Add expense", action: "I want to add an expense", icon: <Plus size={14} /> },
      { text: "Recent expenses", action: "Show my recent expenses", icon: <Calendar size={14} /> },
      { text: "Category analysis", action: "Show my spending by category", icon: <PieChart size={14} /> },
      { text: "Delete expense", action: "Delete my latest expense", icon: <Trash2 size={14} /> }
    ];
  } else if (categoryMatch) {
    updatedReplies = [
      { text: "All categories", action: "Show my spending by category", icon: <PieChart size={14} /> },
      { text: `Add ${categoryMatch[1]}`, action: `Add a ${categoryMatch[1]} expense`, icon: <Plus size={14} /> },
      { text: "Monthly spending", action: "What's my total spending this month?", icon: <DollarSign size={14} /> },
      { text: "Spending insights", action: "Give me insights on my spending", icon: <Info size={14} /> }
    ];
  } else if (messageContent.toLowerCase().includes('goal') || aiResponse.toLowerCase().includes('goal')) {
    updatedReplies = [
      { text: "Progress update", action: "What's my progress on my goals?", icon: <PiggyBank size={14} /> },
      { text: "Set new goal", action: "I want to set a new savings goal", icon: <Plus size={14} /> },
      { text: "Update goal", action: "How can I update my goal progress?", icon: <ArrowRight size={14} /> },
      { text: "Delete goal", action: "Delete my savings goal", icon: <Trash2 size={14} /> }
    ];
  }

  // Add visualization option if response contains money amounts
  if (aiResponse.includes('$')) {
    const hasVisualizationOption = updatedReplies.some(r => 
      r.text.toLowerCase().includes('visualization') || 
      r.text.toLowerCase().includes('chart')
    );
    
    if (!hasVisualizationOption) {
      updatedReplies = [
        ...updatedReplies.slice(0, 3),
        { text: "Visualize data", action: "Generate a chart of this data", icon: <ChartPie size={14} /> }
      ];
    }
  }

  return updatedReplies;
}
