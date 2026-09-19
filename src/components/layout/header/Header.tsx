"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";

const navLinks = [
  { href: "#creators", label: "Creators" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

const Header: React.FC = () => {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="pointer-events-auto mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 rounded-full border border-border bg-card/85 px-4 py-2.5 backdrop-blur-xl">
        <BrandLogo size={34} />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="h-9 w-9" />
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/get-started"
            className="rounded-full bg-sunrise-coral px-5 py-2.5 text-[13px] font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
