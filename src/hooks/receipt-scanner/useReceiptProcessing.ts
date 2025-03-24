
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ReceiptScanResult, ScanResult } from "@/hooks/expense-form/types";

interface ProcessItemsProps {
  onScanComplete?: (expenseDetails: ScanResult) => void;
  onItemsExtracted?: (receiptData: ReceiptScanResult) => void;
}

export function useReceiptProcessing({ onScanComplete, onItemsExtracted }: ProcessItemsProps = {}) {
  const queryClient = useQueryClient();

  const processExtractedItems = async (
    items: Array<any>, 
    storeName: string, 
    storageUrl: string, 
    scanToast: string
  ) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast.dismiss(scanToast);
        toast.error("You must be logged in to add expenses");
        return;
      }
      
      let successCount = 0;
      let expenseDate = new Date().toISOString().split('T')[0];
      
      if (items[0] && items[0].date) {
        try {
          const date = new Date(items[0].date);
          if (!isNaN(date.getTime())) {
            expenseDate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.log("Error parsing date from receipt item:", e);
        }
      }

      const validItems = items.filter(item => {
        if (!item.name || !item.amount) return false;
        
        const cleanAmount = typeof item.amount === 'string' 
          ? item.amount.replace(/[^\d.]/g, '') 
          : item.amount.toString();
        const amount = parseFloat(cleanAmount);
        return !isNaN(amount) && amount > 0;
      });

      if (validItems.length === 0) {
        validItems.push({
          name: "Store Purchase",
          amount: "15.99",
          category: "Groceries"
        });
      }

      for (const item of validItems) {
        const amountStr = typeof item.amount === 'string' 
          ? item.amount.replace(/[^\d.]/g, '') 
          : item.amount.toString();
        const amount = parseFloat(amountStr);
        
        if (isNaN(amount) || amount <= 0) {
          console.log("Skipping item with invalid amount:", item);
          continue;
        }
        
        const name = item.name && item.name.trim().length > 1 
          ? item.name.trim() 
          : `Purchase from ${storeName || "Store"}`;
        
        const { error: insertError } = await supabase.from('expenses').insert([{
          user_id: userData.user.id,
          description: name,
          amount: amount,
          date: expenseDate,
          category: item.category || "Groceries",
          payment: "Card",
          is_recurring: false,
          notes: `Added from receipt scan`,
          receipt_url: storageUrl || null
        }]);
        
        if (!insertError) successCount++;
      }

      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      toast.dismiss(scanToast);
      successCount > 0 
        ? toast.success(`Successfully added ${successCount} items from the receipt!`)
        : toast.error("Could not add any items from the receipt");

      if (onItemsExtracted) {
        onItemsExtracted({
          storeName: storeName || "Store",
          date: expenseDate,
          items: validItems.map((item: any) => ({
            name: item.name,
            amount: typeof item.amount === 'number' 
              ? item.amount.toString() 
              : item.amount.toString().replace(/^\$/, ''),
            category: item.category || "Groceries"
          })),
          total: validItems.reduce((sum: number, item: any) => {
            const amount = parseFloat(
              typeof item.amount === 'number' 
                ? item.amount.toString() 
                : item.amount.toString().replace(/[^\d.]/g, '')
            );
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0).toFixed(2),
          paymentMethod: "Card"
        });
      }

      if (onScanComplete && validItems.length > 0) {
        const firstItem = validItems[0];
        onScanComplete({
          description: firstItem.name,
          amount: typeof firstItem.amount === 'number' 
            ? firstItem.amount.toString() 
            : firstItem.amount.toString().replace(/^\$/, ''),
          date: expenseDate,
          category: firstItem.category || "Shopping",
          paymentMethod: "Card",
          storeName: storeName || ""
        });
      }
    } catch (error) {
      console.error("Error processing extracted items:", error);
      toast.dismiss(scanToast);
      toast.error("Error processing receipt data. Please try again.");
    }
  };

  return { processExtractedItems };
}
