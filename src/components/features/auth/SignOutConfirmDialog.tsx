"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SignOutConfirmDialogProps = {
  open: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function SignOutConfirmDialog({
  open,
  busy = false,
  onCancel,
  onConfirm,
}: SignOutConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="sign-out-title"
        aria-describedby="sign-out-desc"
        className="w-full max-w-[400px] rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="sign-out-title"
          className="text-[18px] font-semibold tracking-[-0.02em] text-foreground"
        >
          Sign out?
        </h2>
        <p id="sign-out-desc" className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          You’ll need to sign in again to access your dashboard.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="sm:min-w-[110px]"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="sm:min-w-[110px]"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Signing out…
              </>
            ) : (
              "Sign out"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
