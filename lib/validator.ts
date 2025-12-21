import { Correction } from "@/types/correction";
import { v4 as uuidv4 } from "uuid";

export function validateCorrections(
  text: string,
  corrections: Partial<Correction>[]
): Correction[] {
  const completeCorrections: Correction[] = corrections.map((c) => ({
    id: c.id || uuidv4(),
    status: c.status || "pending",
    type: c.type!,
    original_segment: c.original_segment!,
    corrected_segment: c.corrected_segment!,
    startIndex: c.startIndex!,
    endIndex: c.endIndex!,
    explanation: c.explanation || "",
  }));

  return completeCorrections.filter((c) => {
    if (
      typeof c.startIndex !== "number" ||
      typeof c.endIndex !== "number" ||
      c.startIndex < 0 ||
      c.endIndex < c.startIndex ||
      c.endIndex > text.length
    ) {
      return false;
    }

    const segment = text.slice(c.startIndex, c.endIndex);
    if (segment !== c.original_segment) return false;

    if (!["grammar", "spelling", "punctuation"].includes(c.type)) return false;

    if (!c.corrected_segment || c.corrected_segment.trim() === "") return false;

    return true;
  });
}
