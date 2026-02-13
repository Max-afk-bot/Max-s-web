import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deadweb.vercel.app";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a message or reach Max on social platforms.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Contact | Max Web Project",
    description: "Send a message or reach Max on social platforms.",
    url: `${siteUrl}/contact`,
  },
  twitter: {
    title: "Contact | Max Web Project",
    description: "Send a message or reach Max on social platforms.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
