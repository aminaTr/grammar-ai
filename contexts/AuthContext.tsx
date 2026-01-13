// "use client";

// import {
//   createContext,
//   useState,
//   useEffect,
//   useContext,
//   ReactNode,
// } from "react";
// import type { User } from "@supabase/supabase-js";
// import { supabase } from "@/lib/supabase/client";
// import { Spinner } from "@/components/ui/spinner";
// import { error } from "console";
// import { ExtendedUser } from "@/types/extendedUser";

// interface AuthProviderProps {
//   children: ReactNode;
// }

// interface AuthContextType {
//   currentUser: ExtendedUser | null;
//   setCurrentUser: (user: ExtendedUser | null) => void;
//   userLoggedIn: boolean | null;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export function useAuth(): AuthContextType {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }

// export function AuthProvider({ children }: AuthProviderProps) {
//   const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
//   const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null);
//   const [loading, setLoading] = useState(true);

//   const fetchSubscription = async (userId: string) => {
//     const [
//       { data: subscription, error: subscriptionError },
//       { data: credits, error: creditsError },
//     ] = await Promise.all([
//       supabase
//         .from("subscriptions")
//         .select("*")
//         .eq("user_id", userId)
//         .maybeSingle(),

//       supabase
//         .from("user_credits")
//         .select("*")
//         .eq("user_id", userId)
//         .maybeSingle(),
//     ]);

//     if (subscriptionError || creditsError) {
//       console.error(subscriptionError || creditsError);
//     }

//     return {
//       plan: subscription?.plan_id ?? "free",
//       credits: credits?.subscription_credits + credits?.purchased_credits || 0,
//       subscriptionEnd: subscription?.current_period_end ?? null,
//     };
//   };

//   useEffect(() => {
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (event, session) => {
//       if (event === "INITIAL_SESSION") {
//         const user = session?.user ?? null;

//         if (user) {
//           const sub = await fetchSubscription(user.id);
//           setCurrentUser({ ...user, ...sub });
//           setUserLoggedIn(true);
//         } else {
//           setCurrentUser(null);
//           setUserLoggedIn(false);
//         }

//         setLoading(false); // ✅ always fires
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   if (loading)
//     return (
//       <div className="h-screen flex justify-center items-center gap-2">
//         <div className="font-bold text-2xl"> Loading</div>
//         <Spinner className="w-6 h-6 " />
//       </div>
//     );

//   return (
//     <AuthContext.Provider value={{ currentUser, setCurrentUser, userLoggedIn }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { ExtendedUser } from "@/types/extendedUser";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  currentUser: ExtendedUser | null;
  setCurrentUser: (user: ExtendedUser | null) => void;
  userLoggedIn: boolean | null;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async (userId: string) => {
    const [
      { data: subscription, error: subscriptionError },
      { data: credits, error: creditsError },
    ] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),

      supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    if (subscriptionError) {
      console.error("Subscription fetch error:", subscriptionError);
    }

    if (creditsError) {
      console.error("Credits fetch error:", creditsError);
    }

    return {
      plan: subscription?.plan_id ?? "free",
      credits:
        (credits?.subscription_credits ?? 0) +
        (credits?.purchased_credits ?? 0),
      subscriptionEnd: subscription?.current_period_end ?? null,
    };
  }, []);

  const refreshCredits = useCallback(async () => {
    if (!currentUser) return;

    const subscriptionData = await fetchSubscription(currentUser.id);
    setCurrentUser((prev) => (prev ? { ...prev, ...subscriptionData } : null));
  }, [currentUser, fetchSubscription]);

  useEffect(() => {
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") {
        const user = session?.user ?? null;

        if (user) {
          const sub = await fetchSubscription(user.id);
          setCurrentUser({ ...user, ...sub });
          setUserLoggedIn(true);
        } else {
          setCurrentUser(null);
          setUserLoggedIn(false);
        }

        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setUserLoggedIn(false);
      }
    });

    return () => authSubscription.unsubscribe();
  }, [fetchSubscription]);

  // Real-time subscription for credits changes
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log("Setting up real-time subscription for user:", currentUser.id);

    // Subscribe to changes in user_credits table
    const creditsChannel = supabase
      .channel(`user_credits_${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "user_credits",
          filter: `user_id=eq.${currentUser.id}`,
        },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          console.log("Credits changed:", payload);

          // Refresh credits when any change occurs
          await refreshCredits();
        }
      )
      .subscribe((status) => {
        console.log("Credits subscription status:", status);
      });

    // Also subscribe to subscription changes
    const subscriptionChannel = supabase
      .channel(`subscriptions_${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${currentUser.id}`,
        },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          console.log("Subscription changed:", payload);

          // Refresh subscription data
          await refreshCredits();
        }
      )
      .subscribe((status) => {
        console.log("Subscription subscription status:", status);
      });

    // Cleanup subscriptions on unmount or user change
    return () => {
      console.log("Cleaning up real-time subscriptions");
      supabase.removeChannel(creditsChannel);
      supabase.removeChannel(subscriptionChannel);
    };
  }, [currentUser?.id, refreshCredits]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center gap-2">
        <div className="font-bold text-2xl">Loading</div>
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userLoggedIn,
        refreshCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
