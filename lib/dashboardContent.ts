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
    "A clean, fast dashboard you can later connect with your backend + database. For now it’s the immersive UI foundation.",
  stats: [
    { title: "Projects", value: "03" },
    { title: "Skills" },
    { title: "Games" },
    { title: "Status", value: "Building" },
  ],
  intro: {
    title: "Intro",
    text:
      "I’m Max. Student, coder, gamer. Building a clean portfolio + dashboard with Next.js and Tailwind.",
    modeLabel: "Mode",
    modeValue: "Focus",
  },
  mini_cards: [
    { label: "Today", value: "1% better" },
    { label: "Next", value: "Projects page" },
    { label: "Later", value: "Backend + DB" },
  ],
  quick_links: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "Discord", href: "https://discord.com/" },
    { label: "Resume", href: "/profile" },
  ],
  sections_title: "Sections",
  sections_subtitle: "Quick areas of your site (immersive mode enabled ✨)",
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
