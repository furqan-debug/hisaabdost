
import { isNonItemText } from "./utils";
import { extractAmount } from "./amountExtractor";
import { findItemSectionStart, findItemSectionEnd } from "./extraction/textSections";
import { extractItemsWithPricePatterns } from "./extraction/patternMatching";
import { extractItemsAggressively, extractItemsWithNumberPatterns } from "./extraction/aggressiveExtraction";
import { createFallbackItem } from "./extraction/fallbackExtraction";
import { deduplicateItems } from "./extraction/itemDeduplication";

/**
 * Extracts individual line items with their prices
 */
export function extractLineItems(lines: string[], fullText: string): Array<{name: string; amount: string}> {
  const items: Array<{name: string; amount: string}> = [];
  console.log("Starting item extraction from", lines.length, "lines");
  
  // Focus on the middle portion of the receipt where items usually are
  const startIndex = findItemSectionStart(lines);
  const endIndex = findItemSectionEnd(lines);
  
  console.log(`Processing lines from ${startIndex} to ${endIndex}`);
  
  // First pass: Look for clear price patterns
  const standardItems = extractItemsWithPricePatterns(lines, startIndex, endIndex);
  items.push(...standardItems);
  
  // Second pass: more aggressive approach if first pass found very few items
  if (items.length <= 1) {
    const aggressiveItems = extractItemsAggressively(lines, startIndex, endIndex);
    items.push(...aggressiveItems);
  }
  
  // Third pass: look for number-only patterns that might be prices
  if (items.length === 0) {
    const numberPatternItems = extractItemsWithNumberPatterns(lines, startIndex, endIndex);
    items.push(...numberPatternItems);
  }
  
  // If we still found no items, create at least one item based on the total
  if (items.length === 0) {
    const fallbackItems = createFallbackItem(lines, fullText);
    items.push(...fallbackItems);
  }
  
  console.log(`Final item count: ${items.length}`);
  
  // Remove duplicates and sort by price (largest first)
  return deduplicateItems(items);
}
