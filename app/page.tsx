"use client";

import CountUp from "@/components/CountUp";
import TiltWrap from "@/components/TiltWrap";

import { NAV_SECTIONS } from "@/data/nav";
import Card from "@/components/Card";
import Button from "@/components/Button";
import LazySection from "@/components/LazySection";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { defaultProfileDraft, fetchProfile, type ProfileDraft } from "@/lib/profile";
import {
  defaultDashboardContent,
  fetchDashboardContent,
  type DashboardContent,
} from "@/lib/dashboardContent";
import { isAdminEmail } from "@/lib/admin";
import {
  defaultSiteSettings,
  fetchSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

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
  const [displayName, setDisplayName] = useState("Max");
  const [profile, setProfile] = useState<ProfileDraft>(defaultProfileDraft);
  const [content, setContent] = useState<DashboardContent>(
    defaultDashboardContent
  );
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSiteSettings);
  const [isAdmin, setIsAdmin] = useState(false);
  const sections = NAV_SECTIONS.filter((x) => x.href !== "/" && x.icon !== null);
  const visibleSections = sections.filter((section) => {
    if (section.adminOnly && !isAdmin) return false;
    if (section.href === "/about" && !siteSettings.nav.show_about) return false;
    if (section.href === "/gaming" && !siteSettings.nav.show_gaming) return false;
    if (section.href === "/projects" && !siteSettings.nav.show_projects) return false;
    if (section.href === "/contact" && !siteSettings.nav.show_contact) return false;
    return true;
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) return;
      setIsAdmin(isAdminEmail(session.user.email));
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

  useEffect(() => {
    let mounted = true;
    fetchDashboardContent().then((data) => {
      if (!mounted || !data) return;
      setContent({ ...defaultDashboardContent, ...data });
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchSiteSettings().then((settings) => {
      if (!mounted) return;
      setSiteSettings(settings);
    });
    return () => {
      mounted = false;
    };
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

  const statsSource =
    content.stats && content.stats.length
      ? content.stats
      : defaultDashboardContent.stats;
  const statsNormalized = [
    ...statsSource,
    ...defaultDashboardContent.stats,
  ].slice(0, 4);

  const stats = [
    { title: statsNormalized[0]?.title || "Projects", value: statsNormalized[0]?.value ?? "03" },
    { title: statsNormalized[1]?.title || "Skills", chips: skills },
    { title: statsNormalized[2]?.title || "Games", chips: games },
    {
      title: statsNormalized[3]?.title || "Status",
      value: profile.play_style || statsNormalized[3]?.value || "Building",
    },
  ];

  const hasProfile =
    Boolean(profile.name) ||
    Boolean(profile.username) ||
    Boolean(profile.skills) ||
    Boolean(profile.game);

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
          {content.hero_kicker}
        </p>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          {content.hero_title.replace("{name}", displayName)}
        </h1>

        <p className="text-zinc-400 text-sm max-w-2xl">
          {content.hero_subtitle}
        </p>
      </div>

      {!hasProfile ? (
        <Card className="p-5 border-emerald-500/20 bg-emerald-500/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-200 uppercase tracking-wide">
                Fresh profile
              </p>
              <p className="text-sm text-emerald-100 mt-1">
                Finish onboarding to unlock personalized stats and dashboard cards.
              </p>
            </div>
            <Link href="/onboarding">
              <Button>Start onboarding</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      {siteSettings.dashboard.show_stats ? (
        <LazySection minHeight={180}>
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
        </LazySection>
      ) : null}

      {siteSettings.dashboard.show_profile_hint && !hasProfile ? (
        <Card className="p-5 border-emerald-500/20 bg-emerald-500/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-200 uppercase tracking-wide">
                Fresh profile
              </p>
              <p className="text-sm text-emerald-100 mt-1">
                Finish onboarding to unlock personalized stats and dashboard cards.
              </p>
            </div>
            <Link href="/onboarding">
              <Button>Start onboarding</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      {(siteSettings.dashboard.show_intro ||
        siteSettings.dashboard.show_quick_links) && (
        <LazySection minHeight={220}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger">
          {siteSettings.dashboard.show_intro ? (
            <TiltWrap className="rounded-[18px] lg:col-span-2" max={7}>
              <Card className="min-h-[260px] p-6 card-shine glow vibe-cyber">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {content.intro.title}
                    </h2>
                    <p className="text-zinc-400 text-sm mt-3 max-w-xl">
                      {content.intro.text}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-zinc-500">
                      {content.intro.modeLabel}
                    </p>
                    <p className="text-sm font-medium">
                      {content.intro.modeValue}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(content.mini_cards.length
                    ? content.mini_cards
                    : defaultDashboardContent.mini_cards
                  ).map((c) => (
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
          ) : null}

          {siteSettings.dashboard.show_quick_links ? (
            <TiltWrap className="rounded-[18px]" max={7}>
              <Card className="p-6 card-shine glow vibe-neon">
                <h2 className="text-lg font-semibold">Quick Links</h2>

                <p className="text-zinc-400 text-sm mt-2">
                  Shortcuts to your main places.
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  {(content.quick_links.length
                    ? content.quick_links
                    : defaultDashboardContent.quick_links
                  ).map((item) => (
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
          ) : null}
          </div>
        </LazySection>
      )}

      {siteSettings.dashboard.show_sections ? (
        <LazySection minHeight={240}>
          <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">{content.sections_title}</h2>
              <p className="text-sm text-zinc-400 mt-1">
                {content.sections_subtitle}
              </p>
            </div>

            <p className="text-xs text-zinc-500">{content.version_label}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            {visibleSections.map((s) => {
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
                          <Icon
                            size={18}
                            className={active ? "opacity-100" : "opacity-70"}
                          />
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
        </LazySection>
      ) : null}
    </div>
  );
}
