
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
        receipt_url: sanitizeReceiptUrl(scanResult.items[0]?.receiptUrl),
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
      let itemDate = validateDate(item.date);
      
      // Validate amount
      let itemAmount = validateAmount(item.amount);
      
      // Sanitize receipt URL (don't save blob URLs)
      const receiptUrl = sanitizeReceiptUrl(item.receiptUrl);
      
      // Format payment method - Map paymentMethod to payment column
      const payment = item.paymentMethod || 'Card';
      
      return {
        user_id: userId,
        description: item.description || 'Store Purchase',
        // Convert amount to number for database
        amount: parseFloat(itemAmount),
        date: itemDate,
        category: item.category || 'Other',
        is_recurring: false,
        receipt_url: receiptUrl,
        payment: payment // Use payment instead of paymentMethod to match database column name
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
            amount: parseFloat(validateAmount(item.amount)),
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

// Helper function to validate date
function validateDate(dateStr: string): string {
  try {
    // Check if date is in valid format
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // Default to today if invalid
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

// Helper function to validate amount
function validateAmount(amount: string): string {
  try {
    // Remove any non-numeric characters except decimal point
    const cleanAmount = amount.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleanAmount);
    
    if (isNaN(num) || num <= 0) {
      return "0.01";
    }
    
    return num.toFixed(2);
  } catch (e) {
    return "0.01";
  }
}

// Helper function to sanitize receipt URL
function sanitizeReceiptUrl(url?: string | null): string | null {
  if (!url) return null;
  
  // Don't save blob URLs to database
  if (url.startsWith('blob:')) {
    console.log("Avoiding storing blob URL in database");
    return null;
  }
  
  return url;
}
