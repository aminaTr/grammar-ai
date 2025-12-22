import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import About from "@/components/landing/About";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <About />
      <HowItWorks />
    </div>
  );
}
