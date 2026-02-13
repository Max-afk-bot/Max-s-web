"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { supabase } from "@/lib/supabaseClient";
import {
  defaultSiteSettings,
  normalizeSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

type DiscordConfig = {
  guild_id: string;
  member_role_id: string;
  team_role_id: string;
};

type EnvReady = {
  client_id: boolean;
  client_secret: boolean;
  redirect_uri: boolean;
  state_secret: boolean;
  bot_token: boolean;
};

const defaultConfig: DiscordConfig = {
  guild_id: "",
  member_role_id: "",
  team_role_id: "",
};

const defaultEnvReady: EnvReady = {
  client_id: false,
  client_secret: false,
  redirect_uri: false,
  state_secret: false,
  bot_token: false,
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<DiscordConfig>(defaultConfig);
  const [envReady, setEnvReady] = useState<EnvReady>(defaultEnvReady);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSiteSettings);
  const [siteLoading, setSiteLoading] = useState(true);
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteStatus, setSiteStatus] = useState<"idle" | "saved" | "error">(
    "idle"
  );
  const [siteError, setSiteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSiteLoading(true);
    setSiteError(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError("No admin session.");
      setLoading(false);
      setSiteLoading(false);
      return;
    }

    const [discordRes, siteRes] = await Promise.all([
      fetch("/api/admin/discord-config", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/api/admin/site-settings", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const discordBody = (await discordRes.json().catch(() => ({}))) as {
      error?: string;
      config?: DiscordConfig;
      env_ready?: EnvReady;
    };

    if (!discordRes.ok) {
      setError(discordBody.error || "Failed to load admin settings.");
    } else {
      setForm({
        ...defaultConfig,
        ...(discordBody.config || {}),
      });
      setEnvReady({
        ...defaultEnvReady,
        ...(discordBody.env_ready || {}),
      });
    }

    const siteBody = (await siteRes.json().catch(() => ({}))) as {
      error?: string;
      settings?: SiteSettings;
    };

    if (!siteRes.ok) {
      setSiteError(siteBody.error || "Failed to load site settings.");
    } else {
      setSiteSettings(normalizeSiteSettings(siteBody.settings));
    }

    setLoading(false);
    setSiteLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const save = async () => {
    setSaving(true);
    setStatus("idle");
    setError(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setSaving(false);
      setStatus("error");
      setError("No admin session.");
      return;
    }

    const res = await fetch("/api/admin/discord-config", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      config?: DiscordConfig;
    };

    if (!res.ok) {
      setStatus("error");
      setSaving(false);
      setError(body.error || "Save failed.");
      return;
    }

    setForm({
      ...defaultConfig,
      ...(body.config || form),
    });
    setStatus("saved");
    setSaving(false);
  };

  const saveSite = async () => {
    setSiteSaving(true);
    setSiteStatus("idle");
    setSiteError(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setSiteSaving(false);
      setSiteStatus("error");
      setSiteError("No admin session.");
      return;
    }

    const res = await fetch("/api/admin/site-settings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings: siteSettings }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      settings?: SiteSettings;
    };

    if (!res.ok) {
      setSiteStatus("error");
      setSiteSaving(false);
      setSiteError(body.error || "Save failed.");
      return;
    }

    setSiteSettings(normalizeSiteSettings(body.settings));
    setSiteStatus("saved");
    setSiteSaving(false);
  };

  const toggle = (
    section: keyof SiteSettings,
    key: string,
    value?: boolean
  ) => {
    setSiteSettings((prev) => {
      const group = prev[section] as Record<string, unknown>;
      const current = Boolean(group[key]);
      return {
        ...prev,
        [section]: {
          ...group,
          [key]: value ?? !current,
        },
      } as SiteSettings;
    });
  };

  const envItems: Array<{ label: string; ready: boolean }> = [
    { label: "DISCORD_CLIENT_ID", ready: envReady.client_id },
    { label: "DISCORD_CLIENT_SECRET", ready: envReady.client_secret },
    { label: "DISCORD_REDIRECT_URI", ready: envReady.redirect_uri },
    { label: "DISCORD_OAUTH_STATE_SECRET", ready: envReady.state_secret },
    { label: "DISCORD_BOT_TOKEN", ready: envReady.bot_token },
  ];

  return (
    <div className="space-y-6 animate-pageIn">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Admin Settings</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage Discord role gates without editing env for IDs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={load} disabled={loading || saving}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button onClick={save} disabled={loading || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {status === "saved" ? (
        <p className="text-xs text-emerald-400">Saved successfully.</p>
      ) : null}
      {status === "error" || error ? (
        <p className="text-xs text-red-400">{error || "Error."}</p>
      ) : null}

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold">Discord Runtime Config</h3>
        <p className="text-xs text-zinc-500">
          `member_role_id` empty means any server member can see member-level intel.
        </p>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Guild ID</p>
          <Input
            value={form.guild_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, guild_id: e.target.value }))
            }
            placeholder="Discord server (guild) ID"
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Member Role ID (optional)</p>
          <Input
            value={form.member_role_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, member_role_id: e.target.value }))
            }
            placeholder="Role ID for member access"
          />
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Team Role ID</p>
          <Input
            value={form.team_role_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, team_role_id: e.target.value }))
            }
            placeholder="Role ID for team-only access"
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Site Visibility</h3>
            <p className="text-xs text-zinc-500">
              Toggle page sections without redeploying.
            </p>
          </div>
          <Button onClick={saveSite} disabled={siteLoading || siteSaving}>
            {siteSaving ? "Saving..." : "Save Site"}
          </Button>
        </div>

        {siteStatus === "saved" ? (
          <p className="text-xs text-emerald-400">Site settings saved.</p>
        ) : null}
        {siteStatus === "error" || siteError ? (
          <p className="text-xs text-red-400">{siteError || "Error."}</p>
        ) : null}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Maintenance Mode</div>
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={siteSettings.maintenance.enabled}
                onChange={(e) =>
                  toggle("maintenance", "enabled", e.target.checked)
                }
              />
              Enabled
            </label>
          </div>
          <Input
            placeholder="Maintenance message"
            value={siteSettings.maintenance.message}
            onChange={(e) =>
              setSiteSettings((prev) => ({
                ...prev,
                maintenance: { ...prev.maintenance, message: e.target.value },
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Navigation
            </div>
            {[
              ["show_about", "About"],
              ["show_gaming", "Gaming"],
              ["show_projects", "Projects"],
              ["show_contact", "Contact"],
              ["show_social", "Social"],
              ["show_documentation", "Docs"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(siteSettings.nav[key as keyof SiteSettings["nav"]])}
                  onChange={(e) => toggle("nav", key, e.target.checked)}
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Dashboard
            </div>
            {[
              ["show_intro", "Intro"],
              ["show_stats", "Stats"],
              ["show_quick_links", "Quick links"],
              ["show_sections", "Sections grid"],
              ["show_profile_hint", "Profile hint"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(
                    siteSettings.dashboard[key as keyof SiteSettings["dashboard"]]
                  )}
                  onChange={(e) => toggle("dashboard", key, e.target.checked)}
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              About
            </div>
            {[
              ["show_programming", "Programming"],
              ["show_gaming", "Gaming"],
              ["show_skill_stack", "Skill stack"],
              ["show_focus", "Current focus"],
              ["show_principles", "Principles"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(
                    siteSettings.about[key as keyof SiteSettings["about"]]
                  )}
                  onChange={(e) => toggle("about", key, e.target.checked)}
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Projects
            </div>
            {[
              ["show_completed", "Completed"],
              ["show_active", "Active"],
              ["show_pipeline", "Pipeline"],
              ["show_timeline", "Timeline"],
              ["show_milestones", "Milestones"],
              ["show_gallery", "Gallery"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(
                    siteSettings.projects[key as keyof SiteSettings["projects"]]
                  )}
                  onChange={(e) => toggle("projects", key, e.target.checked)}
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Contact
            </div>
            {[
              ["show_form", "Form"],
              ["show_socials", "Socials"],
              ["show_availability", "Availability"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(
                    siteSettings.contact[key as keyof SiteSettings["contact"]]
                  )}
                  onChange={(e) => toggle("contact", key, e.target.checked)}
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Footer
            </div>
            <label className="flex items-center justify-between">
              <span>Docs links</span>
              <input
                type="checkbox"
                checked={siteSettings.footer.show_docs}
                onChange={(e) => toggle("footer", "show_docs", e.target.checked)}
              />
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <h3 className="text-sm font-semibold">Server Secret Env Status</h3>
        <p className="text-xs text-zinc-500">
          These must still be set in server env. IDs above are now admin-editable.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {envItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-xs flex items-center justify-between"
            >
              <span className="text-zinc-300">{item.label}</span>
              <span className={item.ready ? "text-emerald-400" : "text-red-400"}>
                {item.ready ? "ready" : "missing"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-zinc-400">
          Gate texts are managed in `Admin → Gaming`.
        </p>
      </Card>
    </div>
  );
}
