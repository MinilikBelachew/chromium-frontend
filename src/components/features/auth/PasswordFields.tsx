"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  evaluatePasswordStrength,
  PASSWORD_RULES,
  type PasswordStrengthLevel,
} from "@/lib/password-strength";

const fieldClass =
  "h-11 rounded-[15px] border-border bg-card px-4 text-[15px] shadow-none";

const barTone: Record<PasswordStrengthLevel, string> = {
  empty: "bg-muted",
  weak: "bg-red-500",
  fair: "bg-amber-500",
  good: "bg-sky-blue",
  strong: "bg-emerald-500",
};

const labelTone: Record<PasswordStrengthLevel, string> = {
  empty: "text-muted-foreground",
  weak: "text-red-500",
  fair: "text-amber-600",
  good: "text-sky-blue",
  strong: "text-emerald-600",
};

function StrengthMeter({
  score,
  level,
  label,
}: {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-1 gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index < score ? barTone[level] : "bg-muted"
            }`}
          />
        ))}
      </div>
      {label ? (
        <span
          className={`shrink-0 text-[12px] font-semibold tracking-[-0.01em] ${labelTone[level]}`}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

export default function PasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmChange,
  disabled,
}: {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  disabled?: boolean;
}) {
  const strength = evaluatePasswordStrength(password);
  const confirmTouched = confirmPassword.length > 0;
  const passwordsMatch =
    confirmTouched && password.length > 0 && password === confirmPassword;
  const showStrength = password.length > 0;

  return (
    <div className="space-y-5">
      <div className="relative space-y-2">
        <Label htmlFor="password" className="text-onboarding-label text-carbon-black">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Create a strong password"
          className={fieldClass}
          autoComplete="new-password"
          required
          minLength={8}
          disabled={disabled}
        />

        {/* Mobile / narrow: compact bar only — no form height bloat */}
        {showStrength ? (
          <div className="lg:hidden">
            <StrengthMeter
              score={strength.score}
              level={strength.level}
              label={strength.label}
            />
          </div>
        ) : null}

        {/* Desktop: float beside the field, outside the form column */}
        {showStrength ? (
          <aside
            aria-live="polite"
            className="pointer-events-none absolute left-[calc(100%+1.5rem)] top-0 z-10 hidden w-[220px] lg:block xl:left-[calc(100%+2rem)]"
          >
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                Password strength
              </p>
              <StrengthMeter
                score={strength.score}
                level={strength.level}
                label={strength.label}
              />
              <ul className="space-y-1.5">
                {PASSWORD_RULES.map((rule) => {
                  const ok = strength.checks[rule.key];
                  return (
                    <li
                      key={rule.key}
                      className={`flex items-center gap-1.5 text-[12px] leading-snug ${
                        ok ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      {ok ? (
                        <Check className="size-3.5 shrink-0" strokeWidth={2.5} />
                      ) : (
                        <X
                          className="size-3.5 shrink-0 opacity-50"
                          strokeWidth={2.5}
                        />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirm-password"
          className="text-onboarding-label text-carbon-black"
        >
          Confirm password
        </Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => onConfirmChange(e.target.value)}
          placeholder="Re-enter your password"
          className={fieldClass}
          autoComplete="new-password"
          required
          disabled={disabled}
        />
        {confirmTouched ? (
          <p
            className={`text-[12px] font-medium ${
              passwordsMatch ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
