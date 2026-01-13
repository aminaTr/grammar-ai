import { supabase } from "@/lib/supabase/client";

export async function getGrammarHistory() {
  const { data, error } = await supabase
    .from("grammar_history")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
