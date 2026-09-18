"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/features/creator/AuthShell";
import { createCreatorSession, saveCreatorSession } from "@/lib/creator-session";

export default function CreatorSignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error("Fill in name, email, and password");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const session = createCreatorSession({ name, email, channelUrl });
      saveCreatorSession(session);
      router.push("/subscribe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Register as a creator"
      subtitle="Create your account and submit your YouTube channel link. Next you’ll activate Pro and open your dashboard."
      footer={
        <>
          Already registered?{" "}
          <Link href="/sign-in" className="text-carbon-black underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[13px] text-carbon-black">
            Full name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Abebe Kebede"
            className="h-11 rounded-[15px] border-border bg-card px-4 text-[15px] shadow-none"
            autoComplete="name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] text-carbon-black">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-[15px] border-border bg-card px-4 text-[15px] shadow-none"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[13px] text-carbon-black">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="h-11 rounded-[15px] border-border bg-card px-4 text-[15px] shadow-none"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="channel" className="text-[13px] text-carbon-black">
            YouTube channel link
          </Label>
          <Input
            id="channel"
            type="url"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            placeholder="https://youtube.com/@yourchannel"
            className="h-11 rounded-[15px] border-border bg-card px-4 text-[15px] shadow-none"
            required
          />
          <p className="text-caption text-zinc-gray">
            Channel verification is reviewed after signup. Revenue only starts on verified,
            authorized engagement.
          </p>
        </div>

        {error ? (
          <p className="rounded-[15px] border border-mist-gray bg-fog-gray px-4 py-3 text-[13px] text-carbon-black">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          Continue to Pro
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
