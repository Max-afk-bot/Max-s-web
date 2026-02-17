import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deadweb.vercel.app";

export const metadata: Metadata = {
  title: "YouTube",
  description: "Official YouTube channel page with updates and focus areas.",
  alternates: {
    canonical: `${siteUrl}/youtube`,
  },
  openGraph: {
    title: "YouTube | Max Web Project",
    description: "Official YouTube channel page with updates and focus areas.",
    url: `${siteUrl}/youtube`,
  },
  twitter: {
    title: "YouTube | Max Web Project",
    description: "Official YouTube channel page with updates and focus areas.",
  },
};

export default function YoutubeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
