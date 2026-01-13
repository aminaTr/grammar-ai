"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      router.replace("/#pricing");
      return;
    }

    // Optional: show spinner for a second
    const timer = setTimeout(() => {
      router.replace("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId, router]);

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <p className="text-lg font-semibold">
        Subscription activated. Redirecting…
      </p>
      <p className="text-sm">
        If the credits do not appear updated, refresh your page
      </p>
    </div>
  );
}
