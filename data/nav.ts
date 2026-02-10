import {
  User,
  Gamepad2,
  Mail,
  FolderKanban,
  Settings,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Vibe = "fire" | "neon" | "cyber" | "none";

export type NavSection = {
  title: string;
  href: string;
  icon: LucideIcon | null;
  desc: string;
  vibe: Vibe;
  adminOnly?: boolean;
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: null,
    desc: "Home overview",
    vibe: "none",
  },
  {
    title: "About",
    href: "/about",
    icon: User,
    desc: "Who you are and what you do",
    vibe: "neon",
  },
  {
    title: "Gaming",
    href: "/gaming",
    icon: Gamepad2,
    desc: "Your games + highlights",
    vibe: "fire",
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
    desc: "Your builds and work",
    vibe: "neon",
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Mail,
    desc: "Ways to reach you",
    vibe: "cyber",
  },
  {
    title: "Admin",
    href: "/admin/about",
    icon: Shield,
    desc: "Content control",
    vibe: "neon",
    adminOnly: true,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    desc: "Theme, preferences, profile",
    vibe: "none",
  },
];
