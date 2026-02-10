"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "About", href: "/admin/about" },
  { label: "Gaming", href: "/admin/gaming" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Inbox", href: "/admin/inbox" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              "rounded-xl border px-4 py-2 text-sm transition",
              active
                ? "border-zinc-700 bg-zinc-900 text-white"
                : "border-zinc-800 text-zinc-400 hover:bg-zinc-900/40 hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
