import { NextResponse } from "next/server";
import { runRules } from "@/lib/rules";
import { callLLM } from "@/lib/groq";
import { validateCorrections } from "@/lib/validator";
import { mergeCorrections } from "@/lib/merge";
import { Correction } from "@/types/correction";

export async function POST(req: Request) {
  const { text } = await req.json();
  const ruleCorrections = runRules(text);

  let llmCorrections: Correction[] = [];
  try {
    const llmResponse = await callLLM(text);
    llmCorrections = validateCorrections(text, llmResponse.corrections || []);
    console.log("ruleCorrections", ruleCorrections);
    console.log("llmCorrections", llmCorrections);
  } catch {
    llmCorrections = [];
  }

  const corrections = mergeCorrections(ruleCorrections, llmCorrections);

  return NextResponse.json({
    original_text: text,
    corrections,
  });
}
