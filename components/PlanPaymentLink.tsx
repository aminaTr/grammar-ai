"use client";

import { useState } from "react";
import { toast } from "sonner";
import { buttonVariants } from "./ui/button";
import { redirect } from "next/navigation";
import { PAID_PLANS } from "@/lib/constants/plans";
import { CancellationAlertDialog } from "./CancellationAlertDialog";

interface PaymentLinkProps {
  text: string;
  paymentLink?: string;
  planId?: string;
  email?: string;
  userId?: string;
  disabled?: boolean;
  currentPlan?: string;
}

export default function PlanPaymentLink({
  text,
  planId,
  email,
  userId,
  disabled,
  currentPlan,
}: PaymentLinkProps) {
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleSubscribe = async () => {
    if (!userId || !email || !currentPlan) {
      toast("Sign in to subscribe to plans");
      return redirect("/sign-in");
    }

    if (!planId) return toast.error("Invalid plan selected");

    if (currentPlan === planId) {
      return toast("You are already subscribed to this plan");
    }

    // Downgrade → show confirmation dialog
    if (PAID_PLANS[currentPlan] && planId === "free") {
      setShowCancelDialog(true);
      return;
    }

    // Normal upgrade / subscribe
    await proceedSubscription();
  };
  const proceedSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");

      if (data.url) {
        window.location.href = data.url;
      }
      if (data.message) {
        toast(data.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={buttonVariants()}
        disabled={disabled || loading}
        onClick={handleSubscribe}
      >
        {loading ? "Processing..." : text}
      </button>

      <CancellationAlertDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={async () => {
          setShowCancelDialog(false);
          await proceedSubscription();
        }}
      />
    </>
  );
}
