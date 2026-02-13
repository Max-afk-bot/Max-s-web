"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Card from "@/components/Card";

export default function NotFound() {
  const pathname = usePathname();
  const isGaming = pathname.startsWith("/gaming");

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <Card className="p-8 max-w-xl text-center border-zinc-800 bg-zinc-950/70">
        <p className="text-xs text-zinc-500 uppercase tracking-wide">404</p>
        <h1 className="text-2xl sm:text-3xl font-semibold mt-2">
          {isGaming ? "Gaming intel is offline" : "Page not found"}
        </h1>
        <p className="text-sm text-zinc-400 mt-3">
          {isGaming
            ? "The gaming hub is being rebuilt with live data, Discord roles, and weekly reports."
            : "The page you are looking for does not exist or was moved."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm hover:bg-zinc-900/60 transition"
          >
            Back to dashboard
          </Link>
          <Link
            href="/projects"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm hover:bg-zinc-900/60 transition"
          >
            View projects
          </Link>
        </div>
      </Card>
    </div>
  );
}
