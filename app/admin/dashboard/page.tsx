"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import {
  defaultDashboardContent,
  fetchDashboardContent,
  upsertDashboardContent,
  type DashboardContent,
  type DashboardQuickLink,
  type DashboardMiniCard,
  type DashboardStat,
} from "@/lib/dashboardContent";

export default function AdminDashboardPage() {
  const [form, setForm] = useState<DashboardContent>(defaultDashboardContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchDashboardContent().then((data) => {
      if (!mounted || !data) return;
      setForm({ ...defaultDashboardContent, ...data });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const updateStat = (index: number, patch: Partial<DashboardStat>) => {
    setForm((prev) => {
      const next = [...prev.stats];
      next[index] = { ...next[index], ...patch };
      return { ...prev, stats: next };
    });
  };

  const updateQuickLink = (index: number, patch: Partial<DashboardQuickLink>) => {
    setForm((prev) => {
      const next = [...prev.quick_links];
      next[index] = { ...next[index], ...patch };
      return { ...prev, quick_links: next };
    });
  };

  const updateMiniCard = (index: number, patch: Partial<DashboardMiniCard>) => {
    setForm((prev) => {
      const next = [...prev.mini_cards];
      next[index] = { ...next[index], ...patch };
      return { ...prev, mini_cards: next };
    });
  };

  const addQuickLink = () => {
    setForm((prev) => ({
      ...prev,
      quick_links: [
        ...prev.quick_links,
        { label: "New Link", href: "https://example.com" },
      ],
    }));
  };

  const removeQuickLink = (index: number) => {
    setForm((prev) => {
      const next = [...prev.quick_links];
      next.splice(index, 1);
      return { ...prev, quick_links: next };
    });
  };

  const addMiniCard = () => {
    setForm((prev) => ({
      ...prev,
      mini_cards: [...prev.mini_cards, { label: "New", value: "Value" }],
    }));
  };

  const removeMiniCard = (index: number) => {
    setForm((prev) => {
      const next = [...prev.mini_cards];
      next.splice(index, 1);
      return { ...prev, mini_cards: next };
    });
  };

  const save = async () => {
    setStatus("saving");
    setError(null);
    const { error } = await upsertDashboardContent(form);
    if (error) {
      setStatus("error");
      setError(error.message || "Save failed.");
      return;
    }
    setStatus("saved");
  };

  const stats = useMemo(
    () => [...form.stats, ...defaultDashboardContent.stats].slice(0, 4),
    [form.stats]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Dashboard Content</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Control dashboard hero, stats, quick links, and intro cards.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <p className="text-xs text-zinc-500 mt-2">
              Use {"{name}"} to insert the user name.
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Subtitle</p>
            <textarea
              className="w-full min-h-[120px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              value={form.hero_subtitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hero_subtitle: e.target.value }))
              }
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Stats Cards</h3>
          {stats.map((stat, idx) => (
            <div key={`stat-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Title</p>
                <Input
                  value={stat.title}
                  onChange={(e) => updateStat(idx, { title: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Value (optional)</p>
                <Input
                  value={stat.value || ""}
                  onChange={(e) => updateStat(idx, { value: e.target.value })}
                />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold">Intro Block</h3>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Title</p>
          <Input
            value={form.intro.title}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                intro: { ...prev.intro, title: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Text</p>
          <textarea
            className="w-full min-h-[120px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
            value={form.intro.text}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                intro: { ...prev.intro, text: e.target.value },
              }))
            }
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-2">Mode label</p>
            <Input
              value={form.intro.modeLabel}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, modeLabel: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Mode value</p>
            <Input
              value={form.intro.modeValue}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, modeValue: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold">Mini Cards</h3>
            <Button variant="ghost" onClick={addMiniCard}>
              Add
            </Button>
          </div>
          {form.mini_cards.map((item, idx) => (
            <div key={`mini-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Label</p>
                <Input
                  value={item.label}
                  onChange={(e) => updateMiniCard(idx, { label: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Value</p>
                <Input
                  value={item.value}
                  onChange={(e) => updateMiniCard(idx, { value: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Button variant="ghost" onClick={() => removeMiniCard(idx)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <Button variant="ghost" onClick={addQuickLink}>
              Add
            </Button>
          </div>
          {form.quick_links.map((item, idx) => (
            <div key={`quick-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Label</p>
                <Input
                  value={item.label}
                  onChange={(e) => updateQuickLink(idx, { label: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">URL</p>
                <Input
                  value={item.href}
                  onChange={(e) => updateQuickLink(idx, { href: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Button variant="ghost" onClick={() => removeQuickLink(idx)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold">Sections Header</h3>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Title</p>
          <Input
            value={form.sections_title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, sections_title: e.target.value }))
            }
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Subtitle</p>
          <Input
            value={form.sections_subtitle}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, sections_subtitle: e.target.value }))
            }
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Version label</p>
          <Input
            value={form.version_label}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, version_label: e.target.value }))
            }
          />
        </div>
      </Card>
    </div>
  );
}
