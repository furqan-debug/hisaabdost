
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function saveExpenseFromScan(scanResult: {
  items: Array<{
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
    receiptUrl?: string | null;
  }>;
  merchant?: string;
  date?: string;
}): Promise<boolean> {
  try {
    // Check if we have a logged-in user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.error("User not authenticated");
      
      // Store the receipt data in sessionStorage for later use
      // This allows the form to be populated even without saving to DB
      sessionStorage.setItem('lastScanResult', JSON.stringify(scanResult));
      
      // Return true to indicate that at least we saved to session
      return true;
    }
    
    const userId = userData.user.id;
    
    // First, save receipt extraction to database
    const { data: extractionData, error: extractionError } = await supabase
      .from('receipt_extractions')
      .insert({
        user_id: userId,
        merchant: scanResult.merchant || 'Unknown',
        date: scanResult.date || new Date().toISOString().split('T')[0],
        total: scanResult.items.reduce((sum, item) => sum + parseFloat(item.amount), 0),
        receipt_url: scanResult.items[0]?.receiptUrl || null,
        receipt_text: JSON.stringify(scanResult),
        payment_method: scanResult.items[0]?.paymentMethod || 'Card'
      })
      .select()
      .single();
      
    if (extractionError) {
      console.error("Error saving receipt extraction:", extractionError);
      // Continue even if receipt extraction fails
    }
    
    const receiptId = extractionData?.id;
    
    // Format and validate items
    const validatedItems = scanResult.items.map(item => {
      // Validate date
      let itemDate = item.date;
      try {
        // Try to parse as date, fall back to today if invalid
        const date = new Date(item.date);
        if (isNaN(date.getTime())) {
          itemDate = new Date().toISOString().split('T')[0];
        }
      } catch (e) {
        itemDate = new Date().toISOString().split('T')[0];
      }
      
      // Validate amount
      let itemAmount = parseFloat(item.amount.replace(/[^\d.-]/g, ''));
      if (isNaN(itemAmount) || itemAmount <= 0) {
        itemAmount = 0.01; // Set a minimum amount
      }
      
      // Format payment method
      const paymentMethod = item.paymentMethod || 'Card';
      
      return {
        user_id: userId,
        description: item.description || 'Store Purchase',
        amount: itemAmount,
        date: itemDate,
        category: item.category || 'Other',
        is_recurring: false,
        receipt_url: item.receiptUrl || null,
        payment: paymentMethod
      };
    });
    
    // Save all expenses in a batch
    if (validatedItems.length > 0) {
      const { error: expensesError } = await supabase
        .from('expenses')
        .insert(validatedItems);
        
      if (expensesError) {
        console.error("Error saving expenses:", expensesError);
        toast.error("Failed to save expenses to database");
        return false;
      }
      
      // If we have a receipt ID, also save receipt items
      if (receiptId && extractionData) {
        try {
          const receiptItems = scanResult.items.map(item => ({
            receipt_id: receiptId,
            name: item.description,
            amount: parseFloat(item.amount.replace(/[^\d.-]/g, '')),
            category: item.category
          }));
          
          await supabase
            .from('receipt_items')
            .insert(receiptItems);
        } catch (itemError) {
          console.error("Error saving receipt items:", itemError);
          // Continue even if receipt items fail
        }
      }
      
      console.log(`Successfully saved ${validatedItems.length} expenses`);
      return true;
    } else {
      console.error("No valid items to save");
      return false;
    }
  } catch (error) {
    console.error("Error in saveExpenseFromScan:", error);
    return false;
  }
}
