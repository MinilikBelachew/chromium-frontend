"use client";

import React, { useEffect, useRef } from "react";

const OTP_LENGTH = 6;

export default function OtpInput({
  value,
  onChange,
  disabled,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus]);

  function setDigit(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").slice(0, OTP_LENGTH));
  }

  function handleChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigit(index, "");
      return;
    }

    if (cleaned.length > 1) {
      // Paste or autofill into one box
      const merged = (value.slice(0, index) + cleaned)
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);
      onChange(merged);
      const focusAt = Math.min(merged.length, OTP_LENGTH - 1);
      inputsRef.current[focusAt]?.focus();
      return;
    }

    setDigit(index, cleaned);
    if (index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, "");
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          className="h-12 w-full max-w-[52px] rounded-[15px] border border-border bg-card text-center text-[20px] font-semibold tracking-tight text-foreground shadow-none outline-none focus:border-sunrise-coral focus:ring-2 focus:ring-sunrise-coral/25 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
