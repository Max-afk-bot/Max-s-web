"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";
import {
  defaultGamingContent,
  fetchGamingContent,
  upsertGamingContent,
  type GamingContent,
} from "@/lib/gaming";

type WeeklyReportForm = {
  week_label: string;
  period_start: string;
  period_end: string;
  matches_played: number;
  wins: number;
  current_streak: number;
  best_streak: number;
  mode_skywars: number;
  mode_bedwars: number;
  mode_hardcore: number;
  mode_speedrun: number;
  mode_pvp: number;
  mode_build: number;
  notes: string;
};

const defaultWeeklyReport: WeeklyReportForm = {
  week_label: "",
  period_start: "",
  period_end: "",
  matches_played: 0,
  wins: 0,
  current_streak: 0,
  best_streak: 0,
  mode_skywars: 0,
  mode_bedwars: 0,
  mode_hardcore: 0,
  mode_speedrun: 0,
  mode_pvp: 0,
  mode_build: 0,
  notes: "",
};

const clampPercent = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)));

const ratioPercent = (value: number, total: number) =>
  total <= 0 ? 0 : clampPercent((value / total) * 100);

export default function AdminGamingPage() {
  const [form, setForm] = useState<GamingContent>(defaultGamingContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReportForm>(defaultWeeklyReport);
  const [weeklyStatus, setWeeklyStatus] = useState<
    "idle" | "loading" | "saving" | "saved" | "error"
  >("idle");
  const [weeklyError, setWeeklyError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchGamingContent().then((data) => {
      if (!mounted || !data) return;
      setForm({ ...defaultGamingContent, ...data });
    });

    (async () => {
      setWeeklyStatus("loading");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (!mounted) return;
        setWeeklyStatus("error");
        setWeeklyError("No admin session.");
        return;
      }

      const res = await fetch("/api/admin/gaming-weekly-report", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        report?: WeeklyReportForm | null;
      };

      if (!mounted) return;
      if (!res.ok) {
        setWeeklyStatus("error");
        setWeeklyError(body.error || "Failed to load weekly report.");
        return;
      }
      if (body.report) {
        setWeekly({
          ...defaultWeeklyReport,
          ...body.report,
          notes: String(body.report.notes || ""),
        });
      }
      setWeeklyStatus("idle");
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const save = async () => {
    setStatus("saving");
    setError(null);
    const { error } = await upsertGamingContent(form);
    if (error) {
      setStatus("error");
      setError(error.message || "Save failed.");
      return;
    }
    setStatus("saved");
  };

  const saveWeekly = async () => {
    setWeeklyStatus("saving");
    setWeeklyError(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setWeeklyStatus("error");
      setWeeklyError("No admin session.");
      return;
    }

    const res = await fetch("/api/admin/gaming-weekly-report", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(weekly),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      report?: WeeklyReportForm;
    };

    if (!res.ok) {
      setWeeklyStatus("error");
      setWeeklyError(body.error || "Failed to save weekly report.");
      return;
    }

    if (body.report) {
      setWeekly({
        ...defaultWeeklyReport,
        ...body.report,
        notes: String(body.report.notes || ""),
      });
    }
    setWeeklyStatus("saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Gaming Page</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Control gaming content, Discord gate, and team request flow.
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
      {weeklyStatus === "saved" ? (
        <p className="text-xs text-emerald-400">Weekly report saved.</p>
      ) : null}
      {weeklyStatus === "error" ? (
        <p className="text-xs text-red-400">{weeklyError}</p>
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
            <p className="text-xs text-zinc-500 mb-2">Intro</p>
            <textarea
              className="w-full min-h-[120px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              value={form.hero_intro}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hero_intro: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Weekly note</p>
            <Input
              value={form.weekly_note}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, weekly_note: e.target.value }))
              }
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Community & Gate</h3>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Discord URL</p>
            <Input
              value={form.discord_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, discord_url: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Community title</p>
            <Input
              value={form.community_title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, community_title: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Community text</p>
            <textarea
              className="w-full min-h-[100px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              value={form.community_text}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, community_text: e.target.value }))
              }
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.require_discord_gate}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  require_discord_gate: e.target.checked,
                }))
              }
            />
            Require Discord gate for full details
          </label>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Gate title</p>
            <Input
              value={form.gate_title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, gate_title: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Gate text</p>
            <textarea
              className="w-full min-h-[100px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              value={form.gate_text}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, gate_text: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Team gate title</p>
            <Input
              value={form.team_gate_title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  team_gate_title: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Team gate text</p>
            <textarea
              className="w-full min-h-[90px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              value={form.team_gate_text}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  team_gate_text: e.target.value,
                }))
              }
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Core Profile Fields</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Focus game</p>
              <Input
                value={form.focus_game}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, focus_game: e.target.value }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Rank label</p>
              <Input
                value={form.rank_label}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, rank_label: e.target.value }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Primary platform</p>
              <Input
                value={form.primary_platform}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    primary_platform: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Years experience</p>
              <Input
                value={form.years_experience}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    years_experience: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">
              Play style tags (comma separated)
            </p>
            <Input
              value={form.play_style_tags.join(", ")}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  play_style_tags: e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">
              Weapons (comma separated)
            </p>
            <Input
              value={form.weapons.join(", ")}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  weapons: e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Skills summary</p>
            <textarea
              className="w-full min-h-[90px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              value={form.skills_summary}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, skills_summary: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Training focus</p>
            <Input
              value={form.training_focus}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, training_focus: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Other games note</p>
            <Input
              value={form.other_games_note}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  other_games_note: e.target.value,
                }))
              }
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Clips + Team Form</h3>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Clip title</p>
            <Input
              value={form.clip_title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, clip_title: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">YouTube clip URL</p>
            <Input
              value={form.clip_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, clip_url: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Team form intro</p>
            <textarea
              className="w-full min-h-[100px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
              value={form.team_form_intro}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, team_form_intro: e.target.value }))
              }
            />
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          onClick={saveWeekly}
          disabled={weeklyStatus === "saving" || weeklyStatus === "loading"}
        >
          {weeklyStatus === "saving" ? "Saving weekly..." : "Save weekly report"}
        </Button>
        <Button onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Weekly Real Data</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Drives live backend stats on the gaming page.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={saveWeekly}
            disabled={weeklyStatus === "saving" || weeklyStatus === "loading"}
          >
            {weeklyStatus === "saving" ? "Saving..." : "Save weekly data"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-2">Week label</p>
            <Input
              value={weekly.week_label}
              onChange={(e) =>
                setWeekly((prev) => ({ ...prev, week_label: e.target.value }))
              }
              placeholder="2026-W06"
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Period start</p>
            <Input
              type="date"
              value={weekly.period_start}
              onChange={(e) =>
                setWeekly((prev) => ({ ...prev, period_start: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Period end</p>
            <Input
              type="date"
              value={weekly.period_end}
              onChange={(e) =>
                setWeekly((prev) => ({ ...prev, period_end: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Matches played</p>
            <Input
              type="number"
              value={weekly.matches_played}
              onChange={(e) =>
                setWeekly((prev) => ({
                  ...prev,
                  matches_played: Number(e.target.value || 0),
                }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Wins</p>
            <Input
              type="number"
              value={weekly.wins}
              onChange={(e) =>
                setWeekly((prev) => ({ ...prev, wins: Number(e.target.value || 0) }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Current streak</p>
            <Input
              type="number"
              value={weekly.current_streak}
              onChange={(e) =>
                setWeekly((prev) => ({
                  ...prev,
                  current_streak: Number(e.target.value || 0),
                }))
              }
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Best streak</p>
            <Input
              type="number"
              value={weekly.best_streak}
              onChange={(e) =>
                setWeekly((prev) => ({
                  ...prev,
                  best_streak: Number(e.target.value || 0),
                }))
              }
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 mb-2">
            Mode matches (weekly)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Skywars</p>
              <Input
                type="number"
                value={weekly.mode_skywars}
                onChange={(e) =>
                  setWeekly((prev) => ({
                    ...prev,
                    mode_skywars: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Bedwars</p>
              <Input
                type="number"
                value={weekly.mode_bedwars}
                onChange={(e) =>
                  setWeekly((prev) => ({
                    ...prev,
                    mode_bedwars: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Hardcore</p>
              <Input
                type="number"
                value={weekly.mode_hardcore}
                onChange={(e) =>
                  setWeekly((prev) => ({
                    ...prev,
                    mode_hardcore: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Speedrun</p>
              <Input
                type="number"
                value={weekly.mode_speedrun}
                onChange={(e) =>
                  setWeekly((prev) => ({
                    ...prev,
                    mode_speedrun: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">PvP</p>
              <Input
                type="number"
                value={weekly.mode_pvp}
                onChange={(e) =>
                  setWeekly((prev) => ({
                    ...prev,
                    mode_pvp: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Build/Creative</p>
              <Input
                type="number"
                value={weekly.mode_build}
                onChange={(e) =>
                  setWeekly((prev) => ({
                    ...prev,
                    mode_build: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 mb-2">Notes</p>
          <textarea
            className="w-full min-h-[90px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-700"
            value={weekly.notes}
            onChange={(e) =>
              setWeekly((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Weekly summary, highlights, or improvements..."
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-xs text-zinc-400">
          Metrics like Attack, Defense, Strategies, Mid Game Skill Use, and Loss
          Rate are now auto-calculated from match totals + mode counts. You don’t
          need to enter percentages anymore.
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
            {(() => {
              const total =
                weekly.mode_skywars +
                weekly.mode_bedwars +
                weekly.mode_hardcore +
                weekly.mode_speedrun +
                weekly.mode_pvp +
                weekly.mode_build;
              const winRate =
                weekly.matches_played > 0
                  ? (weekly.wins / weekly.matches_played) * 100
                  : 0;
              const attack = ratioPercent(
                weekly.mode_pvp + weekly.mode_skywars + weekly.mode_bedwars,
                total
              );
              const defense = ratioPercent(
                weekly.mode_hardcore +
                  weekly.mode_bedwars +
                  weekly.mode_build * 0.5,
                total
              );
              const strategies = ratioPercent(
                weekly.mode_speedrun +
                  weekly.mode_hardcore +
                  weekly.mode_build * 0.7,
                total
              );
              const midGame = ratioPercent(
                weekly.mode_pvp + weekly.mode_skywars + weekly.mode_speedrun * 0.4,
                total
              );
              const lossRate = clampPercent(100 - winRate);
              const items = [
                { label: "Attack", value: attack },
                { label: "Defense", value: defense },
                { label: "Strategies", value: strategies },
                { label: "Mid Game", value: midGame },
                { label: "Loss Rate", value: lossRate },
              ];
              return items.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-zinc-200">{item.value}%</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </Card>
    </div>
  );
}
