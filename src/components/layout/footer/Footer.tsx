import React from "react";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/common/BrandLogo";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1c1c1e]/10 bg-[#f7f5f0]">
      <div className="mx-auto max-w-[1120px] px-6 py-16 sm:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandLogo href={null} size={28} />
              <span className="text-[15px] font-medium tracking-[-0.02em] text-[#1c1c1e]">
                Fanaye
              </span>
            </Link>
            <p className="mt-4 max-w-[260px] text-[13px] leading-[1.6] text-[#1c1c1e]/45">
              Verified watching, mini-games, and daily leaderboards.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
            <div className="space-y-3 text-[13px]">
              <p className="text-[11px] font-medium tracking-[0.1em] text-[#1c1c1e]/35 uppercase">
                Company
              </p>
              <a href="#features" className="block text-[#1c1c1e]/7 transition-colors hover:text-[#1c1c1e]">
                Features
              </a>
              <a href="#pricing" className="block text-[#1c1c1e]/7 transition-colors hover:text-[#1c1c1e]">
                Pricing
              </a>
              <a href="#faq" className="block text-[#1c1c1e]/7 transition-colors hover:text-[#1c1c1e]">
                FAQ
              </a>
            </div>
            <div className="space-y-3 text-[13px]">
              <p className="text-[11px] font-medium tracking-[0.1em] text-[#1c1c1e]/35 uppercase">
                Product
              </p>
              <Link href="/register" className="block text-[#1c1c1e]/7 transition-colors hover:text-[#1c1c1e]">
                Viewer signup
              </Link>
              <Link href="/sign-up" className="block text-[#1c1c1e]/7 transition-colors hover:text-[#1c1c1e]">
                Creator signup
              </Link>
              <Link href="/login" className="block text-[#1c1c1e]/7 transition-colors hover:text-[#1c1c1e]">
                Sign in
              </Link>
            </div>
            <div className="space-y-3 text-[13px]">
              <p className="text-[11px] font-medium tracking-[0.1em] text-[#1c1c1e]/35 uppercase">
                Resources
              </p>
              <a href="#how-it-works" className="block text-[#1c1c1e]/7 transition-colors hover:text-[#1c1c1e]">
                How it works
              </a>
              <Link href="/get-started" className="block text-[#1c1c1e]/7 transition-colors hover:text-[#1c1c1e]">
                Get started
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-[#1c1c1e]/10 pt-6 text-[12px] text-[#1c1c1e]/35 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Fanaye Technologies</p>
          <p>Honest engagement only.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
