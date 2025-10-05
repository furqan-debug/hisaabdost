import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoans, useLoanSummary, Loan, LoanType, LoanStatus } from '@/hooks/useLoans';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { getCurrencyByCode } from '@/utils/currencyUtils';
import LoanCard from '@/components/loans/LoanCard';
import AddLoanDialog from '@/components/loans/AddLoanDialog';
import LoanDetailsDialog from '@/components/loans/LoanDetailsDialog';
import AddPaymentDialog from '@/components/loans/AddPaymentDialog';

export default function Loans() {
  const [activeTab, setActiveTab] = useState<'all' | LoanType | LoanStatus>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { currencyCode } = useCurrency();
  const currencySymbol = getCurrencyByCode(currencyCode).symbol;

  const filters = activeTab === 'all' 
    ? undefined 
    : activeTab === 'i_gave' || activeTab === 'i_took'
      ? { type: activeTab as LoanType }
      : { status: activeTab as LoanStatus };

  const { data: loans = [], isLoading } = useLoans(filters);
  const { data: summary } = useLoanSummary();

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowDetailsDialog(true);
  };

  const handleAddPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowPaymentDialog(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Loans & Udhaar</h1>
            <p className="text-muted-foreground">Track money you give or take</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Loan
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">You'll Receive</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.youWillReceive || 0, currencyCode)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">You Owe</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary?.youOwe || 0, currencyCode)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className={`text-2xl font-bold ${
                  (summary?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary?.netBalance || 0, currencyCode)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="i_gave">I Gave</TabsTrigger>
            <TabsTrigger value="i_took">I Took</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="fully_paid">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loans List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading loans...</p>
          </div>
        ) : loans.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Wallet className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No loans yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start tracking money you give or take by adding your first loan
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Loan
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onAddPayment={handleAddPayment}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddLoanDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <LoanDetailsDialog
        loan={selectedLoan}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <AddPaymentDialog
        loan={selectedLoan}
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      />
    </div>
  );
}
