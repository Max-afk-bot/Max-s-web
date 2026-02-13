"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import {
  defaultDocumentationContent,
  fetchDocumentationContent,
  upsertDocumentationContent,
  type DocumentationContent,
  type DocumentationSection,
  type DocumentationLink,
} from "@/lib/documentationContent";

export default function AdminDocumentationPage() {
  const [form, setForm] = useState<DocumentationContent>(
    defaultDocumentationContent
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchDocumentationContent().then((data) => {
      if (!mounted || !data) return;
      setForm({ ...defaultDocumentationContent, ...data });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const updateSection = (
    index: number,
    patch: Partial<DocumentationSection>
  ) => {
    setForm((prev) => {
      const next = [...prev.sections];
      next[index] = { ...next[index], ...patch };
      return { ...prev, sections: next };
    });
  };

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: `section-${prev.sections.length + 1}`, title: "New Section", body: "" },
      ],
    }));
  };

  const removeSection = (index: number) => {
    setForm((prev) => {
      const next = [...prev.sections];
      next.splice(index, 1);
      return { ...prev, sections: next };
    });
  };

  const updateFooterLink = (
    index: number,
    patch: Partial<DocumentationLink>
  ) => {
    setForm((prev) => {
      const next = [...prev.footer_links];
      next[index] = { ...next[index], ...patch };
      return { ...prev, footer_links: next };
    });
  };

  const addFooterLink = () => {
    setForm((prev) => ({
      ...prev,
      footer_links: [
        ...prev.footer_links,
        { label: "New Link", href: "/documentation" },
      ],
    }));
  };

  const removeFooterLink = (index: number) => {
    setForm((prev) => {
      const next = [...prev.footer_links];
      next.splice(index, 1);
      return { ...prev, footer_links: next };
    });
  };

  const save = async () => {
    setStatus("saving");
    setError(null);
    const { error } = await upsertDocumentationContent(form);
    if (error) {
      setStatus("error");
      setError(error.message || "Save failed.");
      return;
    }
    setStatus("saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Documentation</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Update legal docs and footer links.
          </p>
        </div>
        <Button onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save changes"}
        </Button>
      </div>

      {status === "saved" ? (
        <p className="text-xs text-emerald-400">Saved successfully.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : null}

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold">Hero</h3>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Kicker</p>
          <Input
            value={form.hero_kicker}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, hero_kicker: e.target.value }))
            }
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Title</p>
          <Input
            value={form.hero_title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, hero_title: e.target.value }))
            }
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Subtitle</p>
          <textarea
            className="w-full min-h-[100px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
            value={form.hero_subtitle}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, hero_subtitle: e.target.value }))
            }
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Updated label</p>
          <Input
            value={form.updated_label}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, updated_label: e.target.value }))
            }
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Sections</h3>
          <Button variant="ghost" onClick={addSection}>
            Add section
          </Button>
        </div>
        {form.sections.map((section, idx) => (
          <div key={`section-${idx}`} className="space-y-3 rounded-xl border border-zinc-800 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Section ID</p>
                <Input
                  value={section.id}
                  onChange={(e) => updateSection(idx, { id: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Title</p>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(idx, { title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Body (use blank lines for paragraphs)</p>
              <textarea
                className="w-full min-h-[140px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                value={section.body}
                onChange={(e) => updateSection(idx, { body: e.target.value })}
              />
            </div>
            <Button variant="ghost" onClick={() => removeSection(idx)}>
              Remove section
            </Button>
          </div>
        ))}
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Footer Links</h3>
          <Button variant="ghost" onClick={addFooterLink}>
            Add link
          </Button>
        </div>
        {form.footer_links.map((link, idx) => (
          <div key={`footer-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Label</p>
              <Input
                value={link.label}
                onChange={(e) => updateFooterLink(idx, { label: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Href</p>
              <Input
                value={link.href}
                onChange={(e) => updateFooterLink(idx, { href: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button variant="ghost" onClick={() => removeFooterLink(idx)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
