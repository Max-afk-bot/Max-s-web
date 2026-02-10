"use client";

import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/data/nav";

function getVibeForPath(pathname: string) {
  if (pathname.startsWith("/admin")) return "neon";
  const hit = NAV_SECTIONS.find(
    (x) => x.href === pathname || pathname.startsWith(x.href + "/")
  );
  return hit?.vibe ?? "none";
}

export default function VibeBackground() {
  const pathname = usePathname();
  const vibe = getVibeForPath(pathname);

  const bg =
    vibe === "fire"
      ? "radial-gradient(60% 60% at 25% 25%, rgba(255,120,40,.12), transparent 70%)," +
        "radial-gradient(60% 60% at 75% 35%, rgba(255,180,0,.08), transparent 70%)"
      : vibe === "neon"
      ? "radial-gradient(60% 60% at 25% 25%, rgba(90,255,220,.10), transparent 70%)," +
        "radial-gradient(60% 60% at 75% 35%, rgba(120,90,255,.08), transparent 70%)"
      : vibe === "cyber"
      ? "radial-gradient(60% 60% at 25% 25%, rgba(80,180,255,.10), transparent 70%)," +
        "radial-gradient(60% 60% at 75% 35%, rgba(255,80,200,.06), transparent 70%)"
      : "radial-gradient(60% 60% at 25% 25%, rgba(255,255,255,.04), transparent 70%)";

  return <div className="premium-bg" style={{ background: bg }} />;
}
