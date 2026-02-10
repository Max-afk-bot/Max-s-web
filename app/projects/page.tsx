"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import { FolderKanban, Sparkles, Rocket, Hammer, Shield } from "lucide-react";
import {
  defaultProjectsContent,
  fetchProjectsContent,
  type ProjectsContent,
} from "@/lib/projects";

const pipelineIcons = [Sparkles, Hammer, Rocket];

const statusStyle = (status: string) => {
  if (status === "Active") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "Pending") {
    return "border-cyan-500/40 bg-cyan-500/10 text-cyan-300";
  }
  if (status === "Planning") {
    return "border-cyan-500/40 bg-cyan-500/10 text-cyan-300";
  }
  if (status === "Paused") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  }
  return "border-zinc-700 bg-zinc-900/40 text-zinc-300";
};

export default function ProjectsPage() {
  const [content, setContent] =
    useState<ProjectsContent>(defaultProjectsContent);

  useEffect(() => {
    let mounted = true;
    fetchProjectsContent().then((data) => {
      if (!mounted || !data) return;
      setContent({ ...defaultProjectsContent, ...data });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const totalActive = content.projects.length;
  const totalCompleted = content.completed.length;
  const totalProjects = totalActive + totalCompleted;
  const currentProject = useMemo(() => {
    const hit = content.projects.find(
      (p) => p.name === content.current_project
    );
    return hit ?? content.projects[0];
  }, [content]);

  const focusValue = content.stats_focus_value || currentProject?.name || "—";
  const focusSubtitle = content.stats_focus_subtitle || currentProject?.tech || "";

  return (
    <div className="relative space-y-8 overflow-hidden animate-pageIn projects-stage">
      <div className="projects-glow" aria-hidden="true" />
      <div className="projects-grid" aria-hidden="true" />
      <div className="projects-beam" aria-hidden="true" />
      <div className="projects-particles" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 p-7 projects-hero">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-zinc-300 border border-zinc-800 rounded-full px-3 py-1 bg-zinc-900/30">
              <FolderKanban size={14} />
              PROJECT LAB
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold mt-4 tracking-tight">
              {content.hero_title}
            </h1>
            <p className="text-sm text-zinc-400 mt-3 max-w-2xl">
              {content.hero_paragraph}
            </p>
          </div>

          <div className="hidden md:grid gap-3 text-xs text-zinc-400">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
              Active
              <div className="text-sm text-zinc-200 mt-1">1 project</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
              Pipeline
              <div className="text-sm text-zinc-200 mt-1">3 stages</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
        <Card className="p-5 card-shine glow vibe-neon">
          <div className="text-xs text-zinc-500">{content.stats_total_label}</div>
          <div className="text-2xl font-semibold mt-2">
            {String(totalProjects).padStart(2, "0")}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {content.stats_total_subtitle}
          </p>
        </Card>
        <Card className="p-5 card-shine glow vibe-cyber">
          <div className="text-xs text-zinc-500">{content.stats_focus_label}</div>
          <div className="text-lg font-semibold mt-2">{focusValue}</div>
          <p className="text-xs text-zinc-500 mt-2">{focusSubtitle}</p>
        </Card>
        <Card className="p-5 card-shine glow vibe-fire">
          <div className="text-xs text-zinc-500">{content.stats_gaming_label}</div>
          <div className="text-lg font-semibold mt-2">
            {content.stats_gaming_value}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {content.stats_gaming_subtitle}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 card-shine glow vibe-cyber">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                Completed
              </div>
              <h2 className="text-lg font-semibold mt-2">
                Finished Projects and Live Links
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                This section showcases completed work with direct access links.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <span className="chip chip-mini">{totalCompleted} completed</span>
              <span className="chip chip-mini">Live access</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {content.completed.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-sm text-zinc-400">
                No completed projects added yet. Add your finished builds and links
                to make this section live.
              </div>
            ) : (
              content.completed.map((p) => (
                <div
                  key={p.name}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-zinc-500 mt-1">{p.summary}</div>
                    </div>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-zinc-200 hover:text-white underline"
                    >
                      Open
                    </a>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span className="chip chip-mini">{p.tech}</span>
                    <span className="chip chip-mini">{p.year}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 border-zinc-800 bg-zinc-950/60">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">
            Project Links
          </div>
          <h3 className="text-sm font-semibold mt-2">Quick Access</h3>
          <p className="text-xs text-zinc-500 mt-2">
            Add direct URLs for finished work and demos.
          </p>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            {content.completed.length === 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3 text-zinc-400">
                No live links yet.
              </div>
            ) : (
              content.completed.map((p) => (
                <a
                  key={`${p.name}-link`}
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3 hover:bg-zinc-900/40 transition flex items-center justify-between"
                >
                  <span>{p.name}</span>
                  <span className="text-xs text-zinc-500">Open</span>
                </a>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {content.projects.map((p) => (
            <Card key={p.name} className="p-6 card-shine glow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-zinc-400 mt-2">{p.desc}</p>
                </div>
                <span
                  className={[
                    "text-xs px-3 py-1 rounded-full border",
                    statusStyle(p.status),
                  ].join(" ")}
                >
                  {p.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span key={tag} className="chip chip-mini">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{p.tech}</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400/70"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="p-6 border-zinc-800 bg-zinc-950/60">
            <div className="flex items-center gap-2">
              <Shield size={16} className="opacity-80" />
              <h3 className="text-sm font-semibold">Build Pipeline</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {content.pipeline.map((item, idx) => {
                const Icon = pipelineIcons[idx] || Sparkles;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl border border-zinc-800 bg-zinc-900/40 grid place-items-center">
                        <Icon size={14} className="opacity-80" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-zinc-500">{item.text}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-950/60">
            <h3 className="text-sm font-semibold">Next Experiments</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {content.experiments.map((item, idx) => (
                <li
                  key={`exp-${idx}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
