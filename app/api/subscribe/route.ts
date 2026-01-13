// app/api/create-subscription-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PAID_PLANS } from "@/lib/constants/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: Request) {
  try {
    const { planId, userId, email } = await req.json();

    if (!planId || !userId || !email) {
      return NextResponse.json(
        { error: "Missing planId, userId, or email" },
        { status: 400 }
      );
    }

    const plan = planId === "free" ? "free" : PAID_PLANS[planId] ?? null;

    if (!plan) throw new Error("Invalid planId");

    // Check if user already has a Stripe customer
    let { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (plan === "free") {
      if (planId === "free" && existingSub?.stripe_subscription_id) {
        await stripe.subscriptions.update(existingSub.stripe_subscription_id, {
          cancel_at_period_end: true, // keeps access until end of billing period
        });

        return NextResponse.json({
          message:
            "Your subscription will be canceled at the end of the current billing period.",
        });
      }
      return NextResponse.json({
        message: "You are already on the free plan.",
      });
    }

    // Use first lookup key
    const priceLookupKey = plan?.stripeLookupKeys?.[0] ?? "";
    if (!priceLookupKey) throw new Error("No Stripe price for this plan");

    if (
      existingSub &&
      existingSub.plan_id === planId &&
      existingSub.status === "active"
    ) {
      return NextResponse.json(
        { error: "You are already subscribed to this plan." },
        { status: 400 }
      );
    }

    if (existingSub) {
      if (existingSub.status === "active" && existingSub.plan_id !== "free") {
        // Fetch new price
        const prices = await stripe.prices.list({
          lookup_keys: [PAID_PLANS[planId].stripeLookupKeys[0]],
          limit: 1,
        });
        const newPriceId = prices.data[0].id;
        let stripeItemId = existingSub.stripe_item_id;

        if (!stripeItemId) {
          // Fetch subscription from Stripe
          const subscription = await stripe.subscriptions.retrieve(
            existingSub.stripe_subscription_id
          );

          stripeItemId = subscription.items.data[0]?.id;
        }
        if (!stripeItemId) {
          console.error("Cannot update subscription: item ID is missing.");
          return NextResponse.json({
            success: false,
            message:
              "Subscription item ID is missing. Cannot update subscription.",
          });
        }
        if (!existingSub?.stripe_item_id) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ stripe_item_id: stripeItemId })
            .eq("stripe_subscription_id", existingSub.stripe_subscription_id);
        }

        // Update subscription
        const session = await stripe.subscriptions.update(
          existingSub.stripe_subscription_id,
          {
            items: [
              {
                id: existingSub.stripe_item_id, // store this in DB via webhook
                price: newPriceId,
              },
            ],
            proration_behavior: "create_prorations", // Stripe default
          }
        );
        return NextResponse.json({
          success: true,
          message: `Your subscription has been updated successfully to ${planId} plan.`,
          subscription: {
            id: session.id,
            status: session.status,
            planId,
            current_period_end: new Date(
              session.items.data[0].current_period_end * 1000
            ).toISOString(),
          },
        });
      } else if (existingSub.status === "canceled_pending") {
        return NextResponse.json(
          {
            error: `Your subscription ends on ${new Date(
              existingSub.current_period_end!
            ).toLocaleDateString()}. You can upgrade after that.`,
          },
          { status: 400 }
        );
      }
    }

    let customerId = existingSub?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    // Fetch price from Stripe
    const prices = await stripe.prices.list({
      lookup_keys: [priceLookupKey],
      limit: 1,
    });
    if (!prices.data.length) throw new Error("Price not found in Stripe");
    const priceId = prices.data[0].id;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      expand: ["line_items", "subscription"],
      metadata: {
        userId,
        planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Create Checkout Session error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
