import "./globals.css";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deadweb.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Max Web Project",
    template: "%s | Max Web Project",
  },
  description:
    "A premium gaming and creator dashboard with onboarding, projects, and community features.",
  openGraph: {
    title: "Max Web Project",
    description:
      "A premium gaming and creator dashboard with onboarding, projects, and community features.",
    url: siteUrl,
    siteName: "Max Web Project",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Max Web Project",
    description:
      "A premium gaming and creator dashboard with onboarding, projects, and community features.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-zinc-100 bg-zinc-950">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
