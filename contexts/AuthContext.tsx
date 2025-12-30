"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase/client";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  userLoggedIn: boolean | null;
}

interface AuthProviderProps {
  children: ReactNode;
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
  const supabase = createBrowserSupabase();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      setCurrentUser(user);
      setUserLoggedIn(!!user);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      setUserLoggedIn(!!user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
    userLoggedIn,
  };

  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// "use client";

// import {
//   createContext,
//   useState,
//   useEffect,
//   useContext,
//   ReactNode,
// } from "react";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { auth } from "@/lib/firebase";

// interface AuthContextType {
//   currentUser: User | null;
//   setCurrentUser: (user: User | null) => void;
//   userLoggedIn: boolean | null;
// }

// interface AuthProviderProps {
//   children: ReactNode;
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
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       if (firebaseUser) {
//         setCurrentUser(firebaseUser);
//         setUserLoggedIn(true);
//       } else {
//         setCurrentUser(null);
//         setUserLoggedIn(false);
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const value: AuthContextType = {
//     currentUser,
//     setCurrentUser,
//     userLoggedIn,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }
