
import { extractAmount } from "../amountExtractor";

/**
 * Creates a generic item if no individual items could be found
 */
export function createFallbackItem(
  lines: string[], 
  fullText: string
): Array<{name: string; amount: string}> {
  console.log("No items found through pattern matching, using total amount");
  
  // Look for total amount
  const totalAmount = extractAmount(lines, fullText);
  if (totalAmount !== "0.00") {
    console.log(`Creating generic item with total amount: $${totalAmount}`);
    return [{
      name: "Store Purchase",
      amount: totalAmount
    }];
  } else {
    // Last resort - create a default item if we couldn't find anything
    console.log("Could not find any amounts, creating default item");
    return [{
      name: "Purchase",
      amount: "10.00" // Default amount
    }];
  }
}
