"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import {
  defaultAboutContent,
  fetchAboutContent,
  upsertAboutContent,
  type AboutContent,
} from "@/lib/about";

const textareaClass =
  "w-full min-h-[120px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700";

export default function AdminAboutPage() {
  const [form, setForm] = useState<AboutContent>(defaultAboutContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"draft" | "published">("published");
  const [draftAvailable, setDraftAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchAboutContent().then((data) => {
      if (!mounted || !data) return;
      setForm({ ...defaultAboutContent, ...data });
    });
    fetchAboutContent("draft").then((data) => {
      if (!mounted) return;
      setDraftAvailable(Boolean(data));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const update = (key: keyof AboutContent, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateArrayItem = (
    key: "programming_items" | "current_focus" | "principles_items" | "journey_items",
    index: number,
    value: string
  ) => {
    setForm((prev) => {
      const items = [...prev[key]];
      while (items.length <= index) items.push("");
      items[index] = value;
      return { ...prev, [key]: items };
    });
  };

  const updateCsv = (
    key: "gaming_chips" | "gaming_games" | "skill_stack",
    value: string
  ) => {
    const items = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, [key]: items }));
  };

  const updateDeliver = (
    key: keyof AboutContent["deliver_values"],
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      deliver_values: { ...prev.deliver_values, [key]: value },
    }));
  };

  const save = async (target: "draft" | "published") => {
    setStatus("saving");
    setError(null);
    const { error } = await upsertAboutContent(
      form,
      target === "draft" ? "draft" : "default"
    );
    if (error) {
      setStatus("error");
      setError(error.message || "Save failed.");
      return;
    }
    if (target === "draft") setDraftAvailable(true);
    setMode(target === "draft" ? "draft" : "published");
    setStatus("saved");
  };

  const loadDraft = async () => {
    const data = await fetchAboutContent("draft");
    if (data) {
      setForm({ ...defaultAboutContent, ...data });
      setMode("draft");
    }
  };

  const loadPublished = async () => {
    const data = await fetchAboutContent("default");
    if (data) {
      setForm({ ...defaultAboutContent, ...data });
      setMode("published");
    }
  };

  const programmingItems = useMemo(
    () => [...form.programming_items, "", "", ""].slice(0, 3),
    [form.programming_items]
  );
  const journeyItems = useMemo(
    () => [...form.journey_items, "", "", ""].slice(0, 3),
    [form.journey_items]
  );
  const focusItems = useMemo(
    () => [...form.current_focus, "", "", ""].slice(0, 3),
    [form.current_focus]
  );
  const principleItems = useMemo(
    () => [...form.principles_items, "", "", ""].slice(0, 3),
    [form.principles_items]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">About Page Content</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Edit text blocks and chips. Save draft or publish live.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={loadPublished}>
            Load Live
          </Button>
          <Button variant="ghost" onClick={loadDraft} disabled={!draftAvailable}>
            Load Draft
          </Button>
          <Button onClick={() => save("draft")} disabled={status === "saving"}>
            Save Draft
          </Button>
          <Button onClick={() => save("published")} disabled={status === "saving"}>
            Publish Live
          </Button>
        </div>
      </div>

      {status === "saved" ? (
        <p className="text-xs text-emerald-400">
          {mode === "draft" ? "Draft saved." : "Published successfully."}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : null}
      <p className="text-xs text-zinc-500">
        Editing: <span className="text-zinc-300">{mode}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Hero</h3>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Title</p>
            <Input
              value={form.hero_title}
              onChange={(e) => update("hero_title", e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Paragraph</p>
            <textarea
              className={textareaClass}
              value={form.hero_paragraph}
              onChange={(e) => update("hero_paragraph", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Focus value</p>
              <Input
                value={form.focus_value}
                onChange={(e) => update("focus_value", e.target.value)}
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Direction value</p>
              <Input
                value={form.direction_value}
                onChange={(e) => update("direction_value", e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Programming Experience</h3>
          {programmingItems.map((item, idx) => (
            <div key={`prog-item-${idx}`}>
              <p className="text-xs text-zinc-500 mb-2">Item {idx + 1}</p>
              <Input
                value={item}
                onChange={(e) =>
                  updateArrayItem("programming_items", idx, e.target.value)
                }
              />
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Learning Journey</h3>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Title</p>
            <Input
              value={form.journey_title}
              onChange={(e) => update("journey_title", e.target.value)}
            />
          </div>
          {journeyItems.map((item, idx) => (
            <div key={`journey-item-${idx}`}>
              <p className="text-xs text-zinc-500 mb-2">Item {idx + 1}</p>
              <Input
                value={item}
                onChange={(e) =>
                  updateArrayItem("journey_items", idx, e.target.value)
                }
              />
            </div>
          ))}
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Gaming Experience</h3>
          <span className="text-xs text-zinc-500">Primary section</span>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Tagline</p>
          <Input
            value={form.gaming_tagline}
            onChange={(e) => update("gaming_tagline", e.target.value)}
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Chips (comma separated)</p>
          <Input
            value={form.gaming_chips.join(", ")}
            onChange={(e) => updateCsv("gaming_chips", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-2">Experience</p>
            <textarea
              className={textareaClass}
              value={form.gaming_experience}
              onChange={(e) => update("gaming_experience", e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Strengths</p>
            <textarea
              className={textareaClass}
              value={form.gaming_strengths}
              onChange={(e) => update("gaming_strengths", e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Training</p>
            <textarea
              className={textareaClass}
              value={form.gaming_training}
              onChange={(e) => update("gaming_training", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-2">
              Primary games (comma separated)
            </p>
            <Input
              value={form.gaming_games.join(", ")}
              onChange={(e) => updateCsv("gaming_games", e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">History</p>
            <textarea
              className={textareaClass}
              value={form.gaming_history}
              onChange={(e) => update("gaming_history", e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">What I Deliver</h3>
          <div>
            <p className="text-xs text-zinc-500 mb-2">UI Quality</p>
            <Input
              value={form.deliver_values.ui_quality}
              onChange={(e) => updateDeliver("ui_quality", e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Mindset</p>
            <Input
              value={form.deliver_values.mindset}
              onChange={(e) => updateDeliver("mindset", e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Direction</p>
            <Input
              value={form.deliver_values.direction}
              onChange={(e) => updateDeliver("direction", e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Experience</p>
            <Input
              value={form.deliver_values.experience}
              onChange={(e) => updateDeliver("experience", e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Skill Stack</h3>
          <p className="text-xs text-zinc-500">Comma separated values.</p>
          <Input
            value={form.skill_stack.join(", ")}
            onChange={(e) => updateCsv("skill_stack", e.target.value)}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Current Focus</h3>
          {focusItems.map((item, idx) => (
            <div key={`focus-item-${idx}`}>
              <p className="text-xs text-zinc-500 mb-2">Item {idx + 1}</p>
              <Input
                value={item}
                onChange={(e) =>
                  updateArrayItem("current_focus", idx, e.target.value)
                }
              />
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Principles</h3>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Line</p>
            <Input
              value={form.principles_line}
              onChange={(e) => update("principles_line", e.target.value)}
            />
          </div>
          {principleItems.map((item, idx) => (
            <div key={`principle-item-${idx}`}>
              <p className="text-xs text-zinc-500 mb-2">Item {idx + 1}</p>
              <Input
                value={item}
                onChange={(e) =>
                  updateArrayItem("principles_items", idx, e.target.value)
                }
              />
            </div>
          ))}
        </Card>
      </div>

    </div>
  );
}
