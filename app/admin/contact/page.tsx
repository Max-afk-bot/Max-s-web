"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import {
  defaultContactContent,
  fetchContactContent,
  upsertContactContent,
  type ContactContent,
  type ContactSocial,
  type ContactStat,
} from "@/lib/contactContent";

const iconOptions: ContactSocial["icon"][] = [
  "discord",
  "instagram",
  "youtube",
  "mail",
];

export default function AdminContactPage() {
  const [form, setForm] = useState<ContactContent>(defaultContactContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchContactContent().then((data) => {
      if (!mounted || !data) return;
      setForm({ ...defaultContactContent, ...data });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const updateStat = (index: number, patch: Partial<ContactStat>) => {
    setForm((prev) => {
      const next = [...prev.availability_stats];
      next[index] = { ...next[index], ...patch };
      return { ...prev, availability_stats: next };
    });
  };

  const updateSocial = (index: number, patch: Partial<ContactSocial>) => {
    setForm((prev) => {
      const next = [...prev.socials];
      next[index] = { ...next[index], ...patch };
      return { ...prev, socials: next };
    });
  };

  const addSocial = () => {
    setForm((prev) => ({
      ...prev,
      socials: [
        ...prev.socials,
        { label: "New", href: "https://", handle: "", icon: "discord" },
      ],
    }));
  };

  const removeSocial = (index: number) => {
    setForm((prev) => {
      const next = [...prev.socials];
      next.splice(index, 1);
      return { ...prev, socials: next };
    });
  };

  const addStat = () => {
    setForm((prev) => ({
      ...prev,
      availability_stats: [...prev.availability_stats, { label: "Label", value: "Value" }],
    }));
  };

  const removeStat = (index: number) => {
    setForm((prev) => {
      const next = [...prev.availability_stats];
      next.splice(index, 1);
      return { ...prev, availability_stats: next };
    });
  };

  const save = async () => {
    setStatus("saving");
    setError(null);
    const { error } = await upsertContactContent(form);
    if (error) {
      setStatus("error");
      setError(error.message || "Save failed.");
      return;
    }
    setStatus("saved");
  };

  const topicsCsv = useMemo(
    () => form.topics.join(", "),
    [form.topics]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Contact Page Content</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Update contact copy, topics, and social links.
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
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Form Copy</h3>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Form title</p>
            <Input
              value={form.form_title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, form_title: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Form subtitle</p>
            <Input
              value={form.form_subtitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, form_subtitle: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Form note</p>
            <Input
              value={form.form_note}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, form_note: e.target.value }))
              }
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Availability</h3>
            <Button variant="ghost" onClick={addStat}>
              Add stat
            </Button>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Title</p>
            <Input
              value={form.availability_title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, availability_title: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Text</p>
            <textarea
              className="w-full min-h-[80px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              value={form.availability_text}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, availability_text: e.target.value }))
              }
            />
          </div>
          {form.availability_stats.map((stat, idx) => (
            <div key={`stat-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Label</p>
                <Input
                  value={stat.label}
                  onChange={(e) => updateStat(idx, { label: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Value</p>
                <Input
                  value={stat.value}
                  onChange={(e) => updateStat(idx, { value: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Button variant="ghost" onClick={() => removeStat(idx)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Social Links</h3>
            <Button variant="ghost" onClick={addSocial}>
              Add
            </Button>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Section title</p>
            <Input
              value={form.socials_title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, socials_title: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Section subtitle</p>
            <Input
              value={form.socials_subtitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, socials_subtitle: e.target.value }))
              }
            />
          </div>
          {form.socials.map((social, idx) => (
            <div key={`social-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Label</p>
                <Input
                  value={social.label}
                  onChange={(e) => updateSocial(idx, { label: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Handle</p>
                <Input
                  value={social.handle}
                  onChange={(e) => updateSocial(idx, { handle: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">URL</p>
                <Input
                  value={social.href}
                  onChange={(e) => updateSocial(idx, { href: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Icon</p>
                <select
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-zinc-700"
                  value={social.icon}
                  onChange={(e) =>
                    updateSocial(idx, { icon: e.target.value as ContactSocial["icon"] })
                  }
                >
                  {iconOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-zinc-900">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Button variant="ghost" onClick={() => removeSocial(idx)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold">Topics</h3>
        <p className="text-xs text-zinc-500">
          Comma separated values used in the topic dropdown.
        </p>
        <Input
          value={topicsCsv}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              topics: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            }))
          }
        />
      </Card>
    </div>
  );
}
