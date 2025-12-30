// /lib/applyCorrections.ts
import { Correction } from "@/types/correction";

/**
 * Merge accepted corrections into the original text
 */
export function applyAcceptedCorrections(
  originalText: string,
  corrections: Correction[]
) {
  if (!corrections || corrections.length === 0) return originalText;

  const accepted = corrections
    .filter((c) => c.status === "accepted")
    .sort((a, b) => b.startIndex - a.startIndex); // reverse order for safe replacement

  let result = originalText;
  accepted.forEach((c) => {
    result =
      result.slice(0, c.startIndex) +
      c.corrected_segment +
      result.slice(c.endIndex);
  });

  return result;
}
