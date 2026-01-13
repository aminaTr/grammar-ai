"use client";

import { useState } from "react";
import { toast } from "sonner";
import { buttonVariants } from "./ui/button";
import { redirect } from "next/navigation";

interface PaymentLinkProps {
  text: string;
  paymentLink?: string;
  email?: string;
  userId?: string;
  priceId: string;
}

export default function PurchasePaymentLink({
  text,
  email,
  userId,
  priceId,
}: PaymentLinkProps) {
  const [loading, setLoading] = useState(false);

  const handleBuyCreditPack = async () => {
    if (!userId || !email) {
      toast("Sign in to buy credits");
      return redirect("/sign-in");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout session failed");

      // Redirect user to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <button
      className={buttonVariants()}
      disabled={loading}
      onClick={handleBuyCreditPack}
      // className="bg-purple-600 text-white px-4 py-2 rounded"
    >
      {loading ? "Processing..." : text}
    </button>
  );
}
