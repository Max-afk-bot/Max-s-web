"use client";

import Link from "next/link";

const legalLinks = [
  { label: "Conditions of Use & Sale", href: "/documentation#conditions-use-sale" },
  { label: "Privacy Notice", href: "/documentation#privacy-notice" },
  { label: "Interest-Based Ads", href: "/documentation#interest-based-ads" },
  { label: "Cookies Notice", href: "/documentation#cookies-notice" },
  { label: "Contact & Notices", href: "/documentation#contact-notices" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 sm:p-6 legal-footer">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">
        {legalLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-zinc-400 hover:text-zinc-100 transition underline-offset-4 hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        © 2024-{year}, Max Web Project. All rights reserved.
      </p>
    </footer>
  );
}
