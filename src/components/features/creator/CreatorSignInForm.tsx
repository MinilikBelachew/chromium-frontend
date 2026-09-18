"use client";

import React, { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/features/creator/AuthShell";
import { useLoginMutation } from "@/context/services/authApi";
import { parseApiError } from "@/lib/auth-errors";
import { homePathForRole, isCreatorRole } from "@/lib/auth-routing";
import { hasAuthToken } from "@/lib/auth-token";

export default function CreatorSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (hasAuthToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();

      if (!isCreatorRole(result.user.role)) {
        setError("This account is not a creator. Use viewer sign-in instead.");
        return;
      }

      router.push(homePathForRole(result.user.role));
    } catch (err) {
      setError(parseApiError(err, "Could not sign in"));
    }
  }

  return (
    <AuthShell
      title="Creator sign in"
      subtitle="Sign in with the email and password you used when registering your channel."
      footer={
        <>
          New creator?{" "}
          <Link
            href="/sign-up"
            className="text-carbon-black underline-offset-4 hover:underline"
          >
            Register with your YouTube channel
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-onboarding-label text-carbon-black">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-[15px] border-mist-gray px-4 text-[15px] shadow-none"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-onboarding-label text-carbon-black">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-[15px] border-mist-gray px-4 text-[15px] shadow-none"
            required
          />
        </div>
        {error ? (
          <p className="rounded-[15px] border border-mist-gray bg-fog-gray px-4 py-3 text-[13px]">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Continue"}
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
