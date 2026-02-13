"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import LazySection from "@/components/LazySection";
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

export default function DocumentationPage() {
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

  const sections = useMemo(
    () => (content.sections.length ? content.sections : defaultDocumentationContent.sections),
    [content.sections]
  );

  if (!siteSettings.nav.show_documentation) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Card className="p-6 text-sm text-zinc-400 border-zinc-800 bg-zinc-950/60">
          Documentation is currently hidden by admin settings.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pageIn">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 doc-hero">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {content.hero_kicker}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold mt-2">
          {content.hero_title}
        </h1>
        <p className="text-sm text-zinc-400 mt-3 max-w-3xl">
          {content.hero_subtitle}
        </p>
        <p className="text-xs text-zinc-500 mt-4">{content.updated_label}</p>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="chip chip-mini hover:bg-zinc-800/60 transition"
            >
              {item.title}
            </a>
          ))}
        </div>
      </Card>

      <LazySection minHeight={260}>
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} id={section.id} className="p-6 scroll-mt-28">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              {section.body
                .split("\n\n")
                .filter(Boolean)
                .map((paragraph, idx) => (
                  <p
                    key={`${section.id}-${idx}`}
                    className="text-sm text-zinc-300 mt-3"
                  >
                    {paragraph}
                  </p>
                ))}
            </Card>
          ))}
        </div>
      </LazySection>
    </div>
  );
}
