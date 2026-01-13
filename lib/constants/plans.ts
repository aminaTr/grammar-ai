import { BasePlanType, PaidPlanType } from "@/types/planTypes";

export const MODELS: string[] = [
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
  "qwen/qwen3-32b",
  "openai/gpt-oss-20b",
];

export const BASE_PLANS: Record<string, BasePlanType> = {
  free: { id: "free", models: MODELS.slice(0, 1), monthlyCredits: 500 },
};

export const PAID_PLANS: Record<string, PaidPlanType> = {
  standard: {
    id: "standard",
    stripeLookupKeys: ["standard_monthly", "standard_yearly"],
    models: MODELS.slice(0, 2),
    monthlyCredits: 5000,
    stripePriceIds: "price_1Sl6LjEiuqRSTzVguqLSYowi",
  },
  pro: {
    id: "pro",
    stripeLookupKeys: ["pro_monthly", "pro_yearly"],
    models: MODELS,
    monthlyCredits: 20000,
    stripePriceIds: "price_1Sl6JyEiuqRSTzVg3K9y1QKK",
  },
};

export const BUY_CREDIT_PACKS = {
  id: "buy_credits",
  stripeLookupKeys: ["credits_5", "credits_10", "credits_20"], // your internal keys
  stripePriceIds: [
    "price_1SkmsiEiuqRSTzVgXhu5ZAwc", // credits_5
    "price_1SkmthEiuqRSTzVgeQJlwQVH", // credits_10
    "price_1SkmuqEiuqRSTzVgqOBpbCTP", // credits_20
  ],
  oneTimeCreditsMap: {
    price_1SkmsiEiuqRSTzVgXhu5ZAwc: 500,
    price_1SkmthEiuqRSTzVgeQJlwQVH: 1000,
    price_1SkmuqEiuqRSTzVgqOBpbCTP: 2000,
  } as Record<string, number>,
};
