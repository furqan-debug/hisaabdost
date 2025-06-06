
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useWalletAdditions } from '@/hooks/useWalletAdditions';
import { formatCurrency } from '@/utils/formatters';
import { useCurrency } from '@/hooks/use-currency';
import { Trash2, ArrowLeft, Wallet, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ManageFunds = () => {
  const navigate = useNavigate();
  const { currencyCode } = useCurrency();
  const { walletAdditions, isLoading, deleteFunds } = useWalletAdditions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fundToDelete, setFundToDelete] = useState<string | null>(null);

  const handleDeleteClick = (fundId: string) => {
    setFundToDelete(fundId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fundToDelete) {
      deleteFunds(fundToDelete);
      setDeleteDialogOpen(false);
      setFundToDelete(null);
    }
  };

  const handleCancel = () => {
    setDeleteDialogOpen(false);
    setFundToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/app/dashboard')}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">Manage Funds</CardTitle>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Manage your wallet fund entries
            </p>
          </CardHeader>
        </Card>

        {/* Fund Entries */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Fund Entries</CardTitle>
            <p className="text-sm text-muted-foreground">
              {walletAdditions.length} fund {walletAdditions.length === 1 ? 'entry' : 'entries'} found
            </p>
          </CardHeader>
          <CardContent>
            {walletAdditions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No fund entries found</p>
                <p className="text-sm mt-2">Add funds to your wallet to see entries here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {walletAdditions.map((addition) => (
                  <div
                    key={addition.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                        <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-semibold text-foreground">
                            {formatCurrency(addition.amount, currencyCode)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(addition.date), 'MMM dd, yyyy')}</span>
                          </div>
                          
                          {addition.description && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span className="truncate max-w-48">{addition.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <AlertDialog open={deleteDialogOpen && fundToDelete === addition.id} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(addition.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Fund Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this fund entry of{' '}
                            <span className="font-semibold">
                              {formatCurrency(addition.amount, currencyCode)}
                            </span>
                            ? This action cannot be undone and will reduce your wallet balance.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Entry
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageFunds;
