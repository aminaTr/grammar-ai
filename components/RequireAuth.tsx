"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "./ui/spinner";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { userLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userLoggedIn === false) {
      router.push("/sign-in");
    }
  }, [userLoggedIn, router]);

  if (userLoggedIn === false) return null;
  if (userLoggedIn === null)
    return (
      <div className="flex justify-center items-center h-screen">
        {" "}
        <Spinner />
      </div>
    );

  return <>{children}</>;
}
