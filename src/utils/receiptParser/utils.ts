
/**
 * Checks if text is likely not an item (common non-item text patterns)
 */
export function isNonItemText(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Common non-item text patterns
  return lowerText.includes("total") ||
         lowerText.includes("subtotal") ||
         lowerText.includes("tax") ||
         lowerText.includes("discount") ||
         lowerText.includes("coupon") ||
         lowerText.includes("change") ||
         lowerText.includes("balance") ||
         lowerText.includes("receipt") ||
         lowerText.includes("cashier") ||
         lowerText.includes("date") ||
         lowerText.includes("time") ||
         lowerText.includes("order") ||
         lowerText.includes("item") ||
         lowerText.includes("qty") ||
         lowerText.includes("quantity") ||
         lowerText.includes("price") ||
         lowerText.includes("amount") ||
         lowerText.includes("payment") ||
         lowerText.includes("thank you") ||
         lowerText.includes("thanks") ||
         lowerText.includes("please") ||
         lowerText === "cash" ||
         lowerText === "card" ||
         lowerText === "void" ||
         lowerText === "debit" ||
         lowerText === "credit" ||
         lowerText === "approved" ||
         lowerText === "paid" ||
         lowerText === "due" ||
         lowerText.match(/^\d+$/) !== null; // Just numbers
}
