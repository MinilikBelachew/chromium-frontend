"use client";

import React, { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginShell from "@/components/features/auth/LoginShell";
import PasswordFields from "@/components/features/auth/PasswordFields";
import {
  useChangePasswordMutation,
  useLazyGetOnboardingMeQuery,
} from "@/context/services/authApi";
import { parseApiError } from "@/lib/auth-errors";
import { homePathForRole } from "@/lib/auth-routing";
import { hasAuthToken } from "@/lib/auth-token";
import { isPasswordAcceptable } from "@/lib/password-strength";

const fieldClass =
  "h-11 rounded-[15px] border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground shadow-none";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [fetchMe] = useLazyGetOnboardingMeQuery();
  const [homePath, setHomePath] = useState("/app");

  useEffect(() => {
    if (!hasAuthToken()) {
      router.replace("/sign-in");
      return;
    }
    void fetchMe()
      .unwrap()
      .then((profile) => {
        setHomePath(homePathForRole(profile.user.role));
      })
      .catch(() => {
        router.replace("/sign-in");
      });
  }, [fetchMe, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!oldPassword.trim()) {
      setError("Enter your current password");
      return;
    }
    if (!isPasswordAcceptable(password)) {
      setError("Use at least 8 characters with upper, lower, and a number");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await changePassword({
        oldPassword,
        password,
      }).unwrap();
      setDone(true);
    } catch (err) {
      setError(parseApiError(err, "Could not change password"));
    }
  }

  if (done) {
    return (
      <LoginShell
        title="Password changed"
        subtitle="Your password was updated successfully."
      >
        <Button
          type="button"
          className="w-full"
          onClick={() => router.push(homePath)}
        >
          Back to dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </LoginShell>
    );
  }

  return (
    <LoginShell
      title="Change password"
      subtitle="Enter your current password, then choose a new one."
      footer={
        <Link
          href={homePath}
          className="font-medium text-sky-blue underline-offset-4 hover:underline"
        >
          Cancel
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="old-password"
            className="text-onboarding-label text-foreground"
          >
            Current password
          </Label>
          <Input
            id="old-password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={fieldClass}
            autoComplete="current-password"
            required
          />
        </div>
        <PasswordFields
          password={password}
          confirmPassword={confirmPassword}
          onPasswordChange={setPassword}
          onConfirmChange={setConfirmPassword}
          disabled={isLoading}
        />
        {error ? (
          <p className="rounded-[15px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive dark:text-red-400">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating…" : "Update password"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </LoginShell>
  );
}
