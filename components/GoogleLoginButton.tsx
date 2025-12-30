"use client";

import { signInWithGoogle } from "@/lib/auth/actions";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { GoogleIcon } from "./icons/GoogleIcon";

export default function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success("Redirecting to Google...");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      variant="secondary"
      className="flex items-center gap-2 w-full mt-4"
    >
      Sign in with Google
      <GoogleIcon className="h-4 w-4" />
    </Button>
  );
}
