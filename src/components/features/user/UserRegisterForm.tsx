"use client";

import React, { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/features/creator/AuthShell";
import { createUserSession } from "@/lib/user-session";

const fieldClass =
  "h-11 rounded-[15px] border-border bg-card px-4 text-[15px] shadow-none";

export default function UserRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
        throw new Error("Fill in name, email, phone, and password");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      createUserSession({ name, email, phone });
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register with your name, email, and phone. We’ll open a wallet for you right away."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-carbon-black underline-offset-4 hover:underline">
            Sign in
          </Link>
          <span className="mx-2 text-[#D4D4D8]">·</span>
          Creator?{" "}
          <Link href="/sign-up" className="text-carbon-black underline-offset-4 hover:underline">
            Register a channel
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
            onChange={(event) => setName(event.target.value)}
            placeholder="Abebe Kebede"
            className={fieldClass}
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
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[13px] text-carbon-black">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="09xxxxxxxx or +2519xxxxxxxx"
            className={fieldClass}
            autoComplete="tel"
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
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className={fieldClass}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        {error ? (
          <p className="rounded-[15px] border border-mist-gray bg-fog-gray px-4 py-3 text-[13px] text-carbon-black">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          Create account & wallet
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
