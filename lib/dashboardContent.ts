import { supabase } from "@/lib/supabaseClient";

export type DashboardStat = {
  title: string;
  value?: string;
};

export type DashboardQuickLink = {
  label: string;
  href: string;
};

export type DashboardMiniCard = {
  label: string;
  value: string;
};

export type DashboardIntro = {
  title: string;
  text: string;
  modeLabel: string;
  modeValue: string;
};

export type DashboardContent = {
  hero_kicker: string;
  hero_title: string;
  hero_subtitle: string;
  stats: DashboardStat[];
  intro: DashboardIntro;
  mini_cards: DashboardMiniCard[];
  quick_links: DashboardQuickLink[];
  sections_title: string;
  sections_subtitle: string;
  version_label: string;
};

export const defaultDashboardContent: DashboardContent = {
  hero_kicker: "Dashboard Overview",
  hero_title: "Welcome, {name} 👋",
  hero_subtitle:
    "Your personal control hub for projects, stats, and updates. Built for speed now, ready to sync with full backend data later.",
  stats: [
    { title: "Projects", value: "03" },
    { title: "Skills" },
    { title: "Games" },
    { title: "Status", value: "Building" },
  ],
  intro: {
    title: "Intro",
    text:
      "I’m Max — a student, coder, and competitive gamer. This site is my evolving space for projects, skills, and gaming progress, built with Next.js and Tailwind.",
    modeLabel: "Mode",
    modeValue: "Focus",
  },
  mini_cards: [
    { label: "Today", value: "Improve + ship" },
    { label: "Next", value: "Projects + uploads" },
    { label: "Later", value: "Live stats + DB" },
  ],
  quick_links: [
    { label: "Discord", href: "https://discord.gg/RpgKb4FG" },
    { label: "YouTube", href: "https://youtube.com/@max_lifeyt?si=_yq83jCglUPXeFwi" },
    { label: "Instagram", href: "https://www.instagram.com/abcd1939efj/" },
  ],
  sections_title: "Sections",
  sections_subtitle: "Quick access to each part of the site (immersive mode enabled ✨).",
  version_label: "v4",
};

export async function fetchDashboardContent(): Promise<DashboardContent | null> {
  const { data, error } = await supabase
    .from("dashboard_content")
    .select("content")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data?.content) return null;
  return data.content as DashboardContent;
}

export async function upsertDashboardContent(content: DashboardContent) {
  return supabase
    .from("dashboard_content")
    .upsert({ id: "default", content })
    .select()
    .single();
}
