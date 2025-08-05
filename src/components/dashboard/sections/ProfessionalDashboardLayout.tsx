
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { FinnyCard } from "@/components/dashboard/FinnyCard";
import { QuickActionsWidget } from "@/components/dashboard/widgets/QuickActionsWidget";
import { SpendingTrendsWidget } from "@/components/dashboard/widgets/SpendingTrendsWidget";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";

interface ProfessionalDashboardLayoutProps {
  isNewUser: boolean;
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  walletBalance: number;
  expenses: any[];
  allExpenses: any[];
  isExpensesLoading: boolean;
  setShowAddExpense: (show: boolean) => void;
  onAddExpense: () => void;
  onUploadReceipt: () => void;
  onTakePhoto: () => void;
  onAddBudget: () => void;
}

export const ProfessionalDashboardLayout = ({
  isNewUser,
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  setMonthlyIncome,
  savingsRate,
  formatPercentage,
  walletBalance,
  expenses,
  allExpenses,
  isExpensesLoading,
  setShowAddExpense,
  onAddExpense,
  onUploadReceipt,
  onTakePhoto,
  onAddBudget
}: ProfessionalDashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Professional Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Header Section */}
        <div className="space-y-6">
          <DashboardHeader isNewUser={isNewUser} />
          
          {/* Stats Overview */}
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Financial Overview</h2>
              <p className="text-sm text-muted-foreground">Your current financial snapshot</p>
            </div>
            <StatCards 
              totalBalance={totalBalance}
              monthlyExpenses={monthlyExpenses}
              monthlyIncome={monthlyIncome}
              setMonthlyIncome={setMonthlyIncome}
              savingsRate={savingsRate}
              formatPercentage={formatPercentage}
              walletBalance={walletBalance}
              isNewUser={isNewUser}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Primary Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions Section */}
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Quick Actions</h2>
                <p className="text-sm text-muted-foreground">Manage your expenses efficiently</p>
              </div>
              <QuickActionsWidget
                onAddExpense={onAddExpense}
                onUploadReceipt={onUploadReceipt}
                onTakePhoto={onTakePhoto}
                onAddBudget={onAddBudget}
              />
            </div>

            {/* Spending Trends */}
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Spending Analysis</h2>
                <p className="text-sm text-muted-foreground">Track your spending patterns</p>
              </div>
              <SpendingTrendsWidget expenses={allExpenses} />
            </div>

            {/* Recent Expenses */}
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Recent Transactions</h2>
                <p className="text-sm text-muted-foreground">Your latest expense entries</p>
              </div>
              <RecentExpensesCard 
                expenses={expenses}
                isNewUser={isNewUser}
                isLoading={isExpensesLoading}
                setShowAddExpense={setShowAddExpense}
              />
            </div>
          </div>

          {/* Right Column - Assistant & Insights */}
          <div className="space-y-6">
            
            {/* AI Assistant */}
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Financial Assistant</h2>
                <p className="text-sm text-muted-foreground">Get personalized insights</p>
              </div>
              <FinnyCard />
            </div>

            {/* Financial Health Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Financial Health</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Savings Rate</span>
                      <span className="text-sm font-medium">{formatPercentage(savingsRate)}</span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {savingsRate >= 20 ? "Excellent savings rate!" : 
                       savingsRate >= 10 ? "Good progress on savings" : 
                       "Consider increasing your savings"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Summary Card */}
            <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">This Month</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expenses</span>
                      <span className="text-sm font-medium">${monthlyExpenses.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Transactions</span>
                      <span className="text-sm font-medium">{expenses.length}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <span className="text-sm font-medium text-primary">${walletBalance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
