// /app/api/update-grammar-history/[id]/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { Correction } from "@/types/correction";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } // <-- params is a Promise now
) {
  const { id } = await context.params; // unwrap the promise

  const { correctionId, status, corrected_text } = await req.json();

  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch existing row
  const { data: row, error: fetchError } = await supabase
    .from("grammar_history")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Update the correction status in JSONB
  const updatedCorrections = row.corrections.map((c: Correction) =>
    c.id === correctionId ? { ...c, status } : c
  );

  const { error: updateError } = await supabase
    .from("grammar_history")
    .update({
      corrections: updatedCorrections,
      corrected_text,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, corrections: updatedCorrections });
}
