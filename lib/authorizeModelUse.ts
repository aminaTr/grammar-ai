import { BASE_PLANS, PAID_PLANS } from "./constants/plans";

export function authorizeModelUse(
  model: string,
  subscriptionPlan: string
): boolean {
  if (subscriptionPlan === "free") {
    const basePlan = BASE_PLANS["free"];
    if (!basePlan.models.includes(model)) {
      return false;
    }
  } else {
    const paidPlan = PAID_PLANS[subscriptionPlan];
    if (paidPlan && !paidPlan?.models.includes(model)) {
      return false;
    }
  }
  return true;
}
