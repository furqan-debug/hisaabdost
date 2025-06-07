
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Wallet, Calendar, FileText, ArrowDownToLine, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWalletAdditions } from '@/hooks/useWalletAdditions';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';

const ManageFunds = () => {
  const navigate = useNavigate();
  const { allWalletAdditions, isLoadingAll, deleteFunds, isDeleting } = useWalletAdditions();
  const { currencyCode } = useCurrency();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<any>(null);

  const totalFunds = allWalletAdditions.reduce((sum, addition) => sum + Number(addition.amount), 0);

  const handleDeleteClick = (fund: any) => {
    setSelectedFund(fund);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedFund) {
      deleteFunds(selectedFund.id);
      setDeleteDialogOpen(false);
      setSelectedFund(null);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getFundTypeIcon = (fundType: string) => {
    return fundType === 'carryover' ? ArrowDownToLine : Plus;
  };

  const getFundTypeBadgeVariant = (fundType: string) => {
    return fundType === 'carryover' ? 'secondary' : 'default';
  };

  if (isLoadingAll) {
    return (
      <div className="container mx-auto p-4 space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        
        <Skeleton className="h-24 w-full rounded-lg" />
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manage Funds</h1>
            <p className="text-muted-foreground">
              View and manage all your fund entries
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Total Funds
            </CardTitle>
            <CardDescription>
              Total amount across all fund entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalFunds, currencyCode)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {allWalletAdditions.length} fund entries
            </p>
          </CardContent>
        </Card>

        {/* Funds List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Fund Entries</h2>
          
          {allWalletAdditions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No fund entries found</h3>
                <p className="text-muted-foreground text-center">
                  You haven't added any funds yet. Add funds from the dashboard to see them here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {allWalletAdditions.map((fund) => {
                const FundIcon = getFundTypeIcon(fund.fund_type || 'manual');
                
                return (
                  <Card key={fund.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-semibold">
                              {formatCurrency(fund.amount, currencyCode)}
                            </div>
                            <Badge 
                              variant={getFundTypeBadgeVariant(fund.fund_type || 'manual')} 
                              className="flex items-center gap-1"
                            >
                              <FundIcon className="h-3 w-3" />
                              {fund.fund_type === 'carryover' ? 'Carryover' : 'Manual'}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(fund.date), 'MMM dd, yyyy')}
                            </Badge>
                          </div>
                          
                          {fund.description && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              {fund.description}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            Added on {format(new Date(fund.created_at), 'MMM dd, yyyy \'at\' h:mm a')}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(fund)}
                          disabled={isDeleting}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fund Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fund entry? This will remove{' '}
              <strong>{selectedFund && formatCurrency(selectedFund.amount, currencyCode)}</strong>{' '}
              from your wallet balance and cannot be undone.
              {selectedFund?.fund_type === 'carryover' && (
                <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-sm">
                  <strong>Note:</strong> This is a carryover fund. Deleting it will prevent it from being automatically re-added in the future.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageFunds;
