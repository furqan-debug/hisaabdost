
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
      console.log(`Scanning receipt: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      
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
                category: item.category || guessStoreCategory(item.name)
              })),
              total: receiptData.total || "0.00",
              paymentMethod: receiptData.paymentMethod || "Card"
            });
          }
        } else {
          toast.error("No items found on this receipt");
        }
        
        // Still support the original single-item flow for backward compatibility
        if (onScanComplete) {
          const extractedData: ScanResult = {
            storeName: receiptData.storeName || "",
            description: receiptData.storeName ? `Purchase from ${receiptData.storeName}` : "Purchase",
            amount: receiptData.total || "0.00",
            date: receiptData.date || new Date().toISOString().split('T')[0],
            category: guessStoreCategory(receiptData.storeName || ""),
            paymentMethod: receiptData.paymentMethod || "Card"
          };
          
          onScanComplete(extractedData);
        }
      } else if (data && !data.success) {
        toast.dismiss(scanToast);
        console.error("Receipt scan error:", data.error);
        toast.error(data.error || "Failed to extract information from receipt");
      } else {
        toast.dismiss(scanToast);
        toast.error("Receipt scanning failed. Please try uploading a clearer image.");
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      toast.dismiss(scanToast);
      toast.error("Receipt scanning failed. Please try again or enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  // Helper function to guess category based on store name or item name
  function guessStoreCategory(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Gas station related
    if (lowerText.includes('gas') || 
        lowerText.includes('shell') || 
        lowerText.includes('fuel') ||
        lowerText.includes('petrol') ||
        lowerText.includes('exxon') ||
        lowerText.includes('mobil') ||
        lowerText.includes('bp') ||
        lowerText.includes('chevron')) {
      return "Transportation";
    }
    
    // Grocery related
    if (lowerText.includes('supermarket') || 
        lowerText.includes('grocery') || 
        lowerText.includes('food') ||
        lowerText.includes('market')) {
      return "Groceries";
    }
    
    // Restaurant related
    if (lowerText.includes('restaurant') || 
        lowerText.includes('cafe') || 
        lowerText.includes('bar')) {
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
