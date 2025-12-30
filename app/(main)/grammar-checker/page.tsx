import GrammarCheck from "@/components/grammar/GrammarCheck";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const GrammarPage = async () => {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <GrammarCheck />
    </div>
  );
};

export default GrammarPage;
