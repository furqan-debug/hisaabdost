
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
          
          // Extract the most likely store item
          let description = "";
          let amount = "0.00";
          
          // Use the first item as the expense item
          if (receiptData.items && receiptData.items.length > 0) {
            const item = receiptData.items[0];
            description = item.name || "";
            amount = item.amount || "0.00";
          }
          
          // If no valid items, use store name with total
          if (!description || parseFloat(amount) <= 0) {
            description = receiptData.storeName || "Store Purchase";
            amount = receiptData.total || "0.00";
          }
          
          // Ensure amount is a valid number
          try {
            amount = parseFloat(amount).toFixed(2);
          } catch (e) {
            amount = "0.00";
          }
              
          onScanComplete({
            description: description,
            amount: amount,
            date: receiptData.date || new Date().toISOString().split('T')[0],
            category: "Shopping", // Default for most receipts
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
