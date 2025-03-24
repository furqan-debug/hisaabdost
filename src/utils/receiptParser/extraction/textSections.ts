
/**
 * Determines the starting line index for item extraction
 */
export function findItemSectionStart(lines: string[]): number {
  // Skip first few lines (likely header info)
  return Math.min(5, Math.floor(lines.length * 0.15));
}

/**
 * Determines the ending line index for item extraction
 */
export function findItemSectionEnd(lines: string[]): number {
  // Skip last few lines (likely footer/totals)
  return Math.max(lines.length - 5, Math.ceil(lines.length * 0.8));
}
