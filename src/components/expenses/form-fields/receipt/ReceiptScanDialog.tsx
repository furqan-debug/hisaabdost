
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScanLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

interface ReceiptScanDialogProps {
  file: File | null;
  previewUrl: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onCleanup: () => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  autoSave?: boolean;
}

export function ReceiptScanDialog({
  file,
  previewUrl,
  open,
  setOpen,
  onCleanup,
  onCapture,
  autoSave = false
}: ReceiptScanDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);

  const saveExpenseToDatabase = async (expense: {
    description: string;
    amount: number;
    date: string;
    category: string;
    paymentMethod: string;
  }) => {
    if (!user) {
      toast.error("You must be logged in to add expenses");
      return false;
    }
    
    try {
      console.log("Saving expense:", expense);
      const { error } = await supabase.from('expenses').insert([{
        user_id: user.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        // Always use "Shopping" category for OCR-scanned receipts
        category: "Shopping",
        payment: expense.paymentMethod,
        is_recurring: false
      }]);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error saving expense:", error);
      return false;
    }
  };

  const handleScanReceipt = async () => {
    if (!file) {
      toast.error("No receipt image to scan");
      return;
    }

    setIsScanning(true);
    const scanToast = toast.loading("Scanning your receipt...");
    
    try {
      console.log("Processing receipt scan with file:", file.name, file.type);
      const formData = new FormData();
      formData.append('receipt', file);

      // Make sure we're accessing the edge function correctly
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || 'Failed to scan receipt');
      }

      console.log("Receipt scan response:", data);
      
      if (data && data.success && data.receiptData) {
        const receiptData = data.receiptData;
        
        // Ensure we have a valid date
        if (!receiptData.date || receiptData.date === "Invalid Date") {
          receiptData.date = new Date().toISOString().split('T')[0];
        }
        
        if (autoSave && user) {
          // If autoSave is enabled, save all items directly
          toast.dismiss(scanToast);
          toast.loading("Adding expenses from receipt...", { id: "adding-expenses" });
          
          let savedCount = 0;
          const itemCount = receiptData.items.length;
          
          // Save each item as a separate expense
          for (const item of receiptData.items) {
            // Skip items with empty names or zero amounts
            if (!item.name || parseFloat(item.amount) <= 0) {
              console.log("Skipping invalid item:", item);
              continue;
            }
            
            console.log("Saving item:", item);
            const success = await saveExpenseToDatabase({
              description: item.name,
              amount: parseFloat(item.amount),
              date: receiptData.date,
              // Always use "Shopping" category for OCR-scanned receipts 
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod
            });
            
            if (success) savedCount++;
          }
          
          // Refresh the expenses list
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
          
          toast.dismiss("adding-expenses");
          if (savedCount > 0) {
            toast.success(`Added ${savedCount} expense(s) from receipt`);
          } else {
            toast.error("Failed to add expenses from receipt");
          }
          
          setOpen(false);
        } else if (onCapture) {
          // If onCapture is provided, use the first item or default to store data
          if (receiptData.items && receiptData.items.length > 0) {
            const firstItem = receiptData.items[0];
            onCapture({
              description: firstItem.name || receiptData.storeName || "Store purchase",
              amount: firstItem.amount || receiptData.total || "0.00",
              date: receiptData.date || new Date().toISOString().split('T')[0],
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod || "Cash"
            });
          } else {
            onCapture({
              description: receiptData.storeName || "Store purchase",
              amount: receiptData.total || "0.00",
              date: receiptData.date || new Date().toISOString().split('T')[0],
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod || "Cash"
            });
          }
          toast.dismiss(scanToast);
          toast.success("Receipt details extracted successfully!");
        }
      } else {
        console.error("Invalid data format received:", data);
        toast.dismiss(scanToast);
        toast.error(data?.error || "Failed to extract information from receipt");
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      toast.dismiss(scanToast);
      toast.error("Receipt scanning failed. Please try again or enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) onCleanup();
      setOpen(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Scan Receipt</DialogTitle>
        <DialogDescription>
          {autoSave 
            ? "We'll extract all items and save them automatically" 
            : "We'll extract the store name, amount, date and other details"}
        </DialogDescription>
        
        <div className="flex flex-col items-center space-y-4">
          {previewUrl && (
            <div className="relative w-full max-h-64 overflow-hidden rounded-md border">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="w-full object-contain"
              />
            </div>
          )}
          
          <div className="flex w-full justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCleanup}
            >
              Cancel
            </Button>
            
            <Button
              type="button"
              onClick={handleScanReceipt}
              disabled={isScanning || !file}
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                  {autoSave ? "Extract & Save All Items" : "Extract Data"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
