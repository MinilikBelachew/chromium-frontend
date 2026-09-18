"use client";

import React, { useMemo, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OnboardingShell from "@/components/features/onboarding/OnboardingShell";
import OnboardingStepPanel from "@/components/features/onboarding/OnboardingStepPanel";
import { useCreatorRegisterMutation } from "@/context/services/authApi";
import { parseApiError } from "@/lib/auth-errors";
import { parseYouTubeChannel } from "@/lib/creator-session";

const fieldClass =
  "h-11 rounded-[15px] border-border bg-card px-4 text-[15px] shadow-none";

const STEPS = [
  { id: "account", label: "Account", description: "Name, email, password" },
  { id: "channel", label: "Channel", description: "YouTube link" },
  { id: "review", label: "Review", description: "Confirm & create" },
];

export default function CreatorSignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [register, { isLoading }] = useCreatorRegisterMutation();

  const parsedChannel = useMemo(
    () => parseYouTubeChannel(channelUrl),
    [channelUrl],
  );

  function goNext(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (step === 0) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Fill in name, email, and password");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!parsedChannel) {
        setError("Enter a valid YouTube channel link");
        return;
      }
      setStep(2);
    }
  }

  async function submit() {
    setError(null);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        channelUrl: parsedChannel?.channelUrl ?? channelUrl.trim(),
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
            className="text-carbon-black underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {step === 0 ? (
        <OnboardingStepPanel
          title="Create your account"
          subtitle="Start as a creator. You’ll add your YouTube channel next — no subscription required."
        >
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-onboarding-label text-carbon-black">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={fieldClass}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            {error ? <ErrorBox message={error} /> : null}
            <Button type="submit" className="w-full">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </OnboardingStepPanel>
      ) : null}

      {step === 1 ? (
        <OnboardingStepPanel
          title="Link your channel"
          subtitle="Submit the YouTube channel you want to monetize. Verification is reviewed after signup."
        >
          <form onSubmit={goNext} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="channel" className="text-onboarding-label text-carbon-black">
                YouTube channel link
              </Label>
              <Input
                id="channel"
                type="url"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className={fieldClass}
                required
              />
              {parsedChannel ? (
                <p className="text-caption text-zinc-gray">
                  Detected:{" "}
                  <span className="text-carbon-black">{parsedChannel.channelName}</span>
                </p>
              ) : (
                <p className="text-caption text-zinc-gray">
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
                  setStep(0);
                }}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </OnboardingStepPanel>
      ) : null}

      {step === 2 ? (
        <OnboardingStepPanel
          title="Review & confirm"
          subtitle="Create your creator account. Your channel starts as pending verification."
        >
          <div className="space-y-4 rounded-[15px] border border-mist-gray bg-fog-gray/60 p-4">
            <ReviewRow label="Name" value={name.trim()} />
            <ReviewRow label="Email" value={email.trim().toLowerCase()} />
            <ReviewRow
              label="Channel"
              value={parsedChannel?.channelName ?? channelUrl}
            />
            <ReviewRow
              label="Channel URL"
              value={parsedChannel?.channelUrl ?? channelUrl}
            />
          </div>
          {error ? <div className="mt-5"><ErrorBox message={error} /></div> : null}
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={() => {
                setError(null);
                setStep(1);
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
