
import { DollarSign, Coffee, Car, Home, ShoppingBag, Gamepad2, Heart, Plus, Target, PiggyBank } from "lucide-react";

export interface QuickAction {
  id: string;
  label: string;
  icon: any;
  action: string;
  category?: string;
  amount?: number;
  type: 'expense' | 'budget' | 'goal' | 'query' | 'manual';
}

export const QUICK_EXPENSE_ACTIONS: QuickAction[] = [
  {
    id: 'manual-entry',
    label: 'Manual Entry',
    icon: Plus,
    action: 'Open manual expense form',
    type: 'manual'
  },
  {
    id: 'coffee',
    label: 'Coffee $5',
    icon: Coffee,
    action: 'Add expense of $5 for Food for Coffee',
    category: 'Food',
    amount: 5,
    type: 'expense'
  },
  {
    id: 'lunch',
    label: 'Lunch $15',
    icon: DollarSign,
    action: 'Add expense of $15 for Food for Lunch',
    category: 'Food',
    amount: 15,
    type: 'expense'
  },
  {
    id: 'gas',
    label: 'Gas $40',
    icon: Car,
    action: 'Add expense of $40 for Transportation for Gas',
    category: 'Transportation',
    amount: 40,
    type: 'expense'
  },
  {
    id: 'groceries',
    label: 'Groceries $60',
    icon: ShoppingBag,
    action: 'Add expense of $60 for Food for Groceries',
    category: 'Food',
    amount: 60,
    type: 'expense'
  }
];

export const QUICK_BUDGET_ACTIONS: QuickAction[] = [
  {
    id: 'food-budget',
    label: 'Food Budget $500',
    icon: DollarSign,
    action: 'Set a monthly budget of $500 for Food',
    category: 'Food',
    amount: 500,
    type: 'budget'
  },
  {
    id: 'transport-budget',
    label: 'Transport $200',
    icon: Car,
    action: 'Set a monthly budget of $200 for Transportation',
    category: 'Transportation',
    amount: 200,
    type: 'budget'
  },
  {
    id: 'entertainment-budget',
    label: 'Entertainment $150',
    icon: Gamepad2,
    action: 'Set a monthly budget of $150 for Entertainment',
    category: 'Entertainment',
    amount: 150,
    type: 'budget'
  }
];

export const QUICK_GOAL_ACTIONS: QuickAction[] = [
  {
    id: 'emergency-fund',
    label: 'Emergency Fund $1000',
    icon: PiggyBank,
    action: 'Create a savings goal of $1000 for Emergency Fund by end of year',
    amount: 1000,
    type: 'goal'
  },
  {
    id: 'vacation-fund',
    label: 'Vacation $2000',
    icon: Target,
    action: 'Create a savings goal of $2000 for Vacation by next summer',
    amount: 2000,
    type: 'goal'
  }
];

export const QUICK_QUERY_ACTIONS: QuickAction[] = [
  {
    id: 'spending-summary',
    label: 'Monthly Summary',
    icon: DollarSign,
    action: 'Show me my spending summary for this month',
    type: 'query'
  },
  {
    id: 'budget-status',
    label: 'Budget Status',
    icon: Target,
    action: 'How am I doing with my budgets this month?',
    type: 'query'
  },
  {
    id: 'saving-tips',
    label: 'Saving Tips',
    icon: PiggyBank,
    action: 'Give me personalized money-saving tips based on my spending',
    type: 'query'
  }
];
