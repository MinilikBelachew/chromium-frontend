"use client";

import React, { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OnboardingShell from "@/components/features/onboarding/OnboardingShell";
import OnboardingStepPanel from "@/components/features/onboarding/OnboardingStepPanel";
import { GoogleAuthBlock } from "@/components/features/auth/ContinueWithGoogle";
import PasswordFields from "@/components/features/auth/PasswordFields";
import OtpInput from "@/components/features/auth/OtpInput";
import {
  useCheckPhoneMutation,
  useGoogleLoginMutation,
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useViewerRegisterMutation,
} from "@/context/services/authApi";
import { parseApiError } from "@/lib/auth-errors";
import { homePathForRole } from "@/lib/auth-routing";
import { isPasswordAcceptable } from "@/lib/password-strength";
import { normalizePhone } from "@/lib/user-session";

const fieldClass =
  "h-11 rounded-[15px] border-border bg-card px-4 text-[15px] shadow-none";

const STEPS = [
  { id: "account", label: "Account", description: "Name, email, password" },
  { id: "verify", label: "Verify", description: "Email code" },
  { id: "contact", label: "Contact", description: "Phone number" },
  { id: "review", label: "Review", description: "Confirm & create" },
];

export default function UserRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [emailVerifiedToken, setEmailVerifiedToken] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [register, { isLoading }] = useViewerRegisterMutation();
  const [googleLogin, { isLoading: googleLoading }] = useGoogleLoginMutation();
  const [sendOtp, { isLoading: sendingOtp }] = useSendEmailOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyEmailOtpMutation();
  const [checkPhone, { isLoading: checkingPhone }] = useCheckPhoneMutation();

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  async function continueWithGoogle(idToken: string) {
    setError(null);
    try {
      const result = await googleLogin({
        idToken,
        intent: "viewer",
      }).unwrap();
      router.push(homePathForRole(result.user.role));
    } catch (err) {
      setError(parseApiError(err, "Could not continue with Google"));
    }
  }

  async function requestOtp() {
    const result = await sendOtp({
      email: email.trim().toLowerCase(),
    }).unwrap();
    setChallengeToken(result.challengeToken);
    setOtp("");
    setEmailVerifiedToken("");
    setResendIn(60);
  }

  async function goNext(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (step === 0) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Fill in name, email, and password");
        return;
      }
      if (!isPasswordAcceptable(password)) {
        setError(
          "Use at least 8 characters with upper, lower, and a number",
        );
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        await requestOtp();
        setStep(1);
      } catch (err) {
        setError(parseApiError(err, "Could not send verification code"));
      }
      return;
    }

    if (step === 1) {
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
        setEmailVerifiedToken(result.emailVerifiedToken);
        setStep(2);
      } catch (err) {
        setError(parseApiError(err, "Invalid or expired code"));
      }
      return;
    }

    if (step === 2) {
      const normalized = normalizePhone(phone);
      if (!normalized) {
        setError("Enter a valid phone number, e.g. 09xxxxxxxx or +2519xxxxxxxx");
        return;
      }
      try {
        await checkPhone({ phone: normalized }).unwrap();
        setPhone(normalized);
        setStep(3);
      } catch (err) {
        setError(parseApiError(err, "This phone number is already in use"));
      }
    }
  }

  async function submit() {
    setError(null);
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError("Enter a valid phone number, e.g. 09xxxxxxxx or +2519xxxxxxxx");
      return;
    }
    if (!emailVerifiedToken) {
      setError("Verify your email before creating an account");
      setStep(1);
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: normalized,
        emailVerifiedToken,
      }).unwrap();
      router.push("/app");
    } catch (err) {
      setError(parseApiError(err, "Could not create account"));
    }
  }

  return (
    <OnboardingShell
      eyebrow="Viewer onboarding"
      steps={STEPS}
      currentIndex={step}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-sky-blue underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
          <span className="mx-2 text-[#D4D4D8]">·</span>
          Creator?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-sky-blue underline-offset-4 hover:underline"
          >
            Register a channel
          </Link>
        </>
      }
    >
      {step === 0 ? (
        <OnboardingStepPanel
          title="Create your account"
          subtitle="Register as a viewer to watch creators and play mini-games in Vero browser."
        >
          <div className="space-y-5">
            <GoogleAuthBlock
              disabled={isLoading || googleLoading || sendingOtp}
              onCredential={continueWithGoogle}
              onError={(message) => setError(message || null)}
            />
            <form onSubmit={goNext} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-onboarding-label text-carbon-black">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Abebe Kebede"
                  className={fieldClass}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-onboarding-label text-carbon-black">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={fieldClass}
                  autoComplete="email"
                  required
                />
              </div>
              <PasswordFields
                password={password}
                confirmPassword={confirmPassword}
                onPasswordChange={setPassword}
                onConfirmChange={setConfirmPassword}
                disabled={sendingOtp}
              />
              {error ? <ErrorBox message={error} /> : null}
              <Button
                type="submit"
                className="w-full"
                disabled={googleLoading || sendingOtp}
              >
                {sendingOtp ? "Sending code…" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </OnboardingStepPanel>
      ) : null}

      {step === 1 ? (
        <OnboardingStepPanel
          title="Verify your email"
          subtitle={`We sent a 6-digit code to ${email.trim().toLowerCase()}.`}
        >
          <form onSubmit={goNext} className="space-y-5">
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={verifyingOtp}
              autoFocus
            />
            {error ? <ErrorBox message={error} /> : null}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={verifyingOtp}
                onClick={() => {
                  setError(null);
                  setOtp("");
                  setStep(0);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={verifyingOtp || otp.length !== 6}
              >
                {verifyingOtp ? "Verifying…" : "Verify"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-[13px] text-muted-foreground">
              Didn’t get it?{" "}
              <button
                type="button"
                className="font-medium text-sky-blue underline-offset-4 hover:underline disabled:opacity-50"
                disabled={sendingOtp || resendIn > 0}
                onClick={() => {
                  setError(null);
                  void requestOtp().catch((err) => {
                    setError(
                      parseApiError(err, "Could not resend verification code"),
                    );
                  });
                }}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
            </p>
          </form>
        </OnboardingStepPanel>
      ) : null}

      {step === 2 ? (
        <OnboardingStepPanel
          title="Add your phone"
          subtitle="We use your Ethiopian mobile number for account security and payouts."
        >
          <form onSubmit={goNext} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-onboarding-label text-carbon-black">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx or +2519xxxxxxxx"
                className={fieldClass}
                autoComplete="tel"
                required
              />
            </div>
            {error ? <ErrorBox message={error} /> : null}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={checkingPhone}
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={checkingPhone}>
                {checkingPhone ? "Checking…" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </OnboardingStepPanel>
      ) : null}

      {step === 3 ? (
        <OnboardingStepPanel
          title="Review & confirm"
          subtitle="We’ll create your account so you can watch and play."
        >
          <div className="space-y-4 rounded-[15px] border border-mist-gray bg-fog-gray/60 p-4">
            <ReviewRow label="Name" value={name.trim()} />
            <ReviewRow label="Email" value={email.trim().toLowerCase()} />
            <ReviewRow label="Phone" value={normalizePhone(phone) ?? phone} />
            <ReviewRow label="Email status" value="Verified" />
          </div>
          {error ? (
            <div className="mt-5">
              <ErrorBox message={error} />
            </div>
          ) : null}
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={() => {
                setError(null);
                setStep(2);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isLoading}
              onClick={submit}
            >
              {isLoading ? "Creating…" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </OnboardingStepPanel>
      ) : null}
    </OnboardingShell>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-zinc-gray">
        {label}
      </span>
      <span className="truncate text-[15px] text-carbon-black">{value}</span>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded-[15px] border border-mist-gray bg-fog-gray px-4 py-3 text-[13px] text-carbon-black">
      {message}
    </p>
  );
}
