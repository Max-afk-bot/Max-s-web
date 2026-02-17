"use client";

import { usePathname } from "next/navigation";
import VibeBackground from "@/components/VibeBackground";
import GamingParticles from "@/components/GamingParticles";
import DashboardParticles from "@/components/DashboardParticles";

export default function RouteEffects() {
  const pathname = usePathname();
  const isGaming = pathname === "/gaming" || pathname.startsWith("/gaming/");
  const isHome = pathname === "/";
  const isYoutube = pathname === "/youtube" || pathname.startsWith("/youtube/");

  return (
    <>
      <VibeBackground />
      <div className="ambient-overlay" aria-hidden="true" />
      <div className="filmgrain" aria-hidden="true" />
      <DashboardParticles
        variant={isHome ? "dashboard" : isYoutube ? "youtube" : "default"}
        className={
          isGaming ? "opacity-45" : isHome ? "opacity-80" : isYoutube ? "opacity-40" : "opacity-60"
        }
      />
      {isGaming ? <GamingParticles /> : null}
    </>
  );
}
