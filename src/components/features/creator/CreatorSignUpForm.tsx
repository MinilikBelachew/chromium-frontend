"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OnboardingShell from "@/components/features/onboarding/OnboardingShell";
import OnboardingStepPanel from "@/components/features/onboarding/OnboardingStepPanel";
import PasswordFields from "@/components/features/auth/PasswordFields";
import OtpInput from "@/components/features/auth/OtpInput";
import {
  useCreatorRegisterMutation,
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
} from "@/context/services/authApi";
import { useListGamesQuery } from "@/context/services/gamesApi";
import { parseApiError } from "@/lib/auth-errors";
import { isPasswordAcceptable } from "@/lib/password-strength";
import { parseYouTubeChannel } from "@/lib/creator-session";
import { gameLogoUrl } from "@/lib/game-logos";
import { useChannelAvailability } from "@/hooks/useChannelAvailability";

const fieldClass =
  "h-11 rounded-[15px] border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground shadow-none";

const STEPS = [
  { id: "account", label: "Account", description: "Name, email, password" },
  { id: "verify", label: "Verify", description: "Email code" },
  { id: "channel", label: "Channel", description: "YouTube link" },
  { id: "game", label: "Game", description: "Channel mini-game" },
  { id: "review", label: "Review", description: "Confirm & create" },
];

