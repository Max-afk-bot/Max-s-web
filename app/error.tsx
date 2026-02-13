"use client";

import Link from "next/link";
import Card from "@/components/Card";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <Card className="p-8 max-w-xl text-center border-zinc-800 bg-zinc-950/70">
        <p className="text-xs text-zinc-500 uppercase tracking-wide">Error</p>
        <h1 className="text-2xl sm:text-3xl font-semibold mt-2">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-400 mt-3">
          The page hit an error. Try again or go back to the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm hover:bg-zinc-900/60 transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm hover:bg-zinc-900/60 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
