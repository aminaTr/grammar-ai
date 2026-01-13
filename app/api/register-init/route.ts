import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { BASE_PLANS } from "@/lib/constants/plans";

const FREE_PLAN_CREDITS = BASE_PLANS.free.monthlyCredits;

export async function POST(req: Request) {
  const { userId, email } = await req.json();

  if (!userId || !email) {
    return NextResponse.json(
      { error: "Missing userId or email" },
      { status: 400 }
    );
  }

  try {
    // Free subscription
    await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      plan_id: "free",
      status: "active",
      stripe_subscription_id: null,
      stripe_price_id: null,
      stripe_customer_id: null,
      current_period_end: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Free credits
    await supabaseAdmin.from("user_credits").upsert({
      user_id: userId,
      subscription_credits: FREE_PLAN_CREDITS,
      purchased_credits: 0,
      last_reset: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "Free subscription and credits created" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup init error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
