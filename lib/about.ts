import { supabase } from "@/lib/supabaseClient";

export type AboutContent = {
  hero_title: string;
  hero_paragraph: string;
  focus_value: string;
  direction_value: string;
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
  hero_title: "Max, a competitive gamer and growing Python developer.",
  hero_paragraph:
    "Welcome to my space. Here you can access my socials and learn more about the work I am building. I am an intermediate Python programmer with a strong interest in gaming and modern web experiences. I am shaping this site to feel premium, fast, and clear while evolving my skills in AI and machine learning for the future.",
  focus_value: "Python and web UI",
  direction_value: "AI and ML path",
  programming_items: [
    "Python for 6 months and growing fast",
    "Basic web development and clean UI structure",
    "Future goal: AI, machine learning, and security path",
  ],
  gaming_tagline: "Main focus of this profile",
  gaming_chips: ["6 years", "Competitive", "Attacking"],
  gaming_experience:
    "6 years of consistent play with a high pressure, aggressive style.",
  gaming_strengths:
    "Attacking mindset, fast decisions, intelligent with strong game basics.",
  gaming_training: "Focused grind to become a stronger Minecraft player.",
  gaming_games: ["Minecraft", "Clash of Clans"],
  gaming_history:
    "Retired from Free Fire. Now fully focused on long-term mastery.",
  deliver_values: {
    ui_quality: "Clean and cinematic",
    mindset: "Attack, adapt, repeat",
    direction: "AI and ML",
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
    "Ship polished web pages with clean UX",
    "Train consistently to master Minecraft",
  ],
  principles_line: "Train with discipline, build with clarity, and keep raising the bar.",
  principles_items: [
    "Competitive mindset and zero fear of losing",
    "Premium visuals with clean structure",
    "Always improving and learning fast",
  ],
};

export async function fetchAboutContent(): Promise<AboutContent | null> {
  const { data, error } = await supabase
    .from("about_content")
    .select("content")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data?.content) return null;
  return data.content as AboutContent;
}

export async function upsertAboutContent(content: AboutContent) {
  return supabase
    .from("about_content")
    .upsert({ id: "default", content })
    .select()
    .single();
}
