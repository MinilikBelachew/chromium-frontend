"use client";

import React, { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginShell from "@/components/features/auth/LoginShell";
import {
  useLazyGetOnboardingMeQuery,
  useLoginMutation,
} from "@/context/services/authApi";
import { parseApiError } from "@/lib/auth-errors";
import { homePathForRole } from "@/lib/auth-routing";
import { hasAuthToken } from "@/lib/auth-token";

export default function UserLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();
  const [fetchMe] = useLazyGetOnboardingMeQuery();

  useEffect(() => {
    if (!hasAuthToken()) return;
    void fetchMe()
      .unwrap()
      .then((profile) => {
        router.replace(homePathForRole(profile.user.role));
      })
      .catch(() => {
        /* stay on login if token invalid */
      });
  }, [fetchMe, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();
      router.push(homePathForRole(result.user.role));
    } catch (err) {
      setError(parseApiError(err, "Could not sign in"));
    }
  }

  return (
    <LoginShell
      title="Sign in"
      subtitle="Sign in with your email and password."
      footer={
        <>
          New here?{" "}
          <Link
            href="/register"
            className="text-carbon-black underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
          <span className="mx-2 text-[#D4D4D8]">·</span>
          Creator?{" "}
          <Link
            href="/sign-up"
            className="text-carbon-black underline-offset-4 hover:underline"
          >
            Register a channel
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
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-[15px] border-mist-gray px-4 text-[15px] shadow-none"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="password"
              className="text-onboarding-label text-carbon-black"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-sky-blue underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </LoginShell>
  );
}
