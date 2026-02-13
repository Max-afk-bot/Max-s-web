import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deadweb.vercel.app";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Max, his programming path, gaming experience, and goals.",
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "About | Max Web Project",
    description:
      "Learn about Max, his programming path, gaming experience, and goals.",
    url: `${siteUrl}/about`,
  },
  twitter: {
    title: "About | Max Web Project",
    description:
      "Learn about Max, his programming path, gaming experience, and goals.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