export default function CreatorSignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [gameSlug, setGameSlug] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [emailVerifiedToken, setEmailVerifiedToken] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [register, { isLoading }] = useCreatorRegisterMutation();
  const [sendOtp, { isLoading: sendingOtp }] = useSendEmailOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyEmailOtpMutation();
  const { data: games = [], isLoading: gamesLoading } = useListGamesQuery();

  const parsedChannel = useMemo(
    () => parseYouTubeChannel(channelUrl),
    [channelUrl],
  );
  const {
    status: channelStatus,
    message: channelHint,
    canContinue: channelReady,
  } = useChannelAvailability(channelUrl);

  const selectedGame = useMemo(
    () => games.find((g) => g.slug === gameSlug) ?? null,
    [games, gameSlug],
  );

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

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
      if (!parsedChannel) {
        setError("Enter a valid YouTube channel link");
        return;
      }
      if (channelStatus === "taken") {
        setError("This YouTube channel is already registered.");
        return;
      }
      if (channelStatus === "checking" || !channelReady) {
        setError("Wait until the channel is validated.");
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!gameSlug) {
        setError("Pick a mini-game for your channel");
        return;
      }
      setStep(4);
    }
  }

  async function submit() {
    setError(null);
    if (!emailVerifiedToken) {
      setError("Verify your email before creating an account");
      setStep(1);
      return;
    }
    if (!gameSlug) {
      setError("Pick a mini-game for your channel");
      setStep(3);
      return;
    }
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        channelUrl: parsedChannel?.channelUrl ?? channelUrl.trim(),
        gameSlug,
        emailVerifiedToken,
      }).unwrap();
      router.push("/dashboard");
    } catch (err) {
      setError(parseApiError(err, "Could not create creator account"));
    }
  }

  return (
    <OnboardingShell
      eyebrow="Creator onboarding"
      steps={STEPS}
      currentIndex={step}
      footer={
        <>
          Already registered?{" "}
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
        <OnboardingStepPanel
          title="Create your account"
          subtitle="Start as a creator. You’ll add your YouTube channel and mini-game next — no subscription required."
        >
          <div className="space-y-5">
            <form onSubmit={goNext} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-onboarding-label text-foreground">
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
                <Label htmlFor="email" className="text-onboarding-label text-foreground">
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
                disabled={sendingOtp}
              >
                {sendingOtp ? "Sending code…" : "Continue"}
                <ArrowRight className="size-4" />
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
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={verifyingOtp || otp.length !== 6}
              >
                {verifyingOtp ? "Verifying…" : "Verify"}
                <ArrowRight className="size-4" />
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
          title="Link your channel"
          subtitle="Submit the YouTube channel you want to monetize. Verification is reviewed after signup."
        >
          <form onSubmit={goNext} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="channel" className="text-onboarding-label text-foreground">
                YouTube channel link
              </Label>
              <Input
                id="channel"
                type="url"
                value={channelUrl}
                onChange={(e) => {
                  setError(null);
                  setChannelUrl(e.target.value);
                }}
                placeholder="https://youtube.com/@yourchannel"
                className={`${fieldClass} ${
                  channelStatus === "taken" || channelStatus === "invalid"
                    ? "border-red-400 focus-visible:ring-red-300"
                    : channelStatus === "available"
                      ? "border-emerald-400 focus-visible:ring-emerald-300"
                      : ""
                }`}
                required
              />
              {channelUrl.trim() ? (
                <p
                  className={`text-caption ${
                    channelStatus === "taken" || channelStatus === "invalid"
                      ? "text-red-600 dark:text-red-400"
                      : channelStatus === "available"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {channelHint ??
                    "Use a youtube.com or youtu.be channel URL."}
                </p>
              ) : (
                <p className="text-caption text-muted-foreground">
                  Use a youtube.com or youtu.be channel URL.
                </p>
              )}
            </div>
            {error ? <ErrorBox message={error} /> : null}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!channelReady}
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </OnboardingStepPanel>
      ) : null}

      {step === 3 ? (
        <OnboardingStepPanel
          title="Choose your channel game"
          subtitle="Viewers play this mini-game beside your videos in Vero Browser. This choice is locked after signup."
        >
          <form onSubmit={goNext} className="space-y-5">
            {gamesLoading ? (
              <p className="text-[13px] text-muted-foreground">Loading games…</p>
            ) : (
              <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
                {games.map((game) => {
                  const active = gameSlug === game.slug;
                  return (
                    <button
                      key={game.slug}
                      type="button"
                      onClick={() => {
                        setError(null);
                        setGameSlug(game.slug);
                      }}
                      className={`flex items-center gap-3 rounded-[15px] border px-4 py-3 text-left transition-colors ${
                        active
                          ? "border-sunrise-coral/50 bg-sunrise-coral/15 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      <img
                        src={gameLogoUrl(game.slug)}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-lg object-contain"
                      />
                      <span className="min-w-0 flex-1 text-[14px] font-medium tracking-[-0.01em]">
                        {game.name}
                      </span>
                      {active ? (
                        <Check className="h-4 w-4 shrink-0 text-sunrise-coral" strokeWidth={2.25} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
            {error ? <ErrorBox message={error} /> : null}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={!gameSlug}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </OnboardingStepPanel>
      ) : null}

      {step === 4 ? (
        <OnboardingStepPanel
          title="Review & confirm"
          subtitle="Create your creator account. Your channel starts as pending verification."
        >
          <div className="space-y-4 rounded-[15px] border border-border bg-card p-4">
            <ReviewRow label="Name" value={name.trim()} />
            <ReviewRow label="Email" value={email.trim().toLowerCase()} />
            <ReviewRow label="Email status" value="Verified" />
            <ReviewRow
              label="Channel"
              value={
                parsedChannel?.channelName
                  ? parsedChannel.channelName
                  : channelUrl
              }
            />
            <ReviewRow
              label="Channel URL"
              value={parsedChannel?.channelUrl ?? channelUrl}
            />
            <ReviewRow
              label="Channel game"
              value={selectedGame?.name ?? gameSlug}
            />
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
                setStep(3);
              }}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isLoading}
              onClick={submit}
            >
              {isLoading ? "Creating…" : "Create account"}
              <ArrowRight className="size-4" />
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
      <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-[15px] font-medium text-foreground">{value}</span>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded-[15px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive dark:text-red-400">
      {message}
    </p>
  );
}
