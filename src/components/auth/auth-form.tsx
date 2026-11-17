"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, "Enter your name."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128, "Password must be at most 128 characters."),
});
type Values = { name?: string; email: string; password: string };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isRegister = mode === "register";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: Values) {
    setError(null);
    try {
      const result = isRegister
        ? await authClient.signUp.email({ name: values.name!, email: values.email, password: values.password })
        : await authClient.signIn.email({ email: values.email, password: values.password });
      if (result.error) {
        setError(result.error.message || "Something went wrong. Please try again.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href={isRegister ? "/register" : "/login"} className="text-lg font-semibold tracking-tight">Drafty</Link>
        <div className="mt-10 mb-7 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{isRegister ? "Create an account" : "Welcome back"}</h1>
          <p className="text-sm text-muted-foreground">{isRegister ? "Enter your details to get started." : "Enter your details to sign in to your account."}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {isRegister && (
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} />
                <FieldError id="name-error" errors={[errors.name]} />
              </Field>
            )}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
              <FieldError id="email-error" errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} {...register("password")} />
              <FieldError id="password-error" errors={[errors.password]} />
            </Field>
            <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Log in"}</Button>
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <Link href={isRegister ? "/login" : "/register"} className="font-medium text-foreground underline underline-offset-4">{isRegister ? "Log in" : "Register"}</Link>
        </p>
      </div>
    </main>
  );
}
