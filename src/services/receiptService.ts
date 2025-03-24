
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReceiptItem {
  name: string;
  amount: string;
  category?: string;
}

interface ReceiptData {
  merchant: string;
  date: string;
  total: string;
  items: ReceiptItem[];
  receiptUrl?: string;
  paymentMethod?: string;
  receiptText?: string;
}

/**
 * Saves extracted receipt data to the database
 */
export async function saveReceiptExtraction(receiptData: ReceiptData): Promise<string | null> {
  if (!receiptData) {
    console.error("No receipt data to save");
    return null;
  }

  try {
    // Validate user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to save receipt data");
      return null;
    }

    // Format data for database
    const receiptExtraction = {
      user_id: user.id,
      merchant: receiptData.merchant,
      date: new Date(receiptData.date).toISOString(),
      total: parseFloat(receiptData.total),
      receipt_url: receiptData.receiptUrl,
      payment_method: receiptData.paymentMethod,
      receipt_text: receiptData.receiptText,
      extraction_metadata: { source: "app_extraction" }
    };

    // Insert receipt record
    const { data: receiptRecord, error: receiptError } = await supabase
      .from('receipt_extractions')
      .insert(receiptExtraction)
      .select('id')
      .single();

    if (receiptError) {
      console.error("Error saving receipt:", receiptError);
      toast.error("Failed to save receipt data");
      return null;
    }

    const receiptId = receiptRecord.id;

    // Format and insert items
    if (receiptData.items && receiptData.items.length > 0) {
      const formattedItems = receiptData.items.map(item => ({
        receipt_id: receiptId,
        name: item.name,
        amount: parseFloat(item.amount),
        category: item.category || null
      }));

      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(formattedItems);

      if (itemsError) {
        console.error("Error saving receipt items:", itemsError);
        toast.error("Failed to save receipt items");
        // Continue anyway, as we've at least saved the receipt
      }
    }

    toast.success("Receipt data saved successfully");
    return receiptId;
  } catch (error) {
    console.error("Error in saveReceiptExtraction:", error);
    toast.error("An unexpected error occurred while saving receipt data");
    return null;
  }
}

/**
 * Retrieve a receipt by its ID
 */
export async function getReceiptById(receiptId: string) {
  try {
    // Get receipt data
    const { data: receipt, error: receiptError } = await supabase
      .from('receipt_extractions')
      .select('*')
      .eq('id', receiptId)
      .single();

    if (receiptError) {
      console.error("Error fetching receipt:", receiptError);
      return null;
    }

    // Get receipt items
    const { data: items, error: itemsError } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('receipt_id', receiptId)
      .order('amount', { ascending: false });

    if (itemsError) {
      console.error("Error fetching receipt items:", itemsError);
      return { receipt, items: [] };
    }

    return { receipt, items };
  } catch (error) {
    console.error("Error in getReceiptById:", error);
    return null;
  }
}

/**
 * Get recent receipts for a user
 */
export async function getUserReceipts(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('receipt_extractions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching user receipts:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in getUserReceipts:", error);
    return [];
  }
}

/**
 * Delete a receipt and its items
 */
export async function deleteReceipt(receiptId: string) {
  try {
    const { error } = await supabase
      .from('receipt_extractions')
      .delete()
      .eq('id', receiptId);

    if (error) {
      console.error("Error deleting receipt:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteReceipt:", error);
    return false;
  }
}
