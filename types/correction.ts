import { ZodUUID } from "zod";

// types/correction.ts
export type CorrectionType = "grammar" | "spelling" | "punctuation";

export interface Correction {
  id: string;
  type: CorrectionType;
  original_segment: string;
  corrected_segment: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
  status: "pending" | "accepted" | "rejected";
}
