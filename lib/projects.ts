import { supabase } from "@/lib/supabaseClient";

export type ProjectItem = {
  name: string;
  status: string;
  tech: string;
  desc: string;
  progress: number;
  tags: string[];
};

export type CompletedProject = {
  name: string;
  summary: string;
  link: string;
  tech: string;
  year: string;
};

export type ProjectsContent = {
  hero_title: string;
  hero_paragraph: string;
  stats_total_label: string;
  stats_total_subtitle: string;
  stats_focus_label: string;
  stats_focus_value: string;
  stats_focus_subtitle: string;
  stats_gaming_label: string;
  stats_gaming_value: string;
  stats_gaming_subtitle: string;
  projects: ProjectItem[];
  completed: CompletedProject[];
  current_project: string;
  pipeline: { title: string; text: string }[];
  experiments: string[];
};

export const defaultProjectsContent: ProjectsContent = {
  hero_title: "Projects in motion, focused on clean UI and gaming energy.",
  hero_paragraph:
    "This section tracks active builds, upcoming ideas, and long-term experiments. Each project is designed to feel premium and fast.",
  stats_total_label: "Total Projects",
  stats_total_subtitle: "Across web and gaming.",
  stats_focus_label: "Main Focus",
  stats_focus_value: "",
  stats_focus_subtitle: "",
  stats_gaming_label: "Gaming Edge",
  stats_gaming_value: "Minecraft mastery",
  stats_gaming_subtitle: "Training + skill build.",
  projects: [
    {
      name: "Dashboard Website",
      status: "Pending",
      tech: "Next.js + Tailwind",
      desc: "Premium UI, onboarding flow, and scalable layout system.",
      progress: 25,
      tags: ["UI", "Frontend", "Supabase"],
    },
    {
      name: "Horror Game (Unity)",
      status: "Pending",
      tech: "Unity (Android) + C#",
      desc: "Started Jan 1, 2016. Android build in Unity with no release date yet.",
      progress: 10,
      tags: ["Game", "Unity", "Prototype"],
    },
  ],
  completed: [],
  current_project: "Dashboard Website",
  pipeline: [
    {
      title: "Design and Layout",
      text: "Crafting the visual system and responsive structure.",
    },
    {
      title: "Build Core Features",
      text: "Auth, onboarding, settings, and dashboard logic.",
    },
    {
      title: "Launch and Iterate",
      text: "Ship fast and improve based on real usage.",
    },
  ],
  experiments: [
    "AI powered summaries for profile pages",
    "Performance pass for mobile animations",
    "Gameplay tracker dashboard",
  ],
};

export async function fetchProjectsContent(): Promise<ProjectsContent | null> {
  const { data, error } = await supabase
    .from("projects_content")
    .select("content")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data?.content) return null;
  return data.content as ProjectsContent;
}

export async function upsertProjectsContent(content: ProjectsContent) {
  return supabase
    .from("projects_content")
    .upsert({ id: "default", content })
    .select()
    .single();
}
