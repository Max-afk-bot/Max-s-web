"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  defaultDocumentationContent,
  fetchDocumentationContent,
  type DocumentationContent,
} from "@/lib/documentationContent";
import {
  defaultSiteSettings,
  fetchSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const [content, setContent] = useState<DocumentationContent>(
    defaultDocumentationContent
  );
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    let mounted = true;
    fetchDocumentationContent().then((data) => {
      if (!mounted || !data) return;
      setContent({ ...defaultDocumentationContent, ...data });
    });
    fetchSiteSettings().then((settings) => {
      if (!mounted) return;
      setSiteSettings(settings);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const links = content.footer_links.length
    ? content.footer_links
    : defaultDocumentationContent.footer_links;
  const showDocs = siteSettings.footer.show_docs;

  return (
    <footer className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 sm:p-6 legal-footer">
      {showDocs ? (
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-400 hover:text-zinc-100 transition underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-center text-xs text-zinc-500">
        © 2024-{year}, Max Web Project. All rights reserved.
      </p>
    </footer>
  );
}
