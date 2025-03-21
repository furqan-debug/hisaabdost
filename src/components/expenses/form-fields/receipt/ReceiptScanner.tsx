
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
        throw new Error(error.message || 'Failed to scan receipt');
      }
      
      if (data && data.success && data.receiptData) {
        toast.dismiss(scanToast);
        toast.success("Receipt scanned successfully!");
        
        if (onScanComplete) {
          const receiptData = data.receiptData;
          
          // Create a complete data object with all available information
          const extractedData: ScanResult = {
            storeName: receiptData.storeName || "",
            description: receiptData.storeName ? `Purchase from ${receiptData.storeName}` : "Grocery Purchase",
            amount: receiptData.total || "0.00",
            date: receiptData.date || new Date().toISOString().split('T')[0],
            category: receiptData.storeName?.toLowerCase().includes('supermarket') ? 
                      "Groceries" : receiptData.storeName?.toLowerCase().includes('restaurant') ? 
                      "Restaurant" : "Shopping",
            paymentMethod: receiptData.paymentMethod || "Card"
          };
          
          // Log the extracted data for debugging
          console.log("Extracted receipt data:", extractedData);
          
          onScanComplete(extractedData);
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
