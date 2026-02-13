"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import LazySection from "@/components/LazySection";
import {
  Code2,
  Gamepad2,
  Sparkles,
  Target,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import {
  defaultAboutContent,
  fetchAboutContent,
  type AboutContent,
} from "@/lib/about";
import {
  defaultSiteSettings,
  fetchSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>(defaultAboutContent);
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    let mounted = true;
    fetchAboutContent().then((data) => {
      if (!mounted || !data) return;
      setContent({ ...defaultAboutContent, ...data });
    });
    fetchSiteSettings().then((settings) => {
      if (!mounted) return;
      setSiteSettings(settings);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative space-y-8 overflow-hidden animate-pageIn about-stage">
      <div className="about-aurora" aria-hidden="true" />
      <div className="about-glow" aria-hidden="true" />
      <div className="about-rings" aria-hidden="true" />
      <div className="about-grid" aria-hidden="true" />
      <div className="about-orbits" aria-hidden="true" />
      <div className="about-particles" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 p-7 about-hero">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-zinc-300 border border-zinc-800 rounded-full px-3 py-1 bg-zinc-900/30">
              <Sparkles size={14} />
              ABOUT PROFILE
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
              Focus
              <div className="text-sm text-zinc-200 mt-1">
                {content.focus_value}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
              Direction
              <div className="text-sm text-zinc-200 mt-1">
                {content.direction_value}
              </div>
            </div>
          </div>
        </div>
      </div>

      {(siteSettings.about.show_programming ||
        siteSettings.about.show_gaming) && (
        <LazySection minHeight={240}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger">
          <div className="space-y-6 lg:col-span-1">
            {siteSettings.about.show_programming ? (
              <Card className="p-6 card-shine glow vibe-neon">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl border border-zinc-800 bg-zinc-900/30 grid place-items-center">
                    <Code2 size={18} className="opacity-80" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      Programming Experience
                    </div>
                    <div className="text-xs text-zinc-500">Intermediate level</div>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  {content.programming_items.map((item, idx) => (
                    <li
                      key={`prog-${idx}`}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {siteSettings.about.show_programming ? (
              <Card className="p-6 card-shine glow vibe-fire">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl border border-zinc-800 bg-zinc-900/30 grid place-items-center">
                    <Target size={18} className="opacity-80" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">What I Deliver</div>
                    <div className="text-xs text-zinc-500">
                      Focused and premium
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
                    <div className="text-xs text-zinc-500">UI Quality</div>
                    <div className="text-sm mt-1">
                      {content.deliver_values.ui_quality}
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
                    <div className="text-xs text-zinc-500">Mindset</div>
                    <div className="text-sm mt-1">
                      {content.deliver_values.mindset}
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
                    <div className="text-xs text-zinc-500">Direction</div>
                    <div className="text-sm mt-1">
                      {content.deliver_values.direction}
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3">
                    <div className="text-xs text-zinc-500">Experience</div>
                    <div className="text-sm mt-1">
                      {content.deliver_values.experience}
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>

          {siteSettings.about.show_gaming ? (
            <Card className="p-6 card-shine glow vibe-cyber lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl border border-zinc-800 bg-zinc-900/30 grid place-items-center">
                    <Gamepad2 size={18} className="opacity-80" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">
                      Gaming Experience
                    </div>
                    <div className="text-xs text-zinc-500">
                      {content.gaming_tagline}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
                  {content.gaming_chips.map((chip) => (
                    <span key={chip} className="chip chip-mini">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                  <div className="text-xs text-zinc-500">Experience</div>
                  <div className="text-sm mt-1">{content.gaming_experience}</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                  <div className="text-xs text-zinc-500">Strengths</div>
                  <div className="text-sm mt-1">{content.gaming_strengths}</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                  <div className="text-xs text-zinc-500">Training</div>
                  <div className="text-sm mt-1">{content.gaming_training}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                  <div className="text-xs text-zinc-500">Primary Games</div>
                  <div className="text-sm mt-2 flex flex-wrap gap-2">
                    {content.gaming_games.map((game) => (
                      <span key={game} className="chip chip-mini">
                        {game}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                  <div className="text-xs text-zinc-500">History</div>
                  <div className="text-sm mt-1">{content.gaming_history}</div>
                </div>
              </div>
            </Card>
          ) : null}
          </div>
        </LazySection>
      )}

      {(siteSettings.about.show_skill_stack ||
        siteSettings.about.show_focus) && (
        <LazySection minHeight={240}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {siteSettings.about.show_skill_stack ? (
            <Card className="p-6 border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Layers size={18} className="opacity-80" />
                    Skill Stack
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2">
                    Tools and focus areas used to ship polished UI fast.
                  </p>
                </div>
                <span className="text-xs text-zinc-500">Updated</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {content.skill_stack.map((chip) => (
                  <span key={chip} className="chip chip-mini">
                    {chip}
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          {siteSettings.about.show_focus ? (
            <Card className="p-6 border-zinc-800 bg-zinc-950/60">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap size={18} className="opacity-80" />
                Current Focus
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                Building forward with AI and stronger web systems.
              </p>
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                {content.current_focus.map((item, idx) => (
                  <div
                    key={`focus-${idx}`}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {siteSettings.about.show_focus ? (
            <Card className="p-6 border-zinc-800 bg-zinc-950/60">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles size={18} className="opacity-80" />
                {content.journey_title}
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                A quick snapshot of progress and direction.
              </p>
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                {content.journey_items.map((item, idx) => (
                  <div
                    key={`journey-${idx}`}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
          </div>
        </LazySection>
      )}

      {siteSettings.about.show_principles ? (
        <LazySection minHeight={200}>
          <Card className="p-6 border-zinc-800 bg-zinc-950/70">
            <div className="flex items-center gap-2">
              <Shield size={18} className="opacity-80" />
              <h2 className="text-lg font-semibold">Principles</h2>
            </div>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
              {content.principles_line}
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {content.principles_items.map((item, idx) => (
                <div
                  key={`principle-${idx}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-3"
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </LazySection>
      ) : null}
    </div>
  );
}
