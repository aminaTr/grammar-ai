export type BasePlanType = {
  id: string;
  models: string[];
  monthlyCredits: number;
};

export type PaidPlanType = BasePlanType & {
  stripeLookupKeys: string[];
  stripePriceIds: string;
};
