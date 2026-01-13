import { supabaseAdmin } from "@/lib/supabase/admin";
import { ModelName, calculateCredits } from "./conversionRate";

export async function deductUserCredits(
  userId: string,
  model: ModelName,
  usedTokens: number
) {
  // Calculate required credits
  const creditsToDeduct = calculateCredits(model, usedTokens);
  console.log("Tokens used", usedTokens);
  // Fetch current credits
  const { data: userCredits, error: fetchError } = await supabaseAdmin
    .from("user_credits")
    .select("subscription_credits, purchased_credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError || !userCredits) {
    console.log(fetchError, userCredits, creditsToDeduct);
    throw new Error("Failed to fetch user credits");
  }

  let { subscription_credits, purchased_credits } = userCredits;
  let remainingDeduct = creditsToDeduct;

  // Deduct from subscribed_credits first
  if (subscription_credits >= remainingDeduct) {
    subscription_credits -= remainingDeduct;
    remainingDeduct = 0;
  } else {
    remainingDeduct -= subscription_credits;
    subscription_credits = 0;
  }

  // Deduct remaining from purchased_credits
  if (remainingDeduct > 0) {
    if (purchased_credits >= remainingDeduct) {
      purchased_credits -= remainingDeduct;
      remainingDeduct = 0;
    } else {
      // Not enough credits total
      throw new Error("Not enough credits to perform this operation");
    }
  }

  // Update DB atomically
  const { data, error: updateError } = await supabaseAdmin
    .from("user_credits")
    .update({ subscription_credits, purchased_credits })
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (updateError || !data) {
    throw new Error("Failed to deduct credits");
  }

  return data; // updated credit balances
}
