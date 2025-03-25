
import { isNonItemText } from "./utils";
import { extractAmount } from "./amountExtractor";
import { findItemSectionStart, findItemSectionEnd } from "./extraction/textSections";
import { extractItemsWithPricePatterns, extractSupermarketItems } from "./extraction/patternMatching";
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
  
  // First pass: Check if this is a supermarket receipt and use specialized extraction
  const supermarketItems = extractSupermarketItems(lines, startIndex, endIndex);
  if (supermarketItems.length > 0) {
    console.log("Identified as supermarket receipt, using specialized extraction");
    items.push(...supermarketItems);
  } else {
    // Second pass: Look for clear price patterns with normal extraction
    const standardItems = extractItemsWithPricePatterns(lines, startIndex, endIndex);
    items.push(...standardItems);
  }
  
  // Third pass: more aggressive approach if first passes found very few items
  if (items.length <= 1) {
    console.log("Few items found, using aggressive extraction");
    const aggressiveItems = extractItemsAggressively(lines, startIndex, endIndex);
    items.push(...aggressiveItems);
  }
  
  // Fourth pass: look for number-only patterns that might be prices
  if (items.length === 0) {
    console.log("No items found, trying number pattern extraction");
    const numberPatternItems = extractItemsWithNumberPatterns(lines, startIndex, endIndex);
    items.push(...numberPatternItems);
  }
  
  // If we still found no items, create at least one item based on the total
  if (items.length === 0) {
    console.log("Creating fallback item based on total");
    const fallbackItems = createFallbackItem(lines, fullText);
    items.push(...fallbackItems);
  }
  
  console.log(`Final item count: ${items.length}`);
  
  // Remove duplicates and sort by price (largest first)
  return deduplicateItems(items);
}
