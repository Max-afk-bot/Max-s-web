import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "@/lib/admin";
import {
  noStoreJson,
  rateLimit,
  rejectInvalidOrigin,
  rejectNonJson,
} from "@/lib/apiSecurity";
import { resolveDiscordRuntimeConfig } from "@/lib/discordConfig";
import { addDiscordRoleToMember, discordEnv } from "@/lib/discordServer";

type UpdateBody = {
  id?: unknown;
  status?: unknown;
  admin_note?: unknown;
  grant_role?: unknown;
};

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
  const rateError = rateLimit(req, "admin-team-requests-get", 120, 10 * 60 * 1000);
  if (rateError) return rateError;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.error;

  const { data, error } = await auth.admin
    .from("team_requests")
    .select(
      "id, user_id, name, email, discord_username, discord_user_id, role, experience, message, status, admin_note, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return noStoreJson({ error: error.message || "Failed to load requests." }, 500);
  }

  return noStoreJson({ requests: data ?? [] });
}

export async function POST(req: Request) {
  const originError = rejectInvalidOrigin(req);
  if (originError) return originError;

  const contentTypeError = rejectNonJson(req);
  if (contentTypeError) return contentTypeError;

  const rateError = rateLimit(req, "admin-team-requests-post", 30, 10 * 60 * 1000);
  if (rateError) return rateError;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.error;

  let body: UpdateBody;
  try {
    body = (await req.json()) as UpdateBody;
  } catch {
    return noStoreJson({ error: "Invalid JSON." }, 400);
  }

  const id = Number(body.id);
  const status = String(body.status || "").trim();
  const adminNote = String(body.admin_note || "").trim().slice(0, 1000);
  const grantRole = Boolean(body.grant_role);

  if (!id || Number.isNaN(id)) {
    return noStoreJson({ error: "Request id is required." }, 400);
  }

  if (!["pending", "approved", "rejected"].includes(status)) {
    return noStoreJson({ error: "Invalid status value." }, 400);
  }

  let roleGranted = false;
  if (grantRole) {
    const { data: requestRow, error } = await auth.admin
      .from("team_requests")
      .select("id, discord_user_id")
      .eq("id", id)
      .maybeSingle();

    if (error || !requestRow) {
      return noStoreJson({ error: "Request not found." }, 404);
    }

    if (!requestRow.discord_user_id) {
      return noStoreJson(
        { error: "Discord user not linked. Ask the user to connect Discord first." },
        400
      );
    }

    const runtime = await resolveDiscordRuntimeConfig(auth.admin);
    const env = discordEnv();
    if (!runtime.guildId || !runtime.teamRoleId || !env.botToken) {
      return noStoreJson(
        { error: "Discord guild/team role/bot token is not configured." },
        500
      );
    }

    const addRes = await addDiscordRoleToMember(
      runtime.guildId,
      requestRow.discord_user_id,
      runtime.teamRoleId,
      env.botToken
    );

    if (!addRes.ok) {
      const msg =
        (addRes.body as { message?: string })?.message ||
        "Failed to assign Discord role.";
      return noStoreJson({ error: msg }, 502);
    }

    roleGranted = true;
  }

  const { error: updateError } = await auth.admin
    .from("team_requests")
    .update({
      status,
      admin_note: adminNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return noStoreJson({ error: updateError.message || "Update failed." }, 500);
  }

  return noStoreJson({ ok: true, role_granted: roleGranted });
}
