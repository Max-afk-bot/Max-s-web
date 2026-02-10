"use client";

import CountUp from "@/components/CountUp";
import TiltWrap from "@/components/TiltWrap";

import { DASHBOARD } from "@/data/dashboard";
import { NAV_SECTIONS } from "@/data/nav";
import Card from "@/components/Card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { defaultProfileDraft, fetchProfile, type ProfileDraft } from "@/lib/profile";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function glowClass(vibe: string) {
  if (vibe === "fire") return "glow vibe-fire";
  if (vibe === "neon") return "glow vibe-neon";
  if (vibe === "cyber") return "glow vibe-cyber";
  return "";
}

export default function Home() {
  const pathname = usePathname();
  const sections = NAV_SECTIONS.filter((x) => x.href !== "/" && x.icon !== null);
  const [displayName, setDisplayName] = useState("Max");
  const [profile, setProfile] = useState<ProfileDraft>(defaultProfileDraft);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) return;
      fetchProfile(session.user.id).then((profile) => {
        if (profile) {
          setProfile({ ...defaultProfileDraft, ...profile });
        }
        if (profile?.name) {
          setDisplayName(profile.name);
          return;
        }
        const fallback =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "User";
        setDisplayName(fallback);
      });
    });
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  };

  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "30%");
  };

  const skills = String(profile.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const games = String(profile.game || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const stats = [
    { title: "Projects", value: DASHBOARD.stats[0]?.value ?? "03" },
    { title: "Skills", chips: skills },
    { title: "Games", chips: games },
    { title: "Status", value: profile.play_style || "Building" },
  ];

  return (
    <div
      className="relative space-y-8 overflow-hidden animate-pageIn dashboard-stage"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="dashboard-spotlight" aria-hidden="true" />
      <div className="dashboard-scanlines" aria-hidden="true" />
      <div className="dashboard-bloom" aria-hidden="true" />
      <div className="dashboard-mist" aria-hidden="true" />

      {/* Floating Accent Layer */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl top-[-120px] left-[-120px] animate-floatSlow" />
        <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl bottom-[-140px] right-[-140px] animate-floatSlow2" />
      </div>

      {/* Header */}
      <div className="space-y-3">
        <p className="text-xs tracking-wide text-zinc-500 uppercase">
          Dashboard Overview
        </p>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Welcome, {displayName} 👋
        </h1>

        <p className="text-zinc-400 text-sm max-w-2xl">
          A clean, fast dashboard you can later connect with your backend + database.
          For now it’s the immersive UI foundation.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
        {stats.map((item) => (
          <TiltWrap key={item.title} className="rounded-[18px]" max={8}>
            <Card className="p-5 card-shine glow vibe-neon transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-zinc-400 text-xs">{item.title}</p>
                <span className="h-2 w-2 rounded-full bg-cyan-400 opacity-70 stat-pulse" />
              </div>

              {item.chips ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.chips.length > 0 ? (
                    item.chips.map((chip) => (
                      <span key={chip} className="chip chip-mini">
                        {chip}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">—</span>
                  )}
                </div>
              ) : (
                <p className="text-2xl font-semibold mt-3">
                  <CountUp value={item.value ?? ""} />
                </p>
              )}

              <p className="text-xs text-zinc-500 mt-2">Updated just now</p>
            </Card>
          </TiltWrap>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger">
        {/* Intro Card */}
        <TiltWrap className="rounded-[18px] lg:col-span-2" max={7}>
          <Card className="min-h-[260px] p-6 card-shine glow vibe-cyber">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{DASHBOARD.intro.title}</h2>
                <p className="text-zinc-400 text-sm mt-3 max-w-xl">
                  {DASHBOARD.intro.text}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-zinc-500">{DASHBOARD.intro.modeLabel}</p>
                <p className="text-sm font-medium">{DASHBOARD.intro.modeValue}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DASHBOARD.miniCards.map((c) => (
                <TiltWrap key={c.label} className="rounded-xl" max={6}>
                  <div className="rounded-xl border border-zinc-800 p-4 hover:bg-zinc-900/40 transition">
                    <p className="text-xs text-zinc-500">{c.label}</p>
                    <p className="text-sm font-medium mt-2">{c.value}</p>
                  </div>
                </TiltWrap>
              ))}
            </div>
          </Card>
        </TiltWrap>

        {/* Quick Links */}
        <TiltWrap className="rounded-[18px]" max={7}>
          <Card className="p-6 card-shine glow vibe-neon">
            <h2 className="text-lg font-semibold">Quick Links</h2>

            <p className="text-zinc-400 text-sm mt-2">
              Shortcuts to your main places.
            </p>

            <div className="mt-5 space-y-3 text-sm">
              {DASHBOARD.quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  className="block rounded-lg border border-zinc-800 p-3 hover:bg-zinc-900 transition magnetic btn-press"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </Card>
        </TiltWrap>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Sections</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Quick areas of your site (immersive mode enabled ✨)
            </p>
          </div>

          <p className="text-xs text-zinc-500">v4</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
          {sections.map((s) => {
            const active = isActive(pathname, s.href);
            const Icon = s.icon!;

            return (
              <Link key={s.title} href={s.href} className="block">
                <TiltWrap className="rounded-[18px]" max={8}>
                  <Card
                    className={[
                      "p-5 cursor-pointer card-shine transition-all duration-300",
                      glowClass(s.vibe),
                      active
                        ? "border-white/30 bg-white/5 ring-2 ring-white/20"
                        : "border-zinc-800 hover:bg-zinc-900/40",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={18} className={active ? "opacity-100" : "opacity-70"} />
                        <p className="text-sm font-medium">{s.title}</p>
                      </div>

                      <span
                        className={[
                          "h-2 w-2 rounded-full bg-cyan-400 transition",
                          active ? "opacity-100" : "opacity-70",
                        ].join(" ")}
                      />
                    </div>

                    <p className="text-xs text-zinc-400 mt-3">{s.desc}</p>

                    <p className="text-xs text-zinc-500 mt-4">
                      {active ? "You’re here 👇" : "Open →"}
                    </p>
                  </Card>
                </TiltWrap>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
