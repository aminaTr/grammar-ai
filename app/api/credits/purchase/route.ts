// app/api/credits/purchase/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BUY_CREDIT_PACKS } from "@/lib/constants/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: Request) {
  try {
    const { priceId, userId, email } = await req.json();

    if (!priceId || !userId || !email) {
      return NextResponse.json(
        { error: "Missing priceId, userId, or email" },
        { status: 400 }
      );
    }

    const credits = BUY_CREDIT_PACKS.oneTimeCreditsMap[priceId];
    if (!credits) throw new Error("Invalid priceId for credits pack");

    // Check if user already has a Stripe customer
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    // Create Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits/cancel`,
      metadata: {
        userId,
        credits,
        priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Purchase Credit Pack error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
