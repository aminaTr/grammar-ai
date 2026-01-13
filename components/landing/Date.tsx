import { formatSubscriptionDate, getSubscriptionStatus } from "@/lib/dateUtils";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export function SubscriptionDropdown() {
  const { currentUser } = useAuth();

  // Get subscription status
  const status = getSubscriptionStatus(currentUser?.subscriptionEnd ?? null);

  return (
    <>
      <DropdownMenuLabel>
        Subscription Ends:{" "}
        <span className="font-normal">
          {formatSubscriptionDate(currentUser?.subscriptionEnd ?? null)}
        </span>
      </DropdownMenuLabel>

      <DropdownMenuLabel className="flex items-center gap-2">
        <span className={`${status.isExpired && "hidden"}`}>Subscription:</span>
        <span
          className={`font-normal ${
            status.isExpired
              ? "text-red-600"
              : status.isExpiringSoon
              ? "text-amber-600"
              : "text-green-600"
          }`}
        >
          {status.formatted}
        </span>
      </DropdownMenuLabel>

      {/* Show warning if expiring soon */}
      {status.isExpiringSoon && (
        <DropdownMenuLabel className="text-amber-600 text-xs">
          ⚠️ Renew soon to avoid interruption
        </DropdownMenuLabel>
      )}
    </>
  );
}
