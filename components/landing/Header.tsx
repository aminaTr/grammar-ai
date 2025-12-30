"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
// import { signOutUser } from "@/lib/auth"; firebase helper
import { signOutUser } from "@/lib/auth/actions"; // supabase helper
import { UserCog } from "lucide-react";
import { Menu } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function Header() {
  const { userLoggedIn, currentUser } = useAuth();
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
          <span className="md:text-lg font-semibold text-sm font-sans">
            Grammar AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="/#About"
            className="text-muted-foreground hover:text-foreground"
          >
            About
          </a>
          <a
            href="/#HowItWorks"
            className="text-muted-foreground hover:text-foreground"
          >
            How it Works
          </a>
          <a
            href="/grammar-checker"
            className="text-muted-foreground hover:text-foreground"
          >
            Grammar Checker
          </a>
        </div>

        <div className="flex items-center gap-3">
          {userLoggedIn ? (
            <>
              <Button
                size={"sm"}
                onClick={signOutUser}
                className="hidden md:block"
              >
                Sign Out
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size={"sm"} variant={"ghost"}>
                    <UserCog className=" h-6 w-6" />{" "}
                    <span className="sr-only">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{currentUser?.email}</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOutUser}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/#About">About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/#HowItWorks">How it Works</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/grammar-checker">Grammar Checker</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Header;
