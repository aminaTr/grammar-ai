"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/auth";

function Header() {
  const { userLoggedIn } = useAuth();
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 px-6 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={"/grammar image.png"}
            alt="Grammar AI Logo"
            width={32}
            height={32}
            className="w-11"
          />
          <span className="font-semibold text-lg font-sans">Grammar AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-muted-foreground hover:text-foreground">
            How it Works
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            Pricing
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            About
          </a>
        </div>

        <div className="flex items-center gap-3">
          {userLoggedIn ? (
            <Button size={"sm"} onClick={signOutUser}>
              Sign Out
            </Button>
          ) : (
            <>
              <Button variant={"ghost"} size={"sm"} asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size={"sm"} asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Header;
