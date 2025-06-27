
interface SavingsInsight {
  id: string;
  type: 'category_optimization' | 'habit_change' | 'smart_alternative' | 'budget_adjustment';
  title: string;
  description: string;
  currentSpending: number;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: 'immediate' | 'short_term' | 'long_term';
  actionSteps: string[];
  category: string;
}

// Generate smart savings insights
export function generateSavingsInsights(expenses: any[], totalSpending: number): SavingsInsight[] {
  const insights: SavingsInsight[] = [];
  
  // Category-wise analysis
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);
  
  // Food category insights
  if (categoryTotals['Food'] > 8000) {
    insights.push({
      id: 'food-optimization',
      type: 'category_optimization',
      title: '🍳 Cook More at Home',
      description: `You're spending ₹${categoryTotals['Food'].toLocaleString()} on food. Cooking at home more often could reduce this significantly.`,
      currentSpending: categoryTotals['Food'],
      potentialSavings: categoryTotals['Food'] * 0.3,
      difficulty: 'medium',
      timeframe: 'short_term',
      actionSteps: [
        'Plan weekly meals in advance',
        'Buy groceries in bulk',
        'Cook in batches on weekends',
        'Limit restaurant visits to 2-3 times per week'
      ],
      category: 'Food'
    });
  }
  
  // Entertainment insights
  if (categoryTotals['Entertainment'] > 5000) {
    insights.push({
      id: 'entertainment-optimization',
      type: 'habit_change',
      title: '🎮 Smart Entertainment Choices',
      description: `₹${categoryTotals['Entertainment'].toLocaleString()} on entertainment is quite high. Consider free or low-cost alternatives.`,
      currentSpending: categoryTotals['Entertainment'],
      potentialSavings: categoryTotals['Entertainment'] * 0.4,
      difficulty: 'easy',
      timeframe: 'immediate',
      actionSteps: [
        'Use free streaming trials before subscribing',
        'Look for happy hour deals and discounts',
        'Organize movie nights at home',
        'Explore free events in your city'
      ],
      category: 'Entertainment'
    });
  }
  
  // Transportation insights
  if (categoryTotals['Transportation'] > 6000) {
    const hasFrequentSmallTransport = expenses
      .filter(exp => exp.category === 'Transportation' && Number(exp.amount) < 500)
      .length > 10;
    
    if (hasFrequentSmallTransport) {
      insights.push({
        id: 'transport-optimization',
        type: 'smart_alternative',
        title: '🚌 Optimize Transportation',
        description: `Many small transport expenses suggest daily commuting. Consider monthly passes or carpooling.`,
        currentSpending: categoryTotals['Transportation'],
        potentialSavings: categoryTotals['Transportation'] * 0.25,
        difficulty: 'easy',
        timeframe: 'immediate',
        actionSteps: [
          'Get a monthly metro/bus pass',
          'Try carpooling with colleagues',
          'Use bike-sharing for short distances',
          'Walk or cycle when weather permits'
        ],
        category: 'Transportation'
      });
    }
  }
  
  // Shopping insights
  if (categoryTotals['Shopping'] > 10000) {
    insights.push({
      id: 'shopping-discipline',
      type: 'habit_change',
      title: '🛍️ Mindful Shopping',
      description: `High shopping expenses suggest impulse buying. A more planned approach could save significantly.`,
      currentSpending: categoryTotals['Shopping'],
      potentialSavings: categoryTotals['Shopping'] * 0.35,
      difficulty: 'medium',
      timeframe: 'short_term',
      actionSteps: [
        'Make a shopping list before going out',
        'Wait 24 hours before buying non-essentials',
        'Set a monthly shopping budget',
        'Compare prices online before purchasing'
      ],
      category: 'Shopping'
    });
  }
  
  // Utilities optimization
  if (categoryTotals['Utilities'] > 4000) {
    insights.push({
      id: 'utilities-savings',
      type: 'smart_alternative',
      title: '💡 Reduce Utility Bills',
      description: `Your utility bills seem high. Simple changes could reduce these fixed costs.`,
      currentSpending: categoryTotals['Utilities'],
      potentialSavings: categoryTotals['Utilities'] * 0.2,
      difficulty: 'easy',
      timeframe: 'immediate',
      actionSteps: [
        'Switch to LED bulbs',
        'Unplug devices when not in use',
        'Use energy-efficient appliances',
        'Monitor and reduce peak-hour usage'
      ],
      category: 'Utilities'
    });
  }
  
  // Overall spending insights
  if (totalSpending > 50000) {
    insights.push({
      id: 'overall-budgeting',
      type: 'budget_adjustment',
      title: '📊 Smart Budgeting Strategy',
      description: `With ₹${totalSpending.toLocaleString()} monthly spending, a structured budget could unlock significant savings.`,
      currentSpending: totalSpending,
      potentialSavings: totalSpending * 0.15,
      difficulty: 'medium',
      timeframe: 'long_term',
      actionSteps: [
        'Follow the 50/30/20 rule (needs/wants/savings)',
        'Set category-wise spending limits',
        'Review and adjust budget monthly',
        'Automate savings to make it effortless'
      ],
      category: 'Other'
    });
  }
  
  return insights.sort((a, b) => b.potentialSavings - a.potentialSavings);
}

// Calculate potential impact of implementing all suggestions
export function calculateSavingsImpact(insights: SavingsInsight[]): {
  monthlyPotential: number;
  yearlyPotential: number;
  easyWins: number;
  longTermSavings: number;
} {
  const monthlyPotential = insights.reduce((sum, insight) => sum + insight.potentialSavings, 0);
  const yearlyPotential = monthlyPotential * 12;
  
  const easyWins = insights
    .filter(insight => insight.difficulty === 'easy')
    .reduce((sum, insight) => sum + insight.potentialSavings, 0);
  
  const longTermSavings = insights
    .filter(insight => insight.timeframe === 'long_term')
    .reduce((sum, insight) => sum + insight.potentialSavings, 0);
  
  return {
    monthlyPotential,
    yearlyPotential,
    easyWins,
    longTermSavings
  };
}
