"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import PlanPaymentLink from "./PlanPaymentLink";
import PurchasePaymentLink from "./PurchasePaymentLink";
import { useAuth } from "@/contexts/AuthContext";
import { BUY_CREDIT_PACKS } from "@/lib/constants/plans";

enum PopularPlanType {
  NO = 0,
  YES = 1,
}
interface PricingProps {
  plans: plan[];
  creditPacks: pack[];
}
interface plan {
  title: string;
  popular: PopularPlanType;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
  paymentLink?: string;
  billing: string;
}

interface pack {
  title: string;
  price: number;
  description: string;
  buttonText: string;
  paymentLink?: string;
  priceId: string;
}

interface PricingProps {
  plans: plan[];
  creditPacks: pack[];
}

const pricingList: PricingProps = {
  plans: [
    {
      title: "Free",
      popular: 0,
      price: 0,
      description:
        "Get started with basic grammar checking features, perfect for individuals or small teams.",
      buttonText: "Get Started for Free",
      benefitList: [
        "Get 500 free credits per month",
        "Two months non-expiring credits",
        "Access to basic LLM models",
        "Get to use groq's openai/gpt-oss-120b for free",
      ],
      billing: "/month",
    },
    {
      title: "Standard",
      popular: 1,
      price: 10,
      description:
        "Ideal for professionals who need more grammar checks and advanced model access.",

      buttonText: "Switch to Standard",
      benefitList: [
        "Get 5000 credits per month",
        "Unlimited non-expiring credits",
        "Access to additional LLM models",
        "Access models in previous plans",
      ],
      billing: "/month",
    },
    {
      title: "Pro",
      popular: 0,
      price: 20,
      description:
        "For power users requiring full features, unlimited grammar checks, and premium model access.",

      buttonText: "Upgrade Now",
      benefitList: [
        "Get whopping 20000 monthly credits ",
        "Unlimited non-expiring credits",
        "Get access to all the LLMs on our platform",
        "Access openai/gpt-oss-20b and benefits from other plans",
      ],
      billing: "/month",
    },
  ],
  creditPacks: [
    {
      title: "Mini Pack",
      price: 5,
      description:
        "Perfect for trying extra model tokens or occasional grammar checks beyond your plan limits.",
      buttonText: "Buy Now",
      priceId: BUY_CREDIT_PACKS.stripePriceIds[0],
    },
    {
      title: "Medium Pack",
      price: 10,
      description:
        "Great for moderate usage, providing additional tokens for standard and premium models.",
      buttonText: "Buy Now",
      priceId: BUY_CREDIT_PACKS.stripePriceIds[1],
    },
    {
      title: "Mega Pack",
      price: 20,
      description:
        "Best value for heavy users, offering a large number of extra tokens for all LLM models and unlimited checks.",
      buttonText: "Buy Now",
      priceId: BUY_CREDIT_PACKS.stripePriceIds[2],
    },
  ],
};

export const Pricing = () => {
  const { currentUser } = useAuth();
  return (
    <div className="flex items-center justify-center">
      <section id="pricing" className="container py-20 sm:px-12 sm:py-32  ">
        <h2 className="text-3xl md:text-4xl font-bold text-center">
          Get
          <span className="bg-gradient-to-b from-[#667EEA] to-[#764BA2] uppercase text-transparent bg-clip-text">
            {" "}
            Unlimited{" "}
          </span>
          Access
        </h2>
        <h3 className="text-xl text-center text-muted-foreground pt-4 pb-8">
          Unlock Advanced Features! Premium AI Models, Unbeatable Value.{" "}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
          {pricingList.plans.map((plan) => (
            <Card
              key={plan.title}
              className={
                plan.popular === 1
                  ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10"
                  : ""
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.title}
                  {!currentUser && plan.popular === 1 ? (
                    <Badge variant="secondary" className="text-sm text-primary">
                      Most popular
                    </Badge>
                  ) : null}
                </CardTitle>

                <div>
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground"> {plan.billing}</span>
                </div>

                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <PlanPaymentLink
                  text={
                    currentUser?.plan === plan.title.toLowerCase()
                      ? "Subscribed"
                      : plan.buttonText
                  }
                  currentPlan={currentUser?.plan || "free"}
                  paymentLink={plan.paymentLink}
                  disabled={currentUser?.plan === plan.title.toLowerCase()}
                  userId={currentUser?.id || ""}
                  email={currentUser?.email || ""}
                  planId={plan.title.toLowerCase()}
                />
              </CardContent>

              <hr className="w-4/5 m-auto mb-4" />

              <CardFooter className="flex">
                <div className="space-y-4">
                  {plan.benefitList.map((benefit) => (
                    <span key={benefit} className="flex">
                      <Check className="text-purple-500" />{" "}
                      <h3 className="ml-2 text-sm">{benefit}</h3>
                    </span>
                  ))}
                </div>
              </CardFooter>
            </Card>
          ))}
          {/* Credit Packs */}

          {pricingList.creditPacks.map((pack) => (
            <Card key={pack.title}>
              <CardHeader>
                <CardTitle>{pack.title}</CardTitle>

                <div>
                  <span className="text-3xl font-bold">${pack.price}</span>
                </div>

                <CardDescription>{pack.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <PurchasePaymentLink
                  text={pack.buttonText}
                  priceId={pack.priceId}
                  paymentLink={pack.paymentLink}
                  userId={currentUser?.id || ""}
                  email={currentUser?.email || ""}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
