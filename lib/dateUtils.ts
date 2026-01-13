//  Format date for subscription display

export function formatSubscriptionDate(dateString: string | null): string {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date";

  // Format as: "Apr 6, 2026"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Get relative time until subscription ends

export function getSubscriptionStatus(dateString: string | null): {
  formatted: string;
  daysLeft: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // Within 7 days
} {
  if (!dateString) {
    return {
      formatted: "No active paid subscription",
      daysLeft: 0,
      isExpired: true,
      isExpiringSoon: false,
    };
  }

  const endDate = new Date(dateString);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = daysLeft < 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

  let formatted: string;

  if (isExpired) {
    formatted = "Expired";
  } else if (daysLeft === 0) {
    formatted = "Expires today";
  } else if (daysLeft === 1) {
    formatted = "Expires tomorrow";
  } else if (daysLeft <= 30) {
    formatted = `${daysLeft} days left`;
  } else {
    formatted = formatSubscriptionDate(dateString);
  }

  return {
    formatted,
    daysLeft,
    isExpired,
    isExpiringSoon,
  };
}
