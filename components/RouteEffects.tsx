"use client";

import { usePathname } from "next/navigation";
import VibeBackground from "@/components/VibeBackground";
import GamingParticles from "@/components/GamingParticles";
import DashboardParticles from "@/components/DashboardParticles";

export default function RouteEffects() {
  const pathname = usePathname();
  const isGaming = pathname === "/gaming" || pathname.startsWith("/gaming/");
  const isHome = pathname === "/";

  return (
    <>
      <VibeBackground />
      <div className="ambient-overlay" aria-hidden="true" />
      <div className="filmgrain" aria-hidden="true" />
      <DashboardParticles
        variant={isHome ? "dashboard" : "default"}
        className={isGaming ? "opacity-45" : isHome ? "opacity-80" : "opacity-60"}
      />
      {isGaming ? <GamingParticles /> : null}
    </>
  );
}
