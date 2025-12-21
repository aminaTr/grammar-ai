"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signin } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";

const Page = () => {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { userLoggedIn } = useAuth();

  useEffect(() => {
    if (userLoggedIn) {
      router.replace("/");
    }
  }, [userLoggedIn, router]);

  const formSchema = z.object({
    email: z.email("Please enter a valid email address."),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSigningIn(true);
      await signin(data.email, data.password);
      toast.success("Welcome back!");
      router.replace("/");
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    }
    setIsSigningIn(false);
  }

  return (
    <div className="flex w-full max-w-4xl shadow-lg rounded-xl overflow-hidden">
      <Card className="w-full sm:max-w-md rounded-none">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Welcome back! Please sign in to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input placeholder="Type your email" {...field} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      type="password"
                      placeholder="Type your password"
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button type="submit" className="mt-4 w-full">
              {isSigningIn ? "Signing In" : "Sign In"}
              {isSigningIn && <Spinner className="ml-2" />}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-sm">
          <span>
            Don't have an account?{" "}
            <Link className="text-primary hover:underline" href="/register">
              Register
            </Link>
          </span>
        </CardFooter>
      </Card>

      <Card className="hidden rounded-none lg:flex w-full bg-primary/10 items-center justify-center">
        <Image src="/grammar image.png" width={300} height={300} alt="Auth" />
      </Card>
    </div>
  );
};

export default Page;
