import { Correction } from "@/types/correction";
export function mergeCorrections(
  ruleCorrections: Correction[],
  llmCorrections: Correction[]
): Correction[] {
  const seen = new Set<string>();

  return [...ruleCorrections, ...llmCorrections].filter((c) => {
    const key = `${c.startIndex}-${c.endIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
