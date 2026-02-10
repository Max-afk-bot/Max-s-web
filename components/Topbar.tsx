"use client";

import Input from "@/components/Input";
import { usePathname } from "next/navigation";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="h-14 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenu}
        className="lg:hidden rounded-lg border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900 transition btn-press"
        aria-label="Open menu"
      >
        Menu
      </button>

      {/* Left title (Home) or Search (others) */}
      {isHome ? (
        <div className="text-sm text-zinc-300">
          Dashboard
          <span className="text-zinc-500 ml-2 text-xs">overview</span>
        </div>
      ) : (
        <div className="w-full max-w-xl">
          <Input placeholder="Search..." />
        </div>
      )}

      {/* Right pill */}
      <div className="ml-auto hidden sm:block">
        <div className="text-xs px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/30">
          Max • v1
        </div>
      </div>
    </header>
  );
}
