"use client";

import React, { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/features/creator/AuthShell";
import { getUserSession } from "@/lib/user-session";

export default function UserLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getUserSession()) {
      router.replace("/app");
    }
  }, [router]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const session = getUserSession();
    if (!session) {
      setError("No viewer account on this device yet. Register first.");
      return;
    }
    if (session.email !== email.trim().toLowerCase()) {
      setError("Email doesn’t match the account registered on this browser.");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }
    router.push("/app");
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Frontend-only demo — use the email you registered with on this browser."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="text-carbon-black underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] text-carbon-black">
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
          <Label htmlFor="password" className="text-[13px] text-carbon-black">
            Password
          </Label>
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
        <Button type="submit" className="w-full">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
