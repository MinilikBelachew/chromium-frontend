"use client";

import { useEffect, useMemo, useState } from "react";
import { formatAmharicChannelName } from "@/lib/channel-display";
import { parseYouTubeChannel } from "@/lib/creator-session";
import { useLazyCheckChannelAvailabilityQuery } from "@/context/services/gamesApi";

export type ChannelAvailabilityStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

export function useChannelAvailability(channelUrl: string) {
  const parsed = useMemo(() => parseYouTubeChannel(channelUrl), [channelUrl]);
  const [status, setStatus] = useState<ChannelAvailabilityStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [checkAvailability] = useLazyCheckChannelAvailabilityQuery();

  useEffect(() => {
    const trimmed = channelUrl.trim();
    if (!trimmed) {
      setStatus("idle");
      setMessage(null);
      return;
    }

    if (!parsed) {
      setStatus("invalid");
      setMessage("Enter a valid YouTube channel link (youtube.com or youtu.be).");
      return;
    }

    setStatus("checking");
    setMessage("Checking if this channel is available…");

    const timer = window.setTimeout(() => {
      void checkAvailability({ channelUrl: parsed.channelUrl })
        .unwrap()
        .then((result) => {
          if (!result.valid) {
            setStatus("invalid");
            setMessage(
              "Enter a valid YouTube channel link (youtube.com or youtu.be).",
            );
            return;
          }
          if (result.registered) {
            setStatus("taken");
            setMessage("This YouTube channel is already registered.");
            return;
          }
          setStatus("available");
          const label = formatAmharicChannelName(result.channelName);
          setMessage(
            label
              ? `Detected: ${label} — available`
              : "Channel looks good — available",
          );
        })
        .catch(() => {
          setStatus("error");
          setMessage("Could not verify this channel. Try again.");
        });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [channelUrl, parsed, checkAvailability]);

  return {
    parsed,
    status,
    message,
    canContinue: Boolean(parsed) && status === "available",
    isChecking: status === "checking",
  };
}
