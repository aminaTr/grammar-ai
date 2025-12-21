import { Correction } from "@/types/correction";
import { v4 as uuidv4 } from "uuid";
export function runRules(text: string): Correction[] {
  const corrections: Correction[] = [];

  // Rule 1: Known contractions
  const contractions: Record<string, string> = {
    lets: "let's",
    dont: "don't",
    cant: "can't",
    wont: "won't",
    isnt: "isn't",
    didnt: "didn't",
  };

  Object.entries(contractions).forEach(([wrong, correct]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    let match;
    while ((match = regex.exec(text))) {
      // Preserve capitalization
      const original = match[0];
      const corrected =
        original[0] === original[0].toUpperCase()
          ? correct[0].toUpperCase() + correct.slice(1)
          : correct;

      corrections.push({
        id: uuidv4(),
        type: "spelling",
        original_segment: match[0],
        corrected_segment: corrected,
        explanation: "missing apostrophe in contraction",
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        status: "pending",
      });
    }
  });

  // Rule 2: Missing commas in lists
  const listRegex = /(\w+)\s+(\w+)\s+and\s+(\w+)/g;
  let listMatch;
  while ((listMatch = listRegex.exec(text))) {
    corrections.push({
      id: uuidv4(),
      type: "punctuation",
      original_segment: `${listMatch[1]} ${listMatch[2]} and`,
      corrected_segment: `${listMatch[1]}, ${listMatch[2]}, and`,
      explanation: "missing commas in list",
      startIndex: listMatch.index,
      endIndex: listMatch.index + `${listMatch[1]} ${listMatch[2]} and`.length,
      status: "pending",
    });
  }

  // Rule 3: Sentence-ending punctuation
  if (!/[.!?]$/.test(text.trim())) {
    corrections.push({
      id: uuidv4(),
      type: "punctuation",
      original_segment: "",
      corrected_segment: ".",
      explanation: "missing sentence-ending punctuation",
      startIndex: text.length,
      endIndex: text.length,
      status: "pending",
    });
  }

  return corrections;
}
