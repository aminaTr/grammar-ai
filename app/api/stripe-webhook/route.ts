import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BUY_CREDIT_PACKS, PAID_PLANS } from "@/lib/constants/plans";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_KEY!
    );
  } catch (err: any) {
    console.error("Webhook verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle subscription renewal/payment
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice & {
      subscription?: string;
    };
    console.log("event invoice.payment_succeeded:", invoice !== null);

    const subscriptionId = invoice.subscription as string | undefined;

    if (!subscriptionId) {
      console.log(
        "Invoice has no subscription ID:",
        invoice.id,
        "\nReturning early."
      );
      return NextResponse.json(
        { message: "No subscription ID on invoice" },
        { status: 200 }
      );
    }

    try {
      // First, try to get subscription from database
      const { data: dbSub, error: dbError } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id, plan_id, stripe_price_id")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (dbError && dbError.code !== "PGRST116") {
        console.error("Error fetching subscription from DB:", dbError);
      }

      let userId = dbSub?.user_id;
      let planId = dbSub?.plan_id;
      let priceId = dbSub?.stripe_price_id;
      // If not in DB, try to get from Stripe metadata
      if (!userId || !planId) {
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        userId = userId || subscription.metadata?.userId;
        planId = planId || subscription.metadata?.planId;
        priceId = priceId || subscription.items.data[0]?.price.id;

        console.log("Retrieved from Stripe:", { userId, planId, priceId });
      }

      // If still missing, try to derive from price ID
      if (!planId && priceId) {
        const plan = Object.values(PAID_PLANS).find((p) =>
          p.stripePriceIds.includes(priceId)
        );
        if (plan) {
          planId = plan.id;
          console.log("Derived planId from priceId:", planId);
        }
      }
      // Fetch subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (!userId || !planId) {
        console.error(
          "Cannot determine userId or planId for invoice:",
          invoice.id,
          { userId, planId, priceId, subscriptionId }
        );
        return NextResponse.json(
          { error: "Missing user or plan info" },
          { status: 400 }
        );
      }

      const plan = PAID_PLANS[planId as string];
      if (!plan) {
        console.error("Plan not found for subscription:", planId);
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      // Upsert the subscription
      const { error: upsertError } = await supabaseAdmin
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            plan_id: planId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            current_period_end: new Date(
              subscription.items.data[0].current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        console.error("Failed to upsert subscription:", upsertError);
        return NextResponse.json(
          { error: "Failed to save subscription" },
          { status: 500 }
        );
      }
      // Reset subscription credits
      // const { error: creditError } = await supabaseAdmin
      //   .from("user_credits")
      //   .upsert(
      //     {
      //       user_id: userId,
      //       subscription_credits: plan.monthlyCredits,
      //       last_reset: new Date().toISOString(),
      //       updated_at: new Date().toISOString(),
      //     },
      //     { onConflict: "user_id" }
      //   );

      const { error: creditError } = await supabaseAdmin.rpc(
        "add_subscription_credits",
        {
          p_user_id: userId,
          p_amount: plan.monthlyCredits,
        }
      );

      if (creditError) {
        console.error("Error updating user credits:", creditError);
        return NextResponse.json(
          { error: "Failed to update credits" },
          { status: 500 }
        );
      }

      console.log(`Credits reset for user ${userId} for plan ${plan.id}`);
      return NextResponse.json({ status: "success" });
    } catch (error: any) {
      console.error("Error processing invoice.payment_succeeded:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;

    const priceId = subscription.items.data[0].price.id;
    const planId = Object.values(PAID_PLANS).find((plan) =>
      plan.stripePriceIds.includes(priceId)
    )?.id;

    const payload = {
      user_id: subscription.metadata.userId,
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      stripe_item_id: subscription.items.data[0].id,
      status: subscription.cancel_at_period_end
        ? "canceled_pending"
        : subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .upsert(payload, {
        onConflict: "stripe_subscription_id",
      });

    if (error) {
      console.error("Subscription update failed:", error);
      throw error;
    }

    // Immediately reset or update credits
    if (planId && !subscription.cancel_at_period_end) {
      const newCredits = PAID_PLANS[planId]?.monthlyCredits ?? 0;

      const { error: creditError } = await supabaseAdmin
        .from("user_credits")
        .upsert(
          {
            user_id: subscription.metadata.userId,
            credits: newCredits,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (creditError) {
        console.error(
          "Failed to update credits on subscription change:",
          creditError
        );
      }
    }
  }
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        plan_id: "free",
        status: "canceled",
        stripe_subscription_id: null,
        stripe_item_id: null,
        cancel_at_period_end: false,
        current_period_end: null,
      })
      .eq("stripe_subscription_id", sub.id);

    if (error) {
      console.error("Subscription delete failed:", error);
      throw error;
    }
  }

  // if (event.type === "customer.subscription.deleted") {
  //   const subscription = event.data.object as Stripe.Subscription;

  //   // Mark user as free plan
  //   await supabaseAdmin
  //     .from("subscriptions")
  //     .update({
  //       plan_id: "free",
  //       status: "canceled",
  //       current_period_end: null,
  //     })
  //     .eq("stripe_subscription_id", subscription.id);
  // }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed");
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Retrieve full session with line_items and subscription
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items", "subscription"],
      });

      const lineItems = fullSession.line_items?.data || [];

      if (lineItems.length === 0) {
        console.log("No line items found");
        return NextResponse.json(
          { message: "No line items found" },
          { status: 400 }
        );
      }

      for (const item of lineItems) {
        const isSubscription = item.price?.type === "recurring";
        const userId = fullSession.metadata?.userId;
        const priceId = item.price?.id;

        if (!userId || !priceId) {
          console.error("Missing userId or priceId:", { userId, priceId });
          continue;
        }

        if (isSubscription) {
          // Handle subscription purchase
          const subscriptionId =
            typeof fullSession.subscription === "string"
              ? fullSession.subscription
              : fullSession.subscription?.id;

          if (!subscriptionId) {
            console.error("Subscription ID is missing");
            return NextResponse.json(
              { error: "Subscription ID is missing" },
              { status: 400 }
            );
          }

          const customerId = fullSession.customer as string;

          // Find plan by Stripe PRICE ID
          const plan = Object.values(PAID_PLANS).find((plan) =>
            plan.stripePriceIds.includes(priceId)
          );

          if (!plan) {
            console.error("Plan not found for price:", priceId);
            return NextResponse.json(
              { message: "Plan not found for price" },
              { status: 400 }
            );
          }

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );

          // Upsert subscription
          const { error: subError } = await supabaseAdmin
            .from("subscriptions")
            .upsert(
              {
                user_id: userId,
                plan_id: plan.id,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                stripe_item_id: subscription.items.data[0]?.id,
                stripe_price_id: priceId,
                status: subscription.status,
                current_period_end: new Date(
                  subscription.items.data[0].current_period_end * 1000
                ).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );

          if (subError) {
            console.error("Failed to upsert subscription:", subError);
            return NextResponse.json(
              { error: subError.message },
              { status: 500 }
            );
          }

          // Add subscription credits
          const { error: creditError } = await supabaseAdmin.rpc(
            "add_subscription_credits",
            {
              p_user_id: userId,
              p_amount: plan.monthlyCredits,
            }
          );

          if (creditError) {
            console.error("Failed to add subscription credits:", creditError);
          }

          // Create transaction log
          await supabaseAdmin.from("credit_transactions").insert({
            user_id: userId,
            type: "subscription",
            amount: plan.monthlyCredits,
            reason: `Credits granted for ${plan.id} subscription`,
            created_at: new Date().toISOString(),
          });

          console.log(
            `Subscription created for user ${userId}, plan ${plan.id}`
          );
        } else {
          // Handle one-time credit purchase
          if (!BUY_CREDIT_PACKS.stripePriceIds.includes(priceId)) {
            console.error("Unknown credit purchase priceId:", priceId);
            continue;
          }

          const creditsToAdd = BUY_CREDIT_PACKS.oneTimeCreditsMap[priceId];

          // Fetch current credits
          const { data: currentCredits, error: fetchError } =
            await supabaseAdmin
              .from("user_credits")
              .select("purchased_credits")
              .eq("user_id", userId)
              .single();

          if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Error fetching user credits:", fetchError);
            continue;
          }

          const existingCredits = currentCredits?.purchased_credits || 0;
          const newTotal = existingCredits + creditsToAdd;

          // Update purchased credits (not subscription credits)
          const { error: creditError } = await supabaseAdmin
            .from("user_credits")
            .upsert(
              {
                user_id: userId,
                purchased_credits: newTotal,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );

          if (creditError) {
            console.error("Failed to add purchased credits:", creditError);
            continue;
          }

          // Log the transaction
          await supabaseAdmin.from("credit_transactions").insert({
            user_id: userId,
            type: "one_time",
            amount: creditsToAdd,
            reason: `Purchased ${creditsToAdd} credits via one-time payment`,
            created_at: new Date().toISOString(),
          });

          console.log(`Added ${creditsToAdd} credits to user ${userId}`);
        }
      }

      return NextResponse.json({ status: "success" });
    } catch (error: any) {
      console.error("Error processing checkout.session.completed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ status: "success" });
}
