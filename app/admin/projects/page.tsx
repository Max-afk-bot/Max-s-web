"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import {
  defaultProjectsContent,
  fetchProjectsContent,
  upsertProjectsContent,
  type ProjectsContent,
  type ProjectItem,
  type CompletedProject,
} from "@/lib/projects";

const statusOptions = ["Pending", "Active", "Planning", "Paused"];

export default function AdminProjectsPage() {
  const [form, setForm] =
    useState<ProjectsContent>(defaultProjectsContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchProjectsContent().then((data) => {
      if (!mounted || !data) return;
      setForm({ ...defaultProjectsContent, ...data });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const updateProject = (index: number, patch: Partial<ProjectItem>) => {
    setForm((prev) => {
      const projects = [...prev.projects];
      const next = { ...projects[index], ...patch };
      projects[index] = next;
      return { ...prev, projects };
    });
  };

  const updateCompleted = (
    index: number,
    patch: Partial<CompletedProject>
  ) => {
    setForm((prev) => {
      const completed = [...prev.completed];
      const next = { ...completed[index], ...patch };
      completed[index] = next;
      return { ...prev, completed };
    });
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: "New Project",
          status: "Pending",
          tech: "",
          desc: "",
          progress: 0,
          tags: [],
        },
      ],
    }));
  };

  const removeProject = (index: number) => {
    setForm((prev) => {
      const projects = [...prev.projects];
      projects.splice(index, 1);
      const current_project =
        prev.current_project === prev.projects[index]?.name
          ? projects[0]?.name || ""
          : prev.current_project;
      return { ...prev, projects, current_project };
    });
  };

  const addCompleted = () => {
    setForm((prev) => ({
      ...prev,
      completed: [
        ...prev.completed,
        { name: "Finished Project", summary: "", link: "", tech: "", year: "" },
      ],
    }));
  };

  const removeCompleted = (index: number) => {
    setForm((prev) => {
      const completed = [...prev.completed];
      completed.splice(index, 1);
      return { ...prev, completed };
    });
  };

  const save = async () => {
    setStatus("saving");
    setError(null);
    const { error } = await upsertProjectsContent(form);
    if (error) {
      setStatus("error");
      setError(error.message || "Save failed.");
      return;
    }
    setStatus("saved");
  };

  const projectNames = useMemo(
    () => form.projects.map((p) => p.name).filter(Boolean),
    [form.projects]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Control which projects are active and shown publicly.
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
            <p className="text-xs text-zinc-500 mb-2">Paragraph</p>
            <textarea
              className="w-full min-h-[120px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              value={form.hero_paragraph}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hero_paragraph: e.target.value }))
              }
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Stats Cards</h3>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Total label</p>
            <Input
              value={form.stats_total_label}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, stats_total_label: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Total subtitle</p>
            <Input
              value={form.stats_total_subtitle}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  stats_total_subtitle: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Focus label</p>
              <Input
                value={form.stats_focus_label}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stats_focus_label: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Focus value</p>
              <Input
                value={form.stats_focus_value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stats_focus_value: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Focus subtitle</p>
            <Input
              value={form.stats_focus_subtitle}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  stats_focus_subtitle: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Gaming label</p>
              <Input
                value={form.stats_gaming_label}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stats_gaming_label: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Gaming value</p>
              <Input
                value={form.stats_gaming_value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stats_gaming_value: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Gaming subtitle</p>
            <Input
              value={form.stats_gaming_subtitle}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  stats_gaming_subtitle: e.target.value,
                }))
              }
            />
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold">Current Focus Project</h3>
        <select
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-zinc-700 select-input"
          value={form.current_project}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, current_project: e.target.value }))
          }
        >
          {projectNames.length === 0 ? (
            <option value="">No projects</option>
          ) : (
            projectNames.map((name) => (
              <option key={name} value={name} className="bg-zinc-900">
                {name}
              </option>
            ))
          )}
        </select>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Active Projects</h3>
        <Button variant="ghost" onClick={addProject}>
          Add project
        </Button>
      </div>

      <div className="space-y-4">
        {form.projects.map((p, idx) => (
          <Card key={`${p.name}-${idx}`} className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold">Project {idx + 1}</div>
              <Button variant="ghost" onClick={() => removeProject(idx)}>
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Name</p>
                <Input
                  value={p.name}
                  onChange={(e) => updateProject(idx, { name: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Status</p>
                <select
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-zinc-700 select-input"
                  value={p.status}
                  onChange={(e) =>
                    updateProject(idx, { status: e.target.value })
                  }
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s} className="bg-zinc-900">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Tech</p>
                <Input
                  value={p.tech}
                  onChange={(e) => updateProject(idx, { tech: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Progress (0-100)</p>
                <Input
                  type="number"
                  value={p.progress}
                  onChange={(e) =>
                    updateProject(idx, {
                      progress: Math.max(
                        0,
                        Math.min(100, Number(e.target.value || 0))
                      ),
                    })
                  }
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Description</p>
              <textarea
                className="w-full min-h-[100px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                value={p.desc}
                onChange={(e) => updateProject(idx, { desc: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">
                Tags (comma separated)
              </p>
              <Input
                value={p.tags.join(", ")}
                onChange={(e) =>
                  updateProject(idx, {
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Build Pipeline</h3>
          {[0, 1, 2].map((idx) => {
            const item = form.pipeline[idx] || { title: "", text: "" };
            return (
              <div key={`pipe-${idx}`} className="space-y-2">
                <p className="text-xs text-zinc-500">Stage {idx + 1}</p>
                <Input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) =>
                    setForm((prev) => {
                      const pipeline = [...prev.pipeline];
                      while (pipeline.length <= idx) pipeline.push({ title: "", text: "" });
                      pipeline[idx] = { ...pipeline[idx], title: e.target.value };
                      return { ...prev, pipeline };
                    })
                  }
                />
                <Input
                  placeholder="Description"
                  value={item.text}
                  onChange={(e) =>
                    setForm((prev) => {
                      const pipeline = [...prev.pipeline];
                      while (pipeline.length <= idx) pipeline.push({ title: "", text: "" });
                      pipeline[idx] = { ...pipeline[idx], text: e.target.value };
                      return { ...prev, pipeline };
                    })
                  }
                />
              </div>
            );
          })}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Next Experiments</h3>
          {[0, 1, 2].map((idx) => (
            <div key={`exp-${idx}`}>
              <p className="text-xs text-zinc-500 mb-2">Item {idx + 1}</p>
              <Input
                value={form.experiments[idx] || ""}
                onChange={(e) =>
                  setForm((prev) => {
                    const experiments = [...prev.experiments];
                    while (experiments.length <= idx) experiments.push("");
                    experiments[idx] = e.target.value;
                    return { ...prev, experiments };
                  })
                }
              />
            </div>
          ))}
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Completed Projects</h3>
        <Button variant="ghost" onClick={addCompleted}>
          Add completed
        </Button>
      </div>

      <div className="space-y-4">
        {form.completed.length === 0 ? (
          <Card className="p-6 text-sm text-zinc-400">
            No completed projects yet.
          </Card>
        ) : null}
        {form.completed.map((p, idx) => (
          <Card key={`${p.name}-${idx}`} className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold">Completed {idx + 1}</div>
              <Button variant="ghost" onClick={() => removeCompleted(idx)}>
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Name</p>
                <Input
                  value={p.name}
                  onChange={(e) =>
                    updateCompleted(idx, { name: e.target.value })
                  }
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Year</p>
                <Input
                  value={p.year}
                  onChange={(e) =>
                    updateCompleted(idx, { year: e.target.value })
                  }
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Tech</p>
                <Input
                  value={p.tech}
                  onChange={(e) =>
                    updateCompleted(idx, { tech: e.target.value })
                  }
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Live link</p>
                <Input
                  value={p.link}
                  onChange={(e) =>
                    updateCompleted(idx, { link: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Summary</p>
              <textarea
                className="w-full min-h-[100px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                value={p.summary}
                onChange={(e) =>
                  updateCompleted(idx, { summary: e.target.value })
                }
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <Button onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
