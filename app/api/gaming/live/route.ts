import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { noStoreJson, rateLimit } from "@/lib/apiSecurity";
import { resolveDiscordRuntimeConfig } from "@/lib/discordConfig";
import {
  discordEnv,
  fetchDiscordGuildMemberWithBot,
  fetchDiscordGuildWithBot,
} from "@/lib/discordServer";

type WeeklyRow = {
  week_label: string;
  period_start: string;
  period_end: string;
  matches_played: number;
  wins: number;
  current_streak: number;
  best_streak: number;
  attack: number;
  defense: number;
  loss_rate: number;
  strategies: number;
  mid_game_skill_use: number;
  mode_skywars: number;
  mode_bedwars: number;
  mode_hardcore: number;
  mode_speedrun: number;
  mode_pvp: number;
  mode_build: number;
  notes: string | null;
  updated_at: string;
};

async function hasTeamAccess(
  admin: SupabaseClient,
  userId: string,
  email?: string | null
) {
  if (isAdminEmail(email)) return true;

  const runtime = await resolveDiscordRuntimeConfig(admin);
  const env = discordEnv();
  if (!runtime.guildId || !env.botToken) return false;

  const { data: linkData, error: linkError } = await admin
    .from("discord_links")
    .select("discord_user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (linkError) return false;
  const discordUserId = String((linkData as { discord_user_id?: string } | null)?.discord_user_id || "");
  if (!discordUserId) return false;

  const [memberRes, guildRes] = await Promise.all([
    fetchDiscordGuildMemberWithBot(discordUserId, runtime.guildId, env.botToken),
    fetchDiscordGuildWithBot(runtime.guildId, env.botToken),
  ]);

  if (!memberRes.ok) return false;
  const roles = Array.isArray(memberRes.body?.roles)
    ? (memberRes.body.roles as string[])
    : [];
  const isGuildOwner =
    guildRes.ok && guildRes.body?.owner_id
      ? guildRes.body.owner_id === discordUserId
      : false;

  const hasTeamRole = runtime.teamRoleId
    ? roles.includes(runtime.teamRoleId) || isGuildOwner
    : isGuildOwner;
  return hasTeamRole;
}

export async function GET(req: Request) {
  const rateError = rateLimit(req, "gaming-live-get", 120, 10 * 60 * 1000);
  if (rateError) return rateError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return noStoreJson(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE URL." },
      500
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: historyData, error: reportError } = await admin
    .from("gaming_weekly_reports")
    .select("*")
    .order("period_end", { ascending: false })
    .limit(8);

  if (reportError) {
    if (reportError.code === "42P01") {
      return noStoreJson({
        report_public: null,
        history_public: [],
        history_team: [],
        mode_breakdown: null,
        team_metrics: null,
        can_view_team_metrics: false,
        error:
          "Table gaming_weekly_reports is missing. Run SQL from data/gaming_weekly_reports.sql.",
      });
    }
    return noStoreJson(
      {
        report_public: null,
        history_public: [],
        history_team: [],
        mode_breakdown: null,
        team_metrics: null,
        can_view_team_metrics: false,
        error: reportError.message || "Failed to load live gaming data.",
      },
      500
    );
  }

  const historyRows = ((historyData ?? []) as WeeklyRow[]).filter(Boolean);
  const report = historyRows.length ? historyRows[0] : null;

  let canViewTeamMetrics = false;
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (!userError && userData?.user) {
      canViewTeamMetrics = await hasTeamAccess(
        admin,
        userData.user.id,
        userData.user.email
      );
    }
  }

  const reportPublic = report
    ? {
        week_label: report.week_label,
        period_start: report.period_start,
        period_end: report.period_end,
        matches_played: report.matches_played,
        wins: report.wins,
        current_streak: report.current_streak,
        best_streak: report.best_streak,
        notes: report.notes,
        updated_at: report.updated_at,
      }
    : null;

  const historyPublic = historyRows
    .slice()
    .reverse()
    .map((row) => ({
      week_label: row.week_label,
      period_end: row.period_end,
      matches_played: row.matches_played,
      wins: row.wins,
      win_rate:
        row.matches_played > 0
          ? Math.round((row.wins / row.matches_played) * 100)
          : 0,
      current_streak: row.current_streak,
    }));

  const teamMetrics =
    report && canViewTeamMetrics
      ? {
          attack: report.attack,
          defense: report.defense,
          loss_rate: report.loss_rate,
          strategies: report.strategies,
          mid_game_skill_use: report.mid_game_skill_use,
        }
      : null;

  const modeBreakdown =
    report && canViewTeamMetrics
      ? {
          skywars: report.mode_skywars,
          bedwars: report.mode_bedwars,
          hardcore: report.mode_hardcore,
          speedrun: report.mode_speedrun,
          pvp: report.mode_pvp,
          build: report.mode_build,
        }
      : null;

  const historyTeam =
    canViewTeamMetrics && historyRows.length
      ? historyRows
          .slice()
          .reverse()
          .map((row) => ({
            week_label: row.week_label,
            attack: row.attack,
            defense: row.defense,
            loss_rate: row.loss_rate,
            strategies: row.strategies,
            mid_game_skill_use: row.mid_game_skill_use,
          }))
      : [];

  return noStoreJson({
    report_public: reportPublic,
    history_public: historyPublic,
    history_team: historyTeam,
    mode_breakdown: modeBreakdown,
    team_metrics: teamMetrics,
    can_view_team_metrics: canViewTeamMetrics,
  });
}
