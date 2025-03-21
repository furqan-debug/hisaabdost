
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ReceiptScanResult, ScanResult } from "@/hooks/expense-form/types";

interface ReceiptScannerProps {
  receiptUrl: string;
  onScanComplete?: (expenseDetails: ScanResult) => void;
  onItemsExtracted?: (receiptData: ReceiptScanResult) => void;
}

export function useReceiptScanner({ 
  receiptUrl, 
  onScanComplete,
  onItemsExtracted 
}: ReceiptScannerProps) {
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
        
        const receiptData = data.receiptData;
        console.log("Extracted receipt data:", receiptData);
        
        // Check if we have individual items
        if (receiptData.items && receiptData.items.length > 0) {
          console.log(`Found ${receiptData.items.length} individual items on receipt`);
          
          if (onItemsExtracted) {
            // Pass the entire receipt data with items to the handler
            onItemsExtracted({
              storeName: receiptData.storeName || "Store",
              date: receiptData.date || new Date().toISOString().split('T')[0],
              items: receiptData.items.map(item => ({
                name: item.name,
                amount: item.amount,
                category: item.category || "Groceries"
              })),
              total: receiptData.total || "0.00",
              paymentMethod: receiptData.paymentMethod || "Card"
            });
          }
        }
        
        // Still support the original single-item flow for backward compatibility
        if (onScanComplete) {
          const extractedData: ScanResult = {
            storeName: receiptData.storeName || "",
            description: receiptData.storeName ? `Purchase from ${receiptData.storeName}` : "Grocery Purchase",
            amount: receiptData.total || "0.00",
            date: receiptData.date || new Date().toISOString().split('T')[0],
            category: guessStoreCategory(receiptData.storeName || ""),
            paymentMethod: receiptData.paymentMethod || "Card"
          };
          
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

  // Helper function to guess category based on store name
  function guessStoreCategory(storeName: string): string {
    const lowerName = storeName.toLowerCase();
    
    if (lowerName.includes('supermarket') || 
        lowerName.includes('grocery') || 
        lowerName.includes('food') ||
        lowerName.includes('market')) {
      return "Groceries";
    }
    
    if (lowerName.includes('restaurant') || 
        lowerName.includes('cafe') || 
        lowerName.includes('bar')) {
      return "Restaurant";
    }
    
    return "Shopping";
  }

  return {
    isScanning,
    canScanReceipt,
    handleScanReceipt
  };
}
