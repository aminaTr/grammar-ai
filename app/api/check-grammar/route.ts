import { NextResponse } from "next/server";
import { runRules } from "@/lib/rules";
import { callLLM } from "@/lib/groq";
import { validateCorrections } from "@/lib/validator";
import { mergeCorrections } from "@/lib/merge";
import { Correction } from "@/types/correction";
import { createServerSupabase } from "@/lib/supabase/server";
import { authorizeModelUse } from "@/lib/authorizeModelUse";
import { deductUserCredits } from "@/lib/deductUserCredits";
import { userHasRequiredCredits } from "@/lib/userHasRequiredCredits";

export async function POST(req: Request) {
  const { text, model } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  const hasCredits = await userHasRequiredCredits(user.id, text, model);

  if (!hasCredits) {
    return NextResponse.json(
      { error: "You do not have required credits for this query" },
      { status: 400 }
    );
  }

  const subscriptionPlan = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("user_id", user.id)
    .single();

  const authorized = authorizeModelUse(model, subscriptionPlan.data?.plan_id);

  if (!authorized) {
    return NextResponse.json(
      { error: "Unauthorized to use this model" },
      { status: 401 }
    );
  }

  const ruleCorrections = runRules(text);

  let llmCorrections: Correction[] = [];
  try {
    const { result: llmResponse, usedTokens } = await callLLM(text, model);
    console.log("llmresponse", llmResponse);
    llmCorrections = validateCorrections(text, llmResponse.corrections || []);
    console.log(
      "llmResponse.corrections",
      llmResponse.corrections,
      "\n\nllmCorrections",
      llmCorrections
    );

    deductUserCredits(user.id, model, usedTokens).catch((err) => {
      console.error("Credit deduction failed:", err);
    });
  } catch {
    llmCorrections = [];
    return NextResponse.json(
      { error: "Failed to process grammar check" },
      { status: 500 }
    );
  }
  const corrections = mergeCorrections(ruleCorrections, llmCorrections);

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

  return NextResponse.json(
    {
      session_id: session.id,
      original_text: text,
      corrections,
      message: "Grammar check completed!",
    },
    { status: 200 }
  );
}
