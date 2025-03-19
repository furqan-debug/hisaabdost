
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReceiptScannerProps {
  receiptUrl: string;
  onScanComplete?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
}

export function useReceiptScanner({ receiptUrl, onScanComplete }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  // Fixed: Convert the RegExpMatchArray to boolean using !!
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
          // Use the first item or aggregate data if there are multiple items
          const receiptData = data.receiptData;
          
          if (receiptData.items && receiptData.items.length > 0) {
            // For single-item receipts, use that item
            // For multi-item receipts, we'll use the store name as the description
            const description = receiptData.items.length === 1 
              ? receiptData.items[0].name 
              : receiptData.storeName || "Store Purchase";
              
            const amount = receiptData.items.length === 1 
              ? receiptData.items[0].amount 
              : receiptData.total;
              
            onScanComplete({
              description: description,
              amount: amount || receiptData.total || "0.00",
              date: receiptData.date || new Date().toISOString().split('T')[0],
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod || "Card"
            });
          } else {
            // Fallback to using overall receipt data
            onScanComplete({
              description: receiptData.storeName || "Store Purchase",
              amount: receiptData.total || "0.00",
              date: receiptData.date || new Date().toISOString().split('T')[0],
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod || "Card"
            });
          }
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
