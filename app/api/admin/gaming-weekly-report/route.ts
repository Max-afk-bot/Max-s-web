import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "@/lib/admin";
import {
  noStoreJson,
  rateLimit,
  rejectInvalidOrigin,
  rejectNonJson,
} from "@/lib/apiSecurity";

type WeeklyReportBody = {
  week_label?: unknown;
  period_start?: unknown;
  period_end?: unknown;
  matches_played?: unknown;
  wins?: unknown;
  current_streak?: unknown;
  best_streak?: unknown;
  attack?: unknown;
  defense?: unknown;
  loss_rate?: unknown;
  strategies?: unknown;
  mid_game_skill_use?: unknown;
  mode_skywars?: unknown;
  mode_bedwars?: unknown;
  mode_hardcore?: unknown;
  mode_speedrun?: unknown;
  mode_pvp?: unknown;
  mode_build?: unknown;
  notes?: unknown;
};

function asText(value: unknown, max = 200) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function asInt(value: unknown, min: number, max: number) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function clampPercent(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function ratioPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return clampPercent((value / total) * 100);
}

async function requireAdmin(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return {
      ok: false as const,
      error: noStoreJson(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE URL." },
        500
      ),
    };
  }

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return {
      ok: false as const,
      error: noStoreJson({ error: "Missing auth token." }, 401),
    };
  }
  const token = auth.slice(7);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return {
      ok: false as const,
      error: noStoreJson({ error: "Invalid session." }, 401),
    };
  }

  const email = userData.user.email?.toLowerCase() || "";
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return {
      ok: false as const,
      error: noStoreJson({ error: "Forbidden." }, 403),
    };
  }

  return { ok: true as const, admin };
}

export async function GET(req: Request) {
  const rateError = rateLimit(req, "admin-gaming-weekly-get", 120, 10 * 60 * 1000);
  if (rateError) return rateError;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.error;

  const { data, error } = await auth.admin
    .from("gaming_weekly_reports")
    .select("*")
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return noStoreJson(
        {
          error:
            "Table gaming_weekly_reports is missing. Run SQL from data/gaming_weekly_reports.sql.",
        },
        500
      );
    }
    return noStoreJson({ error: error.message || "Failed to load report." }, 500);
  }

  return noStoreJson({ report: data ?? null });
}

export async function POST(req: Request) {
  const originError = rejectInvalidOrigin(req);
  if (originError) return originError;

  const contentTypeError = rejectNonJson(req);
  if (contentTypeError) return contentTypeError;

  const rateError = rateLimit(req, "admin-gaming-weekly-post", 30, 10 * 60 * 1000);
  if (rateError) return rateError;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.error;

  let body: WeeklyReportBody;
  try {
    body = (await req.json()) as WeeklyReportBody;
  } catch {
    return noStoreJson({ error: "Invalid JSON." }, 400);
  }

  const weekLabel = asText(body.week_label, 50);
  const periodStart = asText(body.period_start, 20);
  const periodEnd = asText(body.period_end, 20);

  if (!weekLabel || !periodStart || !periodEnd) {
    return noStoreJson(
      { error: "week_label, period_start, and period_end are required." },
      400
    );
  }

  const payload = {
    week_label: weekLabel,
    period_start: periodStart,
    period_end: periodEnd,
    matches_played: asInt(body.matches_played, 0, 100000),
    wins: asInt(body.wins, 0, 100000),
    current_streak: asInt(body.current_streak, 0, 100000),
    best_streak: asInt(body.best_streak, 0, 100000),
    mode_skywars: asInt(body.mode_skywars, 0, 100000),
    mode_bedwars: asInt(body.mode_bedwars, 0, 100000),
    mode_hardcore: asInt(body.mode_hardcore, 0, 100000),
    mode_speedrun: asInt(body.mode_speedrun, 0, 100000),
    mode_pvp: asInt(body.mode_pvp, 0, 100000),
    mode_build: asInt(body.mode_build, 0, 100000),
    notes: asText(body.notes, 4000) || null,
  };

  const modeTotal =
    payload.mode_skywars +
    payload.mode_bedwars +
    payload.mode_hardcore +
    payload.mode_speedrun +
    payload.mode_pvp +
    payload.mode_build;

  const winRate =
    payload.matches_played > 0
      ? (payload.wins / payload.matches_played) * 100
      : 0;

  const attack = ratioPercent(
    payload.mode_pvp + payload.mode_skywars + payload.mode_bedwars,
    modeTotal
  );
  const defense = ratioPercent(
    payload.mode_hardcore + payload.mode_bedwars + payload.mode_build * 0.5,
    modeTotal
  );
  const strategies = ratioPercent(
    payload.mode_speedrun +
      payload.mode_hardcore +
      payload.mode_build * 0.7,
    modeTotal
  );
  const midGame = ratioPercent(
    payload.mode_pvp + payload.mode_skywars + payload.mode_speedrun * 0.4,
    modeTotal
  );
  const lossRate = clampPercent(100 - winRate);

  const payloadWithMetrics = {
    ...payload,
    attack,
    defense,
    loss_rate: lossRate,
    strategies,
    mid_game_skill_use: midGame,
  };

  const { data, error } = await auth.admin
    .from("gaming_weekly_reports")
    .upsert(payloadWithMetrics, { onConflict: "week_label" })
    .select("*")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return noStoreJson(
        {
          error:
            "Table gaming_weekly_reports is missing. Run SQL from data/gaming_weekly_reports.sql.",
        },
        500
      );
    }
    return noStoreJson({ error: error.message || "Failed to save report." }, 500);
  }

  return noStoreJson({ ok: true, report: data });
}
