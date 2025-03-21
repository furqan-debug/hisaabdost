
import { extractMerchant } from "./merchantExtractor";
import { extractLineItems } from "./itemExtractor";
import { extractDate } from "./dateExtractor";
import { extractAmount } from "./amountExtractor";

/**
 * Extracts merchant name, items with prices, and date from receipt text
 * @param text - The OCR text extracted from a receipt
 * @returns Object containing merchant, items array, and date
 */
export function parseReceiptText(text: string): { 
  merchant: string; 
  items: Array<{name: string; amount: string}>;
  date: string;
} {
  // Split into lines for easier processing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract merchant name (usually at the top of the receipt)
  const merchant = extractMerchant(lines);
  
  // Extract line items with their prices
  const items = extractLineItems(lines, text);
  
  // Extract date
  const date = extractDate(text, lines);
  
  return {
    merchant,
    items,
    date
  };
}
