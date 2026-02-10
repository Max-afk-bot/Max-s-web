import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "@/lib/admin";
import {
  noStoreJson,
  rateLimit,
  rejectInvalidOrigin,
  rejectNonJson,
} from "@/lib/apiSecurity";
import { resolveDiscordRuntimeConfig } from "@/lib/discordConfig";
import { discordEnv } from "@/lib/discordServer";

type ConfigBody = {
  guild_id?: unknown;
  member_role_id?: unknown;
  team_role_id?: unknown;
};

function cleanField(value: unknown, max = 100) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
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
    return { ok: false as const, error: noStoreJson({ error: "Missing auth token." }, 401) };
  }
  const token = auth.slice(7);
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return { ok: false as const, error: noStoreJson({ error: "Invalid session." }, 401) };
  }

  const email = userData.user.email?.toLowerCase() || "";
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return { ok: false as const, error: noStoreJson({ error: "Forbidden." }, 403) };
  }

  return { ok: true as const, admin };
}

export async function GET(req: Request) {
  const rateError = rateLimit(req, "admin-discord-config-get", 120, 10 * 60 * 1000);
  if (rateError) return rateError;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.error;

  const env = discordEnv();
  const runtime = await resolveDiscordRuntimeConfig(auth.admin);

  return noStoreJson({
    config: {
      guild_id: runtime.guildId,
      member_role_id: runtime.memberRoleId,
      team_role_id: runtime.teamRoleId,
    },
    env_ready: {
      client_id: Boolean(env.clientId),
      client_secret: Boolean(env.clientSecret),
      redirect_uri: Boolean(env.redirectUri),
      state_secret: Boolean(env.stateSecret),
      bot_token: Boolean(env.botToken),
    },
  });
}

export async function POST(req: Request) {
  const originError = rejectInvalidOrigin(req);
  if (originError) return originError;

  const contentTypeError = rejectNonJson(req);
  if (contentTypeError) return contentTypeError;

  const rateError = rateLimit(req, "admin-discord-config-post", 30, 10 * 60 * 1000);
  if (rateError) return rateError;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.error;

  let body: ConfigBody;
  try {
    body = (await req.json()) as ConfigBody;
  } catch {
    return noStoreJson({ error: "Invalid JSON." }, 400);
  }

  const guildId = cleanField(body.guild_id);
  const memberRoleId = cleanField(body.member_role_id);
  const teamRoleId = cleanField(body.team_role_id);

  if (!guildId) {
    return noStoreJson({ error: "Guild ID is required." }, 400);
  }

  const payload = {
    guild_id: guildId,
    member_role_id: memberRoleId,
    team_role_id: teamRoleId,
  };

  const { error } = await auth.admin.from("admin_system_settings").upsert(
    {
      key: "discord",
      value: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    if (error.code === "42P01") {
      return noStoreJson(
        {
          error:
            "Table admin_system_settings is missing. Run SQL from data/admin_system_settings.sql.",
        },
        500
      );
    }
    return noStoreJson({ error: error.message || "Failed to save config." }, 500);
  }

  return noStoreJson({ ok: true, config: payload });
}
