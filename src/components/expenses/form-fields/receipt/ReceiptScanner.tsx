
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

  const canScanReceipt = !!receiptUrl && receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i);

  const handleScanReceipt = async () => {
    const fileInput = document.getElementById('expense-receipt') as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      toast.error("Please upload a receipt image first");
      return;
    }

    setIsScanning(true);
    try {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('receipt', file);

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to scan receipt');
      }

      if (data.success && data.receiptData) {
        toast.success("Receipt scanned successfully!");
        if (onScanComplete) {
          // Use the receiptData to populate expense details
          const receiptData = data.receiptData;
          
          if (receiptData.items && receiptData.items.length > 0) {
            // Use the first item's details
            const firstItem = receiptData.items[0];
            onScanComplete({
              description: firstItem.name || receiptData.storeName,
              amount: firstItem.amount || receiptData.total,
              date: receiptData.date,
              // Always use "Shopping" category for OCR-scanned receipts
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod
            });
          } else {
            // Fallback to using overall receipt data
            onScanComplete({
              description: receiptData.storeName || "Store Purchase",
              amount: receiptData.total || "0.00",
              date: receiptData.date,
              // Always use "Shopping" category for OCR-scanned receipts
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod
            });
          }
        }
      } else {
        toast.error(data.error || "Failed to extract information from receipt");
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
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
