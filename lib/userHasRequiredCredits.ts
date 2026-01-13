import { supabaseAdmin } from "./supabase/admin";
import { countTokens } from "./tokenizer";
import { calculateCredits } from "./conversionRate";
import { ModelName } from "./conversionRate";

export async function userHasRequiredCredits(
  userId: string,
  text: string,
  model: ModelName
): Promise<boolean> {
  const { data: userCredits, error } = await supabaseAdmin
    .from("user_credits")
    .select("subscription_credits, purchased_credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !userCredits) {
    throw new Error("Failed to fetch user credits");
  }
  const { subscription_credits, purchased_credits } = userCredits;

  const availableCredits =
    (subscription_credits ?? 0) + (purchased_credits ?? 0);
  const requiredCredits = calculateCredits(model, countTokens(text, model));
  console.log(
    "requiredCredits",
    requiredCredits,
    ", availableCredits",
    availableCredits
  );
  return availableCredits >= requiredCredits;
}
