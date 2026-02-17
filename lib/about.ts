import { supabase } from "@/lib/supabaseClient";

export type AboutContent = {
  hero_title: string;
  hero_paragraph: string;
  focus_value: string;
  direction_value: string;
  journey_title: string;
  journey_items: string[];
  programming_items: string[];
  gaming_tagline: string;
  gaming_chips: string[];
  gaming_experience: string;
  gaming_strengths: string;
  gaming_training: string;
  gaming_games: string[];
  gaming_history: string;
  deliver_values: {
    ui_quality: string;
    mindset: string;
    direction: string;
    experience: string;
  };
  skill_stack: string[];
  current_focus: string[];
  principles_line: string;
  principles_items: string[];
};

export const defaultAboutContent: AboutContent = {
  hero_title: "Max — competitive gamer and focused Python developer.",
  hero_paragraph:
    "Welcome to my space. Here you can access my socials and see what I’m building. I’m an intermediate Python programmer with around 6 months of focused practice, and I love competitive gaming. This site is my premium, fast, and clear portfolio while I grow toward AI/ML and security‑focused engineering.",
  focus_value: "Python + web UI",
  direction_value: "AI/ML + security",
  journey_title: "Learning Journey",
  journey_items: [
    "Started Python ~6 months ago and practice consistently with small projects.",
    "Sharpening web UI skills using Next.js + Tailwind.",
    "Moving toward AI/ML and security‑focused engineering paths.",
  ],
  programming_items: [
    "Python for 6 months with consistent daily practice",
    "Basic web development and clean UI structure",
    "Next goal: AI, machine learning, and security path",
  ],
  gaming_tagline: "Main focus of this profile",
  gaming_chips: ["6 years", "Competitive", "Attacking"],
  gaming_experience:
    "6 years of consistent play with a high‑pressure, aggressive style.",
  gaming_strengths:
    "Attacking mindset, fast decisions, intelligent reads, and strong fundamentals.",
  gaming_training:
    "Focused training to master Minecraft (Bedrock), especially sword PvP and clutch plays.",
  gaming_games: ["Minecraft (Bedrock)", "Clash of Clans"],
  gaming_history:
    "Retired from Free Fire and shifted full focus to long‑term mastery.",
  deliver_values: {
    ui_quality: "Clean, cinematic, and fast",
    mindset: "Attack, adapt, repeat",
    direction: "AI/ML + security",
    experience: "6 years gaming",
  },
  skill_stack: [
    "Next.js",
    "Basic Web",
    "TypeScript",
    "Supabase",
    "UI Motion",
    "Gaming UI",
    "Python",
    "Machine Learning",
    "Performance",
  ],
  current_focus: [
    "Deepen Python skills and AI foundations",
    "Ship polished pages with clean UX and motion",
    "Train consistently to master Minecraft",
  ],
  principles_line:
    "Train with discipline, build with clarity, and keep raising the bar.",
  principles_items: [
    "Competitive mindset and zero fear of losing",
    "Premium visuals with clean structure",
    "Always improving and learning fast",
  ],
};

export async function fetchAboutContent(
  id: string = "default"
): Promise<AboutContent | null> {
  const { data, error } = await supabase
    .from("about_content")
    .select("content")
    .eq("id", id)
    .maybeSingle();
  if (error || !data?.content) return null;
  return data.content as AboutContent;
}

export async function upsertAboutContent(
  content: AboutContent,
  id: string = "default"
) {
  return supabase
    .from("about_content")
    .upsert({ id, content })
    .select()
    .single();
}
