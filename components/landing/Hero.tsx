import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative bg-background text-foreground pt-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-16 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Write Flawlessly, Instantly
            </h1>

            <p className="mt-6 text-lg md:text-2xl font-light text-muted-foreground">
              Your AI-powered grammar assistant that checks, corrects, and
              improves your writing in real-time.
            </p>

            <div className="mt-10 flex justify-center md:justify-start gap-4 flex-wrap">
              <Link
                href="/register"
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                Get Started
              </Link>

              <Link
                href="/about"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center md:justify-end">
            <img
              src="/hero.svg"
              alt="Grammar AI Illustration"
              className="w-100 max-w-md"
            />
          </div>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-24 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" />

      {/* Bottom fade into next section */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-linear-to-b from-transparent to-background" />
    </section>
  );
}
