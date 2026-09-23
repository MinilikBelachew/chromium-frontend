"use client";

import React, { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginShell from "@/components/features/auth/LoginShell";
import { GoogleAuthBlock } from "@/components/features/auth/ContinueWithGoogle";
import {
  useGoogleLoginMutation,
  useLazyGetOnboardingMeQuery,
  useLoginMutation,
} from "@/context/services/authApi";
import { parseApiError } from "@/lib/auth-errors";
import { homePathForRole } from "@/lib/auth-routing";
import { clearAuthTokens, hasAuthToken } from "@/lib/auth-token";

export default function UserLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: googleLoading }] = useGoogleLoginMutation();
  const [fetchMe] = useLazyGetOnboardingMeQuery();

  const busy = isLoading || googleLoading || redirecting;

  useEffect(() => {
    if (!hasAuthToken()) return;
    void fetchMe()
      .unwrap()
      .then((profile) => {
        setRedirecting(true);
        router.replace(homePathForRole(profile.user.role));
      })
      .catch(() => {
        clearAuthTokens();
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
      setRedirecting(true);
      router.push(homePathForRole(result.user.role));
    } catch (err) {
      setRedirecting(false);
      setError(parseApiError(err, "Could not sign in"));
    }
  }

  async function continueWithGoogle(idToken: string) {
    setError(null);
    try {
      const result = await googleLogin({ idToken }).unwrap();
      setRedirecting(true);
      router.push(homePathForRole(result.user.role));
    } catch (err) {
      setRedirecting(false);
      clearAuthTokens();
      setError(parseApiError(err, "Could not continue with Google"));
    }
  }

  return (
    <LoginShell
      title="Sign in"
      subtitle="Sign in with your email and password. We’ll take you to the right dashboard."
      footer={
        <>
          New here?{" "}
          <Link
            href="/get-started"
            className="font-medium text-sky-blue underline-offset-4 hover:underline"
          >
            Get started
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleAuthBlock
          disabled={busy}
          onCredential={continueWithGoogle}
          onError={(message) => setError(message || null)}
        />
        <form onSubmit={onSubmit} className="space-y-5" aria-busy={busy}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-onboarding-label text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-[15px] border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground shadow-none"
              autoComplete="email"
              required
              disabled={busy}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="password"
                className="text-onboarding-label text-foreground"
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
              className="h-11 rounded-[15px] border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground shadow-none"
              autoComplete="current-password"
              required
              disabled={busy}
            />
          </div>
          {error ? (
            <p className="rounded-[15px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive dark:text-red-400">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {redirecting ? "Taking you in…" : "Signing in…"}
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </LoginShell>
  );
}
