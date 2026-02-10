export const DASHBOARD = {
  stats: [
    { title: "Projects", value: "03" },
    { title: "Skills", value: "Next.js" },
    { title: "Status", value: "Building" },
    { title: "Goal", value: "IIT + CSE" },
  ],
  quickLinks: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "Discord", href: "https://discord.com/" },
    { label: "Resume", href: "/profile" },
  ],
  intro: {
    title: "Intro",
    text:
      "I’m Max. Student, coder, gamer. Building a clean portfolio + dashboard with Next.js and Tailwind.",
    modeLabel: "Mode",
    modeValue: "Focus",
  },
  miniCards: [
    { label: "Today", value: "1% better" },
    { label: "Next", value: "Projects page" },
    { label: "Later", value: "Backend + DB" },
  ],
} as const;
