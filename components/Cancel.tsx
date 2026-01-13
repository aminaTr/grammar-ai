"use client";

import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Payment canceled</h1>
      <p className="text-muted-foreground">
        You were not charged. You can try again anytime.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/#pricing")}
          className="rounded-md bg-primary px-4 py-2 text-white"
        >
          View Plans
        </button>

        <button
          onClick={() => router.push("/")}
          className="rounded-md border px-4 py-2"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
