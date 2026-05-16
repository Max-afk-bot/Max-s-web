"use client";

import React from "react";
import Card from "@/components/Card";

type ProjectItem = {
  name: string;
  status: string;
  tech: string;
  desc: string;
  progress: number;
  tags: string[];
  link?: string;
  preview?: string;
};

export default function ProjectListClient({
  projects,
  completed,
}: {
  projects: ProjectItem[];
  completed: any[];
}) {
  return (
    <>
      <div className="lg:col-span-2 space-y-4">
        {projects.map((p) => (
          <Card key={p.name} className="p-6 card-shine glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                </div>
                <p className="text-sm text-zinc-400 mt-2">{p.desc}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900/40 text-zinc-300">
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
                <div className="h-full rounded-full bg-emerald-400/70" style={{ width: `${p.progress}%` }} />
              </div>
              {p.link ? (
                <div className="mt-4">
                  <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
                    Open
                  </a>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Card className="p-6 border-zinc-800 bg-zinc-950/60">
          <h3 className="text-sm font-semibold">Next Experiments</h3>
          <div className="mt-3 text-sm text-zinc-300">&mdash;</div>
        </Card>

        <Card className="p-6 border-zinc-800 bg-zinc-950/60">
          <h3 className="text-sm font-semibold">Completed</h3>
          <div className="mt-3 space-y-2 text-sm text-zinc-300">
            {completed.map((p) => (
              <a key={p.name} href={p.link} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3 hover:bg-zinc-900/40 transition flex items-center justify-between">
                <span>{p.name}</span>
                <span className="text-xs text-zinc-500">Open</span>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
