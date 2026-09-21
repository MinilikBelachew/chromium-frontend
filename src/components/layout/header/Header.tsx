"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import BrandLogo from "@/components/common/BrandLogo";
import { motion } from "framer-motion";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "Product" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const Header: React.FC = () => {
  return (
    <motion.header
      className="absolute inset-x-0 top-0 z-50"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-6 py-6 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Fanaye">
          <BrandLogo href={null} size={28} />
          <span className="text-[15px] font-medium tracking-[-0.02em] text-white">Fanaye</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-white/70 transition-colors duration-300 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/get-started"
          className="text-[13px] font-medium text-white transition-opacity duration-300 hover:opacity-70"
        >
          Get started
        </Link>
      </div>
    </motion.header>
  );
};

export default Header;
