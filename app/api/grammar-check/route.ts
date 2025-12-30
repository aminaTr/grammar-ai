import { NextResponse } from "next/server";
import { runRules } from "@/lib/rules";
import { callLLM } from "@/lib/groq";
import { validateCorrections } from "@/lib/validator";
import { mergeCorrections } from "@/lib/merge";
import { Correction } from "@/types/correction";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const ruleCorrections = runRules(text);

  let llmCorrections: Correction[] = [];
  try {
    const llmResponse = await callLLM(text);
    llmCorrections = validateCorrections(text, llmResponse.corrections || []);
  } catch {
    llmCorrections = [];
  }

  const corrections = mergeCorrections(ruleCorrections, llmCorrections);

  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: session, error: insertError } = await supabase
    .from("grammar_history")
    .insert({
      user_id: user.id,
      input_text: text,
      corrected_text: "",
      explanation: "Grammar checked by AI",
      corrections, // JSON array
    })
    .select()
    .single();

  if (insertError) {
    console.error(insertError);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    session_id: session.id,
    original_text: text,
    corrections,
  });
}

// import { NextResponse } from "next/server";
// import { runRules } from "@/lib/rules";
// import { callLLM } from "@/lib/groq";
// import { validateCorrections } from "@/lib/validator";
// import { mergeCorrections } from "@/lib/merge";
// import { Correction } from "@/types/correction";

// export async function POST(req: Request) {
//   const { text } = await req.json();
//   const ruleCorrections = runRules(text);

//   let llmCorrections: Correction[] = [];
//   try {
//     const llmResponse = await callLLM(text);
//     llmCorrections = validateCorrections(text, llmResponse.corrections || []);
//     console.log("ruleCorrections", ruleCorrections);
//     console.log("llmCorrections", llmCorrections);
//   } catch {
//     llmCorrections = [];
//   }

//   const corrections = mergeCorrections(ruleCorrections, llmCorrections);

//   return NextResponse.json({
//     original_text: text,
//     corrections,
//   });
// }
