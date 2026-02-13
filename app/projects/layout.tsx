import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deadweb.vercel.app";

export const metadata: Metadata = {
  title: "Projects",
  description: "Active builds, completed projects, and download packs.",
  alternates: {
    canonical: `${siteUrl}/projects`,
  },
  openGraph: {
    title: "Projects | Max Web Project",
    description: "Active builds, completed projects, and download packs.",
    url: `${siteUrl}/projects`,
  },
  twitter: {
    title: "Projects | Max Web Project",
    description: "Active builds, completed projects, and download packs.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
