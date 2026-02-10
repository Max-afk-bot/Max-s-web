import { supabase } from "@/lib/supabaseClient";

export type GamingMetrics = {
  defense: number;
  loss_rate: number;
  attack: number;
  strategies: number;
  mid_game_skill_use: number;
};

export type GamingContent = {
  hero_title: string;
  hero_intro: string;
  community_title: string;
  community_text: string;
  discord_url: string;
  require_discord_gate: boolean;
  gate_title: string;
  gate_text: string;
  team_gate_title: string;
  team_gate_text: string;
  weekly_note: string;
  focus_game: string;
  rank_label: string;
  primary_platform: string;
  years_experience: string;
  play_style_tags: string[];
  weapons: string[];
  skills_summary: string;
  training_focus: string;
  other_games_note: string;
  metrics: GamingMetrics;
  clip_title: string;
  clip_url: string;
  team_form_intro: string;
};

export const defaultGamingContent: GamingContent = {
  hero_title: "Gaming Command Center",
  hero_intro:
    "This page tracks gaming progression, match rhythm, and skill growth over time. Weekly updates shape this board as new data gets added.",
  community_title: "Join the Discord Community",
  community_text:
    "Community members get access to full gaming intel, weekly updates, and team activity sections.",
  discord_url: "https://discord.gg/RpgKb4FG",
  require_discord_gate: true,
  gate_title: "Full Gaming Intel Locked",
  gate_text:
    "Join Discord to unlock full details, advanced sections, and future team analytics.",
  team_gate_title: "Team-Only Tactical Analytics Locked",
  team_gate_text:
    "Performance Matrix and Skills Intel are visible only to approved team members.",
  weekly_note: "Weekly updates: stats and insights refresh every week.",
  focus_game: "Minecraft Bedrock",
  rank_label: "999+",
  primary_platform: "PC",
  years_experience: "6 years",
  play_style_tags: ["Competitive", "Aggressive", "Attack-first"],
  weapons: ["Sword"],
  skills_summary:
    "Strong in clutches, PvP battles, and Minecraft combat basics with sword control.",
  training_focus: "Current training focus: Mace mechanics and pressure fights.",
  other_games_note: "Other games: not yet.",
  metrics: {
    defense: 0,
    loss_rate: 0,
    attack: 0,
    strategies: 0,
    mid_game_skill_use: 0,
  },
  clip_title: "Featured Clip",
  clip_url: "",
  team_form_intro:
    "Want to join the team? Submit your request and join Discord community first.",
};

export async function fetchGamingContent(): Promise<GamingContent | null> {
  const { data, error } = await supabase
    .from("gaming_content")
    .select("content")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data?.content) return null;
  return data.content as GamingContent;
}

export async function upsertGamingContent(content: GamingContent) {
  return supabase
    .from("gaming_content")
    .upsert({ id: "default", content })
    .select()
    .single();
}
