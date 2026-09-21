"use client";

import React, { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginShell from "@/components/features/auth/LoginShell";
import PasswordFields from "@/components/features/auth/PasswordFields";
import OtpInput from "@/components/features/auth/OtpInput";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyForgotOtpMutation,
} from "@/context/services/authApi";
import { parseApiError } from "@/lib/auth-errors";
import { isPasswordAcceptable } from "@/lib/password-strength";

const fieldClass =
  "h-11 rounded-[15px] border-border bg-card px-4 text-[15px] shadow-none";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [forgotPassword, { isLoading: sending }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyForgotOtpMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  async function sendCode() {
    const result = await forgotPassword({
      email: email.trim().toLowerCase(),
    }).unwrap();
    setChallengeToken(result.challengeToken);
    setOtp("");
    setResendIn(60);
  }

  async function onEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Enter your email");
      return;
    }
    try {
      await sendCode();
      setStep(1);
    } catch (err) {
      setError(parseApiError(err, "Could not send reset code"));
    }
  }

  async function onOtpSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    try {
      const result = await verifyOtp({
        email: email.trim().toLowerCase(),
        code: otp,
        challengeToken,
      }).unwrap();
      setResetToken(result.resetToken);
      setStep(2);
    } catch (err) {
      setError(parseApiError(err, "Invalid or expired code"));
    }
  }

  async function onPasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!isPasswordAcceptable(password)) {
      setError("Use at least 8 characters with upper, lower, and a number");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await resetPassword({
        resetToken,
        password,
      }).unwrap();
      setDone(true);
    } catch (err) {
      setError(parseApiError(err, "Could not reset password"));
    }
  }

  if (done) {
    return (
      <LoginShell
        title="Password updated"
        subtitle="Your password has been reset. Sign in with your new password."
        footer={
          <Link
            href="/sign-in"
            className="font-medium text-sky-blue underline-offset-4 hover:underline"
          >
            Go to sign in
          </Link>
        }
      >
        <Button
          type="button"
          className="w-full"
          onClick={() => router.push("/sign-in")}
        >
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Button>
      </LoginShell>
    );
  }

  return (
    <LoginShell
      title={
        step === 0
          ? "Forgot password"
          : step === 1
            ? "Check your email"
            : "Set a new password"
      }
      subtitle={
        step === 0
          ? "Enter the email on your account. We’ll send a 6-digit code."
          : step === 1
            ? `We sent a code to ${email.trim().toLowerCase()}.`
            : "Choose a strong password, then confirm it."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-sky-blue underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {step === 0 ? (
        <form onSubmit={onEmailSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-onboarding-label text-carbon-black">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              autoComplete="email"
              required
            />
          </div>
          {error ? <ErrorBox message={error} /> : null}
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? "Sending…" : "Send code"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      ) : null}

      {step === 1 ? (
        <form onSubmit={onOtpSubmit} className="space-y-5">
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={verifying}
            autoFocus
          />
          {error ? <ErrorBox message={error} /> : null}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={verifying}
              onClick={() => {
                setError(null);
                setStep(0);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={verifying || otp.length !== 6}
            >
              {verifying ? "Verifying…" : "Verify"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-[13px] text-muted-foreground">
            Didn’t get it?{" "}
            <button
              type="button"
              className="font-medium text-sky-blue underline-offset-4 hover:underline disabled:opacity-50"
              disabled={sending || resendIn > 0}
              onClick={() => {
                setError(null);
                void sendCode().catch((err) => {
                  setError(parseApiError(err, "Could not resend code"));
                });
              }}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          </p>
        </form>
      ) : null}

      {step === 2 ? (
        <form onSubmit={onPasswordSubmit} className="space-y-5">
          <PasswordFields
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirmPassword}
            disabled={resetting}
          />
          {error ? <ErrorBox message={error} /> : null}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={resetting}
              onClick={() => {
                setError(null);
                setStep(1);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={resetting}>
              {resetting ? "Saving…" : "Update password"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : null}
    </LoginShell>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded-[15px] border border-mist-gray bg-fog-gray px-4 py-3 text-[13px] text-carbon-black">
      {message}
    </p>
  );
}
