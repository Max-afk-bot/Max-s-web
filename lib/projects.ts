import { supabase } from "@/lib/supabaseClient";

export type ProjectItem = {
  name: string;
  status: string;
  tech: string;
  desc: string;
  progress: number;
  tags: string[];
  link?: string;
  preview?: string;
};

export type CompletedProject = {
  name: string;
  summary: string;
  link: string;
  tech: string;
  year: string;
  downloads?: number;
  preview?: string;
};

export type ProjectTimelineItem = {
  title: string;
  date: string;
  detail: string;
};

export type ProjectGalleryItem = {
  title: string;
  image: string;
  link: string;
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
  timeline: ProjectTimelineItem[];
  milestones: string[];
  gallery: ProjectGalleryItem[];
};

export const defaultProjectsContent: ProjectsContent = {
  hero_title: "Projects in motion with clean UI and gaming energy.",
  hero_paragraph:
    "This space tracks active builds, long‑term experiments, and learning packs. Every project is built to feel premium, fast, and clear.",
  stats_total_label: "Total Projects",
  stats_total_subtitle: "Across web and gaming.",
  stats_focus_label: "Main Focus",
  stats_focus_value: "Dashboard + Python packs",
  stats_focus_subtitle: "UI polish + learning depth.",
  stats_gaming_label: "Gaming Edge",
  stats_gaming_value: "Unity horror game",
  stats_gaming_subtitle: "Long‑term Android build.",
  projects: [
    {
      name: "Dashboard Website",
      status: "Pending",
      tech: "Next.js + Tailwind",
      desc: "Premium UI, onboarding flow, admin content control, and scalable layout.",
      progress: 30,
      tags: ["UI", "Frontend", "Supabase"],
    },
    {
      name: "Minecraft Commands (PWA)",
      status: "Active",
      tech: "React + Vite",
      desc: "Embedded PWA app for Minecraft Bedrock command references and utilities.",
      progress: 95,
      tags: ["PWA", "Mobile", "Utilities"],
      link: "/projects/minecraft-commands",
      preview: "/minecraft-commands-app/assets/manifest-CXqajOKZ.json",
    },
    {
      name: "Horror Game (Unity)",
      status: "Pending",
      tech: "Unity (Android) + C#",
      desc: "Started Jan 1, 2016. Android build in Unity with no release date yet.",
      progress: 12,
      tags: ["Game", "Unity", "Prototype"],
    },
  ],
  completed: [
    {
      name: "Python50 (Beginner Pack)",
      summary: "50 beginner Python projects covering fundamentals and logic building.",
      link: "https://github.com/user-attachments/files/25281435/python50.zip",
      tech: "Python",
      year: "2026",
      downloads: 0,
      preview:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop",
    },
    {
      name: "Python50 Medium Pack",
      summary: "50 medium‑level Python projects to level up real problem solving.",
      link: "https://github.com/user-attachments/files/25281436/python50medium.zip",
      tech: "Python",
      year: "2026",
      downloads: 0,
      preview:
        "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=1200&auto=format&fit=crop",
    },
    {
      name: "Python Intermediate Pack",
      summary: "100 intermediate Python projects for consistent skill growth.",
      link: "https://github.com/user-attachments/files/25281440/pythonintermediate.zip",
      tech: "Python",
      year: "2026",
      downloads: 0,
      preview:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&auto=format&fit=crop",
    },
    {
      name: "Minecraft Commands PE",
      summary: "Ultimate Bedrock Command Reference and utility app for Minecraft players. Built with React + Vite.",
      link: "/projects/minecraft-commands",
      tech: "React + Vite + Tailwind",
      year: "2026",
      downloads: 0,
      preview:
        "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=1200&auto=format&fit=crop",
    },
  ],
  current_project: "Dashboard Website",
  pipeline: [
    {
      title: "Design and Layout",
      text: "Crafting the visual system, motion language, and responsive layout.",
    },
    {
      title: "Build Core Features",
      text: "Auth, onboarding, settings, admin tools, and data wiring.",
    },
    {
      title: "Launch and Iterate",
      text: "Ship fast, then improve with real feedback and data.",
    },
  ],
  experiments: [
    "AI‑powered summaries for profile pages",
    "Performance passes for mobile motion",
    "Gameplay tracker dashboard concepts",
  ],
  timeline: [
    {
      title: "Started core layout",
      date: "Feb 2026",
      detail: "Built navigation, dashboard shell, and premium motion baseline.",
    },
    {
      title: "Auth + onboarding",
      date: "Feb 2026",
      detail: "Google login, onboarding steps, and profile persistence.",
    },
    {
      title: "Admin control",
      date: "Feb 2026",
      detail: "Admin pages to update content without redeploying.",
    },
  ],
  milestones: [
    "Launch public portfolio",
    "Ship gaming weekly tracker",
    "Add content management for every page",
    "Performance tune for mobile",
  ],
  gallery: [
    {
      title: "Dashboard UI",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop",
      link: "/",
    },
    {
      title: "Gaming Intel",
      image: "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=1200&auto=format&fit=crop",
      link: "/gaming",
    },
    {
      title: "Project Lab",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop",
      link: "/projects",
    },
  ],
};

export async function fetchProjectsContent(
  id: string = "default"
): Promise<ProjectsContent | null> {
  const { data, error } = await supabase
    .from("projects_content")
    .select("content")
    .eq("id", id)
    .maybeSingle();
  if (error || !data?.content) return null;
  return data.content as ProjectsContent;
}

export async function upsertProjectsContent(
  content: ProjectsContent,
  id: string = "default"
) {
  return supabase
    .from("projects_content")
    .upsert({ id, content })
    .select()
    .single();
}
