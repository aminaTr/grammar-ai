"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { register } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";
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

const page = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const { userLoggedIn, setCurrentUser } = useAuth();

  useEffect(() => {
    if (userLoggedIn) {
      router.replace("/");
    }
  }, [userLoggedIn, router]);

  const formSchema = z
    .object({
      email: z
        .email("Please enter a valid email address.")
        .nonempty("Email is required."),
      password: z
        .string()
        .nonempty("Password is required.")
        .min(6, "Password must be at least 6 characters long.")
        .max(18, "Password must be at most 18 characters long.")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,}$/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        ),
      confirmPassword: z.string().nonempty("Please confirm your password."),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!isRegistering) {
      setIsRegistering(true);
      register(data.email, data.password)
        .then((userCredential) => {
          setCurrentUser(userCredential.user);
          toast.success("Your account has been created successfully!");
          router.push("/sign-in");
        })
        .catch((error) => {
          console.log("error block");
          const errorCode = error.code;
          const errorMessage = error.message;
          setIsRegistering(false);
          console.error("Registration error:", errorCode, errorMessage);
          toast.error(`Registration failed: ${errorMessage}`);
        });
    }
  }

  return (
    <div className="flex w-full max-w-4xl shadow-lg rounded-xl overflow-hidden">
      <Card className="w-full sm:max-w-md rounded-none">
        <CardHeader>
          <CardTitle>Register Account</CardTitle>
          <CardDescription>
            Create your account to enjoy all the features!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="registration-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="Type your email"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
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
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Type your password"
                      autoComplete="off"
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword"
                      aria-invalid={fieldState.invalid}
                      placeholder="Type your password"
                      autoComplete="off"
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="vertical">
            <Button
              type="submit"
              form="registration-form"
              disabled={isRegistering}
            >
              {isRegistering ? "Registering" : "Register"}
              {isRegistering && <Spinner className="ml-2" />}
            </Button>
            <span className="text-sm">
              Already have an account?{" "}
              <Link className="text-primary hover:underline" href="/sign-in">
                Sign in
              </Link>
              .
            </span>
          </Field>
        </CardFooter>
      </Card>
      <Card className="hidden rounded-none lg:flex w-full bg-primary/10 items-center justify-center">
        <div className="p-8 ">
          <Image
            src="/grammar image.png"
            className=" object-contain"
            width={300}
            height={300}
            alt="Auth Image"
            loading="eager"
          />
        </div>
      </Card>
    </div>
  );
};

export default page;
