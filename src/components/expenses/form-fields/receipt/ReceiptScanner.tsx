
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScanResult } from "@/hooks/expense-form/types";

interface ReceiptScannerProps {
  receiptUrl: string;
  onScanComplete?: (expenseDetails: ScanResult) => void;
}

export function useReceiptScanner({ receiptUrl, onScanComplete }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  // Check if we have a receipt image to scan
  const canScanReceipt = !!receiptUrl && !!receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i);

  const handleScanReceipt = async () => {
    const fileInput = document.getElementById('expense-receipt') as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      toast.error("Please upload a receipt image first");
      return;
    }

    setIsScanning(true);
    const scanToast = toast.loading("Scanning receipt...");
    
    try {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('receipt', file);

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || 'Failed to scan receipt');
      }

      console.log("Receipt scan response:", data);
      
      if (data && data.success && data.receiptData) {
        toast.dismiss(scanToast);
        toast.success("Receipt scanned successfully!");
        
        if (onScanComplete) {
          const receiptData = data.receiptData;
          
          // For single-item receipts, use that item description
          // For multi-item receipts, use the store name as the description
          let description = receiptData.storeName || "Store Purchase";
          let amount = "0.00";
          
          // Extract total amount
          if (receiptData.total && parseFloat(receiptData.total) > 0) {
            amount = receiptData.total;
          } else if (receiptData.items && receiptData.items.length > 0) {
            // Sum all items if no total found
            amount = receiptData.items.reduce((sum, item) => 
              sum + parseFloat(item.amount || "0"), 0).toFixed(2);
          }
          
          // Clean up description
          description = description
            .replace(/[^\w\s\-',.&]/g, '')  // Remove special chars
            .replace(/\s{2,}/g, ' ')        // Replace multiple spaces
            .trim();
          
          // Make sure we have a reasonable amount
          const parsedAmount = parseFloat(amount);
          if (isNaN(parsedAmount) || parsedAmount <= 0) {
            amount = "0.00";
          }
              
          onScanComplete({
            description: description,
            amount: amount,
            date: receiptData.date || new Date().toISOString().split('T')[0],
            category: "Groceries", // Default for supermarket receipts
            paymentMethod: receiptData.paymentMethod || "Card"
          });
        }
      } else {
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

  return {
    isScanning,
    canScanReceipt,
    handleScanReceipt
  };
}
