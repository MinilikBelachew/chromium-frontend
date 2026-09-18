import React from "react";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/common/BrandLogo";
import { BRAND } from "@/lib/brand";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="wide-shell flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <BrandLogo size={44} />
          <p className="mt-4 max-w-[280px] text-[13px] leading-[1.6] text-muted-foreground">
            {BRAND.name} — {BRAND.tagline}. Authorized viewing, auditable ledger, clean settlement.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-[13px] sm:gap-14">
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Viewers
            </p>
            <Link href="/register" className="block text-foreground hover:underline">
              Create account
            </Link>
            <Link href="/login" className="block text-foreground hover:underline">
              Sign in
            </Link>
          </div>
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Creators
            </p>
            <Link href="/sign-up" className="block text-foreground hover:underline">
              Register channel
            </Link>
            <a href="#faq" className="block text-foreground hover:underline">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
